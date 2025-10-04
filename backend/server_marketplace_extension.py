# Marketplace and Artisan Endpoints Extension for server.py
# Add these imports to the existing server.py after the existing imports

from fastapi import Query
from models.marketplace_models_updated import (
    HandicraftCreate, HandicraftUpdate, Handicraft,
    CulturalEventCreate, CulturalEventUpdate, CulturalEvent,
    HandicraftCategory, EventType, OrderStatus, PaymentStatus
)

# Add these helper functions after get_current_user function

async def get_db_connection():
    """Helper function to get database connection"""
    pool = await get_db()
    return pool

# ARTISAN AUTHENTICATION AND DASHBOARD ENDPOINTS
# Add these endpoints to server.py before app.include_router(api_router)

@api_router.get("/artisans/dashboard")
async def get_artisan_dashboard(current_user: dict = Depends(get_current_user)):
    """Get artisan dashboard overview with stats and recent activity"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Get artisan's handicrafts stats
                await cur.execute("""
                    SELECT 
                        COUNT(*) as total_products,
                        COALESCE(SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END), 0) as active_products,
                        COALESCE(SUM(CASE WHEN stock_quantity <= 5 AND stock_quantity > 0 THEN 1 ELSE 0 END), 0) as low_stock_items,
                        COALESCE(AVG(rating), 0) as avg_rating,
                        COALESCE(SUM(total_reviews), 0) as total_reviews
                    FROM handicrafts 
                    WHERE seller_id = %s
                """, (current_user['id'],))
                
                handicrafts_stats = await cur.fetchone()
                
                # Get artisan's events stats
                await cur.execute("""
                    SELECT 
                        COUNT(*) as total_events,
                        COALESCE(SUM(CASE WHEN is_active = 1 AND start_date > NOW() THEN 1 ELSE 0 END), 0) as upcoming_events,
                        COALESCE(SUM(CASE WHEN start_date < NOW() AND end_date > NOW() THEN 1 ELSE 0 END), 0) as ongoing_events
                    FROM cultural_events 
                    WHERE organizer_id = %s
                """, (current_user['id'],))
                
                events_stats = await cur.fetchone()
                
                # Get orders stats for this month
                await cur.execute("""
                    SELECT 
                        COUNT(*) as total_orders,
                        COALESCE(SUM(total_price), 0) as total_revenue,
                        COALESCE(COUNT(CASE WHEN status = 'pending' THEN 1 END), 0) as pending_orders,
                        COALESCE(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0) as completed_orders
                    FROM handicraft_orders 
                    WHERE seller_id = %s AND MONTH(order_date) = MONTH(NOW()) AND YEAR(order_date) = YEAR(NOW())
                """, (current_user['id'],))
                
                orders_stats = await cur.fetchone()
                
                # Get recent orders (last 5)
                await cur.execute("""
                    SELECT ho.*, h.name as product_name, u.name as buyer_name
                    FROM handicraft_orders ho
                    JOIN handicrafts h ON ho.handicraft_id = h.id
                    JOIN users u ON ho.user_id = u.id
                    WHERE ho.seller_id = %s
                    ORDER BY ho.order_date DESC
                    LIMIT 5
                """, (current_user['id'],))
                
                recent_orders = await cur.fetchall()
                
                # Get recent event bookings (last 5)
                await cur.execute("""
                    SELECT eb.*, e.title as event_title, u.name as participant_name
                    FROM event_bookings eb
                    JOIN cultural_events e ON eb.event_id = e.id
                    JOIN users u ON eb.user_id = u.id
                    WHERE eb.organizer_id = %s
                    ORDER BY eb.booking_date DESC
                    LIMIT 5
                """, (current_user['id'],))
                
                recent_bookings = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "handicrafts_stats": handicrafts_stats,
                        "events_stats": events_stats,
                        "orders_stats": orders_stats,
                        "recent_orders": recent_orders,
                        "recent_bookings": recent_bookings,
                        "artisan_info": {
                            "id": current_user['id'],
                            "name": current_user['name'],
                            "role": current_user['role']
                        }
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching artisan dashboard: {str(e)}")

# HANDICRAFTS MANAGEMENT ENDPOINTS

@api_router.get("/artisans/handicrafts")
async def get_artisan_handicrafts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all handicrafts for the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Build query with optional category filter
                where_clause = "WHERE seller_id = %s"
                params = [current_user['id']]
                
                if category:
                    where_clause += " AND category = %s"
                    params.append(category)
                
                # Get total count
                await cur.execute(f"""
                    SELECT COUNT(*) as total FROM handicrafts 
                    {where_clause}
                """, params)
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get handicrafts with pagination
                query_params = params + [limit, offset]
                await cur.execute(f"""
                    SELECT h.*, u.name as seller_name
                    FROM handicrafts h
                    JOIN users u ON h.seller_id = u.id
                    {where_clause}
                    ORDER BY h.created_at DESC
                    LIMIT %s OFFSET %s
                """, query_params)
                
                handicrafts = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": handicrafts,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit if total > 0 else 1
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching handicrafts: {str(e)}")

@api_router.post("/artisans/handicrafts")
async def create_handicraft(
    handicraft_data: HandicraftCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new handicraft for the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                handicraft_id = str(uuid.uuid4())
                
                await cur.execute("""
                    INSERT INTO handicrafts (
                        id, seller_id, name, category, description, price, discount_price,
                        stock_quantity, images, materials, dimensions, weight, origin_village,
                        cultural_significance, care_instructions, tags, is_featured
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    handicraft_id, current_user['id'], handicraft_data.name,
                    handicraft_data.category, handicraft_data.description,
                    handicraft_data.price, handicraft_data.discount_price,
                    handicraft_data.stock_quantity,
                    json.dumps(handicraft_data.images) if handicraft_data.images else None,
                    handicraft_data.materials, handicraft_data.dimensions,
                    handicraft_data.weight, handicraft_data.origin_village,
                    handicraft_data.cultural_significance, handicraft_data.care_instructions,
                    json.dumps(handicraft_data.tags) if handicraft_data.tags else None,
                    handicraft_data.is_featured
                ))
                
                return {
                    "success": True,
                    "message": "Handicraft created successfully",
                    "data": {"handicraft_id": handicraft_id}
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating handicraft: {str(e)}")

@api_router.put("/artisans/handicrafts/{handicraft_id}")
async def update_handicraft(
    handicraft_id: str,
    handicraft_data: HandicraftUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a handicraft owned by the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Verify ownership
                await cur.execute("SELECT seller_id FROM handicrafts WHERE id = %s", (handicraft_id,))
                handicraft = await cur.fetchone()
                
                if not handicraft or handicraft[0] != current_user['id']:
                    raise HTTPException(status_code=404, detail="Handicraft not found or access denied")
                
                # Build update query dynamically
                update_fields = []
                params = []
                
                if handicraft_data.name is not None:
                    update_fields.append("name = %s")
                    params.append(handicraft_data.name)
                if handicraft_data.category is not None:
                    update_fields.append("category = %s")
                    params.append(handicraft_data.category)
                if handicraft_data.description is not None:
                    update_fields.append("description = %s")
                    params.append(handicraft_data.description)
                if handicraft_data.price is not None:
                    update_fields.append("price = %s")
                    params.append(handicraft_data.price)
                if handicraft_data.discount_price is not None:
                    update_fields.append("discount_price = %s")
                    params.append(handicraft_data.discount_price)
                if handicraft_data.stock_quantity is not None:
                    update_fields.append("stock_quantity = %s")
                    params.append(handicraft_data.stock_quantity)
                
                if not update_fields:
                    raise HTTPException(status_code=400, detail="No fields to update")
                
                update_fields.append("updated_at = NOW()")
                params.append(handicraft_id)
                
                await cur.execute(f"""
                    UPDATE handicrafts 
                    SET {', '.join(update_fields)} 
                    WHERE id = %s
                """, params)
                
                return {
                    "success": True,
                    "message": "Handicraft updated successfully"
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating handicraft: {str(e)}")

@api_router.delete("/artisans/handicrafts/{handicraft_id}")
async def delete_handicraft(
    handicraft_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a handicraft owned by the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Verify ownership and delete
                await cur.execute("""
                    DELETE FROM handicrafts 
                    WHERE id = %s AND seller_id = %s
                """, (handicraft_id, current_user['id']))
                
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Handicraft not found or access denied")
                
                return {
                    "success": True,
                    "message": "Handicraft deleted successfully"
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting handicraft: {str(e)}")

# CULTURAL EVENTS MANAGEMENT ENDPOINTS

@api_router.get("/artisans/events")
async def get_artisan_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    event_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all events for the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Build query with optional event type filter
                where_clause = "WHERE organizer_id = %s"
                params = [current_user['id']]
                
                if event_type:
                    where_clause += " AND event_type = %s"
                    params.append(event_type)
                
                # Get total count
                await cur.execute(f"""
                    SELECT COUNT(*) as total FROM cultural_events 
                    {where_clause}
                """, params)
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get events with pagination
                query_params = params + [limit, offset]
                await cur.execute(f"""
                    SELECT e.*, u.name as organizer_name
                    FROM cultural_events e
                    JOIN users u ON e.organizer_id = u.id
                    {where_clause}
                    ORDER BY e.start_date DESC
                    LIMIT %s OFFSET %s
                """, query_params)
                
                events = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": events,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit if total > 0 else 1
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@api_router.post("/artisans/events")
async def create_event(
    event_data: CulturalEventCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new cultural event for the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                event_id = str(uuid.uuid4())
                
                await cur.execute("""
                    INSERT INTO cultural_events (
                        id, organizer_id, title, description, event_type, location, venue_details,
                        start_date, end_date, price, max_participants, images, cultural_significance,
                        what_to_expect, what_to_bring, age_restrictions, languages, contact_info,
                        cancellation_policy, tags, is_featured
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    event_id, current_user['id'], event_data.title, event_data.description,
                    event_data.event_type, event_data.location, event_data.venue_details,
                    event_data.start_date, event_data.end_date, event_data.price,
                    event_data.max_participants,
                    json.dumps(event_data.images) if event_data.images else None,
                    event_data.cultural_significance, event_data.what_to_expect,
                    event_data.what_to_bring, event_data.age_restrictions,
                    event_data.languages,
                    json.dumps(event_data.contact_info) if event_data.contact_info else None,
                    event_data.cancellation_policy,
                    json.dumps(event_data.tags) if event_data.tags else None,
                    event_data.is_featured
                ))
                
                return {
                    "success": True,
                    "message": "Event created successfully",
                    "data": {"event_id": event_id}
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

# ORDERS MANAGEMENT ENDPOINTS

@api_router.get("/artisans/orders")
async def get_artisan_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all orders for the current artisan"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Build query with optional status filter
                where_clause = "WHERE ho.seller_id = %s"
                params = [current_user['id']]
                
                if status:
                    where_clause += " AND ho.status = %s"
                    params.append(status)
                
                # Get total count
                await cur.execute(f"""
                    SELECT COUNT(*) as total FROM handicraft_orders ho 
                    {where_clause}
                """, params)
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get orders with pagination
                query_params = params + [limit, offset]
                await cur.execute(f"""
                    SELECT ho.*, h.name as product_name, u.name as buyer_name, u.email as buyer_email, u.phone as buyer_phone
                    FROM handicraft_orders ho
                    JOIN handicrafts h ON ho.handicraft_id = h.id
                    JOIN users u ON ho.user_id = u.id
                    {where_clause}
                    ORDER BY ho.order_date DESC
                    LIMIT %s OFFSET %s
                """, query_params)
                
                orders = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": orders,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit if total > 0 else 1
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@api_router.put("/artisans/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    new_status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update order status for an artisan's order"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    valid_statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Update order status
                await cur.execute("""
                    UPDATE handicraft_orders 
                    SET status = %s, updated_at = NOW()
                    WHERE id = %s AND seller_id = %s
                """, (new_status, order_id, current_user['id']))
                
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Order not found or access denied")
                
                return {
                    "success": True,
                    "message": f"Order status updated to {new_status}"
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

# ANALYTICS ENDPOINTS

@api_router.get("/artisans/analytics")
async def get_artisan_analytics(
    period: str = Query("month", regex="^(week|month|year)$"),
    current_user: dict = Depends(get_current_user)
):
    """Get analytics data for artisan's activities"""
    if current_user['role'] != 'artisan':
        raise HTTPException(status_code=403, detail="Access denied. Artisan role required.")
    
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Determine date range based on period
                if period == "week":
                    date_filter = "DATE(order_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
                elif period == "month":
                    date_filter = "MONTH(order_date) = MONTH(NOW()) AND YEAR(order_date) = YEAR(NOW())"
                else:  # year
                    date_filter = "YEAR(order_date) = YEAR(NOW())"
                
                # Get sales analytics
                await cur.execute(f"""
                    SELECT 
                        COUNT(*) as total_orders,
                        COALESCE(SUM(total_price), 0) as total_revenue,
                        COALESCE(AVG(total_price), 0) as avg_order_value,
                        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
                    FROM handicraft_orders 
                    WHERE seller_id = %s AND {date_filter}
                """, (current_user['id'],))
                
                sales_stats = await cur.fetchone()
                
                # Get product performance
                await cur.execute(f"""
                    SELECT h.name, h.category, COUNT(ho.id) as orders, COALESCE(SUM(ho.total_price), 0) as revenue
                    FROM handicrafts h
                    LEFT JOIN handicraft_orders ho ON h.id = ho.handicraft_id AND {date_filter}
                    WHERE h.seller_id = %s
                    GROUP BY h.id, h.name, h.category
                    ORDER BY revenue DESC
                    LIMIT 10
                """, (current_user['id'],))
                
                product_performance = await cur.fetchall()
                
                # Get category performance
                await cur.execute(f"""
                    SELECT h.category, COUNT(ho.id) as orders, COALESCE(SUM(ho.total_price), 0) as revenue
                    FROM handicrafts h
                    LEFT JOIN handicraft_orders ho ON h.id = ho.handicraft_id AND {date_filter}
                    WHERE h.seller_id = %s
                    GROUP BY h.category
                    ORDER BY revenue DESC
                """, (current_user['id'],))
                
                category_performance = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "period": period,
                        "sales_stats": sales_stats,
                        "product_performance": product_performance,
                        "category_performance": category_performance
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

# PUBLIC MARKETPLACE ENDPOINTS (for tourists to browse)

@api_router.get("/marketplace/handicrafts")
async def get_marketplace_handicrafts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get handicrafts from marketplace (public endpoint)"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Build query with filters
                where_conditions = ["h.is_available = 1"]
                params = []
                
                if category:
                    where_conditions.append("h.category = %s")
                    params.append(category)
                
                if min_price is not None:
                    where_conditions.append("h.price >= %s")
                    params.append(min_price)
                
                if max_price is not None:
                    where_conditions.append("h.price <= %s")
                    params.append(max_price)
                
                if search:
                    where_conditions.append("(h.name LIKE %s OR h.description LIKE %s)")
                    params.extend([f"%{search}%", f"%{search}%"])
                
                where_clause = "WHERE " + " AND ".join(where_conditions)
                
                # Get total count
                await cur.execute(f"""
                    SELECT COUNT(*) as total FROM handicrafts h 
                    {where_clause}
                """, params)
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get handicrafts with pagination
                query_params = params + [limit, offset]
                await cur.execute(f"""
                    SELECT h.*, u.name as artisan_name
                    FROM handicrafts h
                    JOIN users u ON h.seller_id = u.id
                    {where_clause}
                    ORDER BY h.is_featured DESC, h.created_at DESC
                    LIMIT %s OFFSET %s
                """, query_params)
                
                handicrafts = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": handicrafts,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit if total > 0 else 1
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketplace handicrafts: {str(e)}")

@api_router.get("/marketplace/events")
async def get_marketplace_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    event_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    """Get cultural events from marketplace (public endpoint)"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Build query with filters
                where_conditions = ["e.is_active = 1", "e.start_date > NOW()"]
                params = []
                
                if event_type:
                    where_conditions.append("e.event_type = %s")
                    params.append(event_type)
                
                if location:
                    where_conditions.append("e.location LIKE %s")
                    params.append(f"%{location}%")
                
                where_clause = "WHERE " + " AND ".join(where_conditions)
                
                # Get total count
                await cur.execute(f"""
                    SELECT COUNT(*) as total FROM cultural_events e 
                    {where_clause}
                """, params)
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get events with pagination
                query_params = params + [limit, offset]
                await cur.execute(f"""
                    SELECT e.*, u.name as organizer_name
                    FROM cultural_events e
                    JOIN users u ON e.organizer_id = u.id
                    {where_clause}
                    ORDER BY e.is_featured DESC, e.start_date ASC
                    LIMIT %s OFFSET %s
                """, query_params)
                
                events = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": events,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit if total > 0 else 1
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketplace events: {str(e)}")

# Note: Add these endpoints to your main server.py file before the line:
# app.include_router(api_router)