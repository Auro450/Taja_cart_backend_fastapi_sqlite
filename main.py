import os
import json
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, Request, Response, HTTPException, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import get_db, init_db
import sqlite3
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def on_startup():
    init_db()

def save_upload_file(upload_file: UploadFile) -> str:
    timestamp = int(time.time() * 1000)
    # Simple unique suffix
    unique_suffix = f"{timestamp}-{os.urandom(4).hex()}"
    _, ext = os.path.splitext(upload_file.filename)
    filename = f"{unique_suffix}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return f"/uploads/{filename}"

# --- ORDERS API ---

@app.post("/api/orders")
async def create_order(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    order_id = data.get("id")
    date = data.get("date")
    items = data.get("items", [])
    grandTotal = data.get("grandTotal")
    deliveryDetails = data.get("deliveryDetails", {})
    userEmail = deliveryDetails.get("email", "")
    userPhone = deliveryDetails.get("phone", "")
    status = "Placed"

    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO orders (id, date, items, grandTotal, deliveryDetails, userEmail, userPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (order_id, date, json.dumps(items), grandTotal, json.dumps(deliveryDetails), userEmail, userPhone, status)
    )
    db.commit()
    return {"message": "Order created successfully", "id": order_id}

@app.get("/api/orders")
def get_orders(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY date DESC")
    orders = cursor.fetchall()
    for o in orders:
        o["items"] = json.loads(o["items"]) if o["items"] else []
        o["deliveryDetails"] = json.loads(o["deliveryDetails"]) if o["deliveryDetails"] else {}
    return orders

@app.get("/api/orders/user/{phone}")
def get_user_orders(phone: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM orders WHERE userPhone = ? ORDER BY date DESC", (phone,))
    orders = cursor.fetchall()
    for o in orders:
        o["items"] = json.loads(o["items"]) if o["items"] else []
        o["deliveryDetails"] = json.loads(o["deliveryDetails"]) if o["deliveryDetails"] else {}
    return orders

@app.patch("/api/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    status = data.get("status")
    eta = data.get("eta")

    cursor = db.cursor()
    if eta is not None:
        cursor.execute("UPDATE orders SET status = ?, eta = ? WHERE id = ?", (status, eta, order_id))
    else:
        cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    db.commit()
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully", "id": order_id, "status": status, "eta": eta}

@app.delete("/api/orders/{order_id}")
def delete_order(order_id: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully", "id": order_id}

@app.patch("/api/orders/{order_id}/rate")
async def rate_order(order_id: str, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    rating = data.get("rating")
    review = data.get("review")

    cursor = db.cursor()
    cursor.execute("UPDATE orders SET rating = ?, review = ? WHERE id = ?", (rating, review, order_id))
    if cursor.rowcount == 0:
        db.commit()
        raise HTTPException(status_code=404, detail="Order not found")
    
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    if order:
        try:
            details = json.loads(order["deliveryDetails"]) if order["deliveryDetails"] else {}
            customer_name = details.get("name", "Anonymous")
            cursor.execute('''INSERT INTO reviews (customer_name, rating, text, is_featured, order_id) VALUES (?, ?, ?, 0, ?)
                              ON CONFLICT(order_id) DO UPDATE SET rating = excluded.rating, text = excluded.text''',
                           (customer_name, rating, review, order_id))
        except Exception:
            pass
    db.commit()
    return {"message": "Order rated successfully", "id": order_id, "rating": rating, "review": review}

# --- ADDRESSES API ---

@app.get("/api/addresses/{email}")
def get_addresses(email: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM saved_addresses WHERE userEmail = ? ORDER BY id DESC", (email,))
    return cursor.fetchall()

@app.post("/api/addresses")
async def save_address(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    userEmail = data.get("userEmail")
    label = data.get("label")
    address = data.get("address")
    landmark = data.get("landmark")
    lat = data.get("lat")
    lng = data.get("lng")

    if not userEmail or not label or not address or lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    cursor = db.cursor()
    cursor.execute("INSERT INTO saved_addresses (userEmail, label, address, landmark, lat, lng) VALUES (?, ?, ?, ?, ?, ?)",
                   (userEmail, label, address, landmark, lat, lng))
    db.commit()
    return Response(content=json.dumps({"message": "Address saved successfully", "id": cursor.lastrowid}), status_code=201, media_type="application/json")

@app.delete("/api/addresses/{address_id}")
def delete_address(address_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM saved_addresses WHERE id = ?", (address_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted successfully"}

# --- CUSTOMERS API ---

@app.post("/api/customers")
async def save_customer(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    name = data.get("name")
    phone = data.get("phone")
    picture = data.get("picture")
    joinedDate = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())

    cursor = db.cursor()
    cursor.execute('''INSERT INTO customers (email, name, phone, picture, joinedDate) VALUES (?, ?, ?, ?, ?)
                      ON CONFLICT(email) DO UPDATE SET phone=excluded.phone, name=excluded.name, picture=excluded.picture''',
                   (email, name, phone, picture, joinedDate))
    db.commit()
    return {"message": "Customer saved successfully", "email": email}

@app.get("/api/customers/{email}")
def get_customer(email: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM customers WHERE email = ?", (email,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")
    return row

@app.get("/api/customers")
def get_customers(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute('''SELECT c.*, COUNT(o.id) as orderCount 
                      FROM customers c LEFT JOIN orders o ON c.email = o.userEmail 
                      GROUP BY c.email ORDER BY c.joinedDate DESC''')
    return cursor.fetchall()

# --- OFFERS API ---

@app.get("/api/offers")
def get_offers(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM offers ORDER BY valid_until DESC")
    return cursor.fetchall()

@app.post("/api/offers")
async def create_offer(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    code = data.get("code")
    event_name = data.get("event_name")
    discount_percent = data.get("discount_percent")
    valid_until = data.get("valid_until")

    if not code or not event_name or discount_percent is None or not valid_until:
        raise HTTPException(status_code=400, detail="Missing required fields")

    cursor = db.cursor()
    cursor.execute("INSERT INTO offers (code, event_name, discount_percent, valid_until) VALUES (?, ?, ?, ?)",
                   (code, event_name, discount_percent, valid_until))
    db.commit()
    return Response(content=json.dumps({"message": "Offer created", "id": cursor.lastrowid}), status_code=201, media_type="application/json")

@app.put("/api/offers/{offer_id}")
async def update_offer(offer_id: int, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("UPDATE offers SET code = ?, event_name = ?, discount_percent = ?, valid_until = ? WHERE id = ?",
                   (data.get("code"), data.get("event_name"), data.get("discount_percent"), data.get("valid_until"), offer_id))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer updated successfully"}

@app.delete("/api/offers/{offer_id}")
def delete_offer(offer_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM offers WHERE id = ?", (offer_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer deleted successfully"}

# --- SETTINGS API ---

@app.get("/api/settings")
def get_settings(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM settings")
    return cursor.fetchall()

@app.post("/api/settings")
async def update_settings(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (data.get("key"), data.get("value")))
    db.commit()
    return {"message": "Setting updated successfully"}

# --- HUBS API ---

@app.get("/api/hubs")
def get_hubs(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM hubs ORDER BY id DESC")
    return cursor.fetchall()

@app.post("/api/hubs")
async def create_hub(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    name = data.get("name")
    lat = data.get("lat")
    lng = data.get("lng")
    radius_km = data.get("radius_km")
    is_active = data.get("is_active", True)

    if not name or lat is None or lng is None or radius_km is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    cursor = db.cursor()
    cursor.execute("INSERT INTO hubs (name, lat, lng, radius_km, is_active) VALUES (?, ?, ?, ?, ?)",
                   (name, lat, lng, radius_km, 1 if is_active else 0))
    db.commit()
    return Response(content=json.dumps({"message": "Hub created", "id": cursor.lastrowid}), status_code=201, media_type="application/json")

@app.put("/api/hubs/{hub_id}")
async def update_hub(hub_id: int, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("UPDATE hubs SET name = ?, lat = ?, lng = ?, radius_km = ?, is_active = ? WHERE id = ?",
                   (data.get("name"), data.get("lat"), data.get("lng"), data.get("radius_km"), 1 if data.get("is_active") else 0, hub_id))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Hub not found")
    return {"message": "Hub updated successfully"}

@app.delete("/api/hubs/{hub_id}")
def delete_hub(hub_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM hubs WHERE id = ?", (hub_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Hub not found")
    return {"message": "Hub deleted successfully"}

# --- ANNOUNCEMENTS API ---

@app.get("/api/announcements")
def get_announcements(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM announcements")
    return cursor.fetchall()

@app.post("/api/announcements")
async def create_announcement(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    if not data.get("text"):
        raise HTTPException(status_code=400, detail="Missing announcement text")

    cursor = db.cursor()
    cursor.execute("INSERT INTO announcements (text) VALUES (?)", (data.get("text"),))
    db.commit()
    return Response(content=json.dumps({"message": "Announcement created", "id": cursor.lastrowid}), status_code=201, media_type="application/json")

@app.put("/api/announcements/{ann_id}")
async def update_announcement(ann_id: int, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    if not data.get("text"):
        raise HTTPException(status_code=400, detail="Missing announcement text")
    
    cursor = db.cursor()
    cursor.execute("UPDATE announcements SET text = ? WHERE id = ?", (data.get("text"), ann_id))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement updated successfully"}

@app.delete("/api/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM announcements WHERE id = ?", (ann_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted successfully"}

# --- REVIEWS API ---

@app.get("/api/reviews")
def get_reviews(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM reviews ORDER BY id DESC")
    return cursor.fetchall()

@app.get("/api/reviews/featured")
def get_featured_reviews(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM reviews WHERE is_featured = 1 ORDER BY id DESC")
    return cursor.fetchall()

@app.post("/api/reviews")
async def create_review(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("INSERT INTO reviews (customer_name, rating, text, is_featured) VALUES (?, ?, ?, ?)",
                   (data.get("customer_name"), data.get("rating"), data.get("text"), 1 if data.get("is_featured") else 0))
    db.commit()
    return Response(content=json.dumps({"message": "Review created", "id": cursor.lastrowid}), status_code=201, media_type="application/json")

@app.put("/api/reviews/{review_id}")
async def update_review(review_id: int, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("UPDATE reviews SET customer_name = ?, rating = ?, text = ?, is_featured = ? WHERE id = ?",
                   (data.get("customer_name"), data.get("rating"), data.get("text"), 1 if data.get("is_featured") else 0, review_id))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review updated successfully"}

@app.delete("/api/reviews/{review_id}")
def delete_review(review_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted successfully"}

# --- BANNERS API ---

@app.get("/api/banners")
def get_banners(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM banners ORDER BY id DESC")
    return cursor.fetchall()

@app.get("/api/banners/active")
def get_active_banners(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM banners WHERE is_approved = 1 ORDER BY id DESC")
    return cursor.fetchall()

@app.post("/api/banners")
async def create_banner(image: UploadFile = File(...), db: sqlite3.Connection = Depends(get_db)):
    image_url = save_upload_file(image)
    cursor = db.cursor()
    cursor.execute("INSERT INTO banners (image, is_approved) VALUES (?, 0)", (image_url,))
    db.commit()
    return Response(content=json.dumps({"message": "Banner uploaded", "id": cursor.lastrowid, "image": image_url}), status_code=201, media_type="application/json")

@app.put("/api/banners/{banner_id}")
async def update_banner(banner_id: int, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("UPDATE banners SET is_approved = ? WHERE id = ?", (1 if data.get("is_approved") else 0, banner_id))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner updated successfully"}

@app.delete("/api/banners/{banner_id}")
def delete_banner(banner_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM banners WHERE id = ?", (banner_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted successfully"}

# --- NOTIFICATIONS API ---

@app.get("/api/admin/notifications")
def get_admin_notifications(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC")
    return cursor.fetchall()

@app.get("/api/notifications")
def get_active_notifications(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM notifications WHERE is_active = 1 ORDER BY created_at DESC")
    return cursor.fetchall()

@app.post("/api/admin/notifications")
async def create_notification(request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("INSERT INTO notifications (text, is_active) VALUES (?, ?)", (data.get("text"), 1 if data.get("is_active") else 0))
    db.commit()
    return {"id": cursor.lastrowid, "text": data.get("text"), "is_active": 1 if data.get("is_active") else 0}

@app.put("/api/admin/notifications/{notif_id}")
async def update_notification(notif_id: int, request: Request, db: sqlite3.Connection = Depends(get_db)):
    data = await request.json()
    cursor = db.cursor()
    cursor.execute("UPDATE notifications SET text = ?, is_active = ? WHERE id = ?", (data.get("text"), 1 if data.get("is_active") else 0, notif_id))
    db.commit()
    return {"id": notif_id, "text": data.get("text"), "is_active": 1 if data.get("is_active") else 0}

@app.delete("/api/admin/notifications/{notif_id}")
def delete_notification(notif_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM notifications WHERE id = ?", (notif_id,))
    db.commit()
    return {"success": True}

# --- INVENTORY API (Categories & Products) ---

@app.get("/api/categories")
def get_categories(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY id ASC")
    return cursor.fetchall()

@app.post("/api/categories")
async def create_category(name: str = Form(...), image: Optional[UploadFile] = File(None), db: sqlite3.Connection = Depends(get_db)):
    image_url = save_upload_file(image) if image else ""
    cursor = db.cursor()
    cursor.execute("INSERT INTO categories (name, image) VALUES (?, ?)", (name, image_url))
    db.commit()
    return {"id": cursor.lastrowid, "name": name, "image": image_url}

@app.put("/api/categories/{category_id}")
async def update_category(category_id: int, name: str = Form(...), image: Optional[UploadFile] = File(None), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if image:
        image_url = save_upload_file(image)
        cursor.execute("UPDATE categories SET name = ?, image = ? WHERE id = ?", (name, image_url, category_id))
        db.commit()
        return {"id": category_id, "name": name, "image": image_url}
    else:
        cursor.execute("UPDATE categories SET name = ? WHERE id = ?", (name, category_id))
        db.commit()
        return {"id": category_id, "name": name}

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM categories WHERE id = ?", (category_id,))
    db.commit()
    return {"success": True}

@app.get("/api/products")
def get_products(categoryId: Optional[int] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if categoryId is not None:
        cursor.execute("SELECT * FROM products WHERE category_id = ? ORDER BY id DESC", (categoryId,))
    else:
        cursor.execute("SELECT * FROM products ORDER BY id DESC")
    return cursor.fetchall()

@app.post("/api/products")
async def create_product(
    category_id: int = Form(...),
    name: str = Form(...),
    quantity: str = Form(...),
    currentPrice: float = Form(...),
    cutPrice: float = Form(...),
    rating: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: sqlite3.Connection = Depends(get_db)
):
    image_url = save_upload_file(image) if image else ""
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO products (category_id, name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (category_id, name, quantity, currentPrice, cutPrice, rating, image_url)
    )
    db.commit()
    return {"id": cursor.lastrowid, "category_id": category_id, "name": name, "quantity": quantity, 
            "currentPrice": currentPrice, "cutPrice": cutPrice, "rating": rating, "image": image_url}

@app.put("/api/products/{product_id}")
async def update_product(
    product_id: int,
    category_id: int = Form(...),
    name: str = Form(...),
    quantity: str = Form(...),
    currentPrice: float = Form(...),
    cutPrice: float = Form(...),
    rating: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    if image:
        image_url = save_upload_file(image)
        cursor.execute(
            "UPDATE products SET category_id = ?, name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ?, image = ? WHERE id = ?",
            (category_id, name, quantity, currentPrice, cutPrice, rating, image_url, product_id)
        )
        db.commit()
        return {"id": product_id, "category_id": category_id, "name": name, "quantity": quantity, 
                "currentPrice": currentPrice, "cutPrice": cutPrice, "rating": rating, "image": image_url}
    else:
        cursor.execute(
            "UPDATE products SET category_id = ?, name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ? WHERE id = ?",
            (category_id, name, quantity, currentPrice, cutPrice, rating, product_id)
        )
        db.commit()
        return {"id": product_id, "category_id": category_id, "name": name, "quantity": quantity, 
                "currentPrice": currentPrice, "cutPrice": cutPrice, "rating": rating}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    db.commit()
    return {"success": True}

# --- DEALS OF THE DAY API ---

@app.get("/api/deals")
def get_deals(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM deals_of_the_day ORDER BY id DESC")
    return cursor.fetchall()

@app.post("/api/deals")
async def create_deal(
    name: str = Form(...),
    quantity: str = Form(...),
    currentPrice: float = Form(...),
    cutPrice: float = Form(...),
    rating: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM deals_of_the_day")
    if cursor.fetchone()['count'] >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 deals allowed")

    image_url = save_upload_file(image) if image else ""
    cursor.execute(
        "INSERT INTO deals_of_the_day (name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?)",
        (name, quantity, currentPrice, cutPrice, rating, image_url)
    )
    db.commit()
    return {"id": cursor.lastrowid, "name": name, "quantity": quantity, 
            "currentPrice": currentPrice, "cutPrice": cutPrice, "rating": rating, "image": image_url}

@app.put("/api/deals/{deal_id}")
async def update_deal(
    deal_id: int,
    name: str = Form(...),
    quantity: str = Form(...),
    currentPrice: float = Form(...),
    cutPrice: float = Form(...),
    rating: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    if image:
        image_url = save_upload_file(image)
        cursor.execute(
            "UPDATE deals_of_the_day SET name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ?, image = ? WHERE id = ?",
            (name, quantity, currentPrice, cutPrice, rating, image_url, deal_id)
        )
        db.commit()
        return {"id": deal_id, "name": name, "quantity": quantity, 
                "currentPrice": currentPrice, "cutPrice": cutPrice, "rating": rating, "image": image_url}
    else:
        cursor.execute(
            "UPDATE deals_of_the_day SET name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ? WHERE id = ?",
            (name, quantity, currentPrice, cutPrice, rating, deal_id)
        )
        db.commit()
        return {"id": deal_id, "name": name, "quantity": quantity, 
                "currentPrice": currentPrice, "cutPrice": cutPrice, "rating": rating}

@app.delete("/api/deals/{deal_id}")
def delete_deal(deal_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM deals_of_the_day WHERE id = ?", (deal_id,))
    db.commit()
    return {"success": True}
