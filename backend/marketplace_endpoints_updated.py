# Updated Marketplace Endpoints for Provider Dashboard Integration
# This file contains the marketplace endpoints that should be added to server.py

# Add these imports to server.py
"""
from models.marketplace_models_updated import (
    HandicraftCreate, HandicraftUpdate, Handicraft,
    HandicraftOrderCreate, HandicraftOrderUpdate, HandicraftOrder,
    HandicraftReviewCreate, HandicraftReview,
    CulturalEventCreate, CulturalEventUpdate, CulturalEvent,
    EventBookingCreate, EventBookingUpdate, EventBooking,
    EventReviewCreate, EventReview,
    MarketplaceNotification, MarketplaceNotificationCreate,
    MarketplaceSearch, MarketplaceStats, ProviderMarketplaceStats,
    MarketplaceResponse, PaginatedResponse,
    HandicraftCategory, EventType, OrderStatus, PaymentStatus
)
"""

# Add these endpoints to server.py after the existing provider endpoints

# MARKETPLACE DASHBOARD FOR PROVIDERS
@api_router.get("/providers/marketplace/dashboard")
async def get_provider_marketplace_dashboard(current_user: dict = Depends(get_current_user)):
    """Get marketplace dashboard data for providers"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can access marketplace dashboard")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Get provider's marketplace stats
                await cur.execute("""
                    SELECT 
                        COALESCE(COUNT(DISTINCT h.id), 0) as total_handicrafts,
                        COALESCE(COUNT(DISTINCT e.id), 0) as total_events,
                        COALESCE(COUNT(DISTINCT ho.id), 0) as total_orders,
                        COALESCE(COUNT(DISTINCT eb.id), 0) as total_bookings,
                        COALESCE(SUM(CASE WHEN ho.status = 'delivered' AND MONTH(ho.delivered_at) = MONTH(NOW()) THEN ho.total_price ELSE 0 END), 0) as monthly_sales,
                        COALESCE(AVG(h.rating), 0) as avg_handicraft_rating,
                        COALESCE(AVG(e.rating), 0) as avg_event_rating,
                        COALESCE(SUM(h.total_reviews), 0) + COALESCE(SUM(e.total_reviews), 0) as total_reviews,
                        COALESCE(COUNT(CASE WHEN ho.status IN ('pending', 'confirmed') THEN 1 END), 0) as pending_orders,
                        COALESCE(COUNT(CASE WHEN h.stock_quantity <= 5 AND h.stock_quantity > 0 THEN 1 END), 0) as low_stock_items
                    FROM users u
                    LEFT JOIN handicrafts h ON u.id = h.seller_id AND h.is_available = 1
                    LEFT JOIN cultural_events e ON u.id = e.organizer_id AND e.is_active = 1
                    LEFT JOIN handicraft_orders ho ON u.id = ho.seller_id
                    LEFT JOIN event_bookings eb ON u.id = eb.organizer_id
                    WHERE u.id = %s AND u.role = 'provider'
                """, (current_user['id'],))
                
                stats = await cur.fetchone()
                
                # Get recent notifications
                await cur.execute("""
                    SELECT * FROM marketplace_notifications 
                    WHERE user_id = %s AND expires_at > NOW() OR expires_at IS NULL
                    ORDER BY created_at DESC LIMIT 10
                """, (current_user['id'],))
                
                notifications = await cur.fetchall()
                
                # Get recent orders
                await cur.execute("""
                    SELECT ho.*, h.name as handicraft_name, u.name as buyer_name
                    FROM handicraft_orders ho
                    JOIN handicrafts h ON ho.handicraft_id = h.id
                    JOIN users u ON ho.user_id = u.id
                    WHERE ho.seller_id = %s
                    ORDER BY ho.created_at DESC LIMIT 5
                """, (current_user['id'],))
                
                recent_orders = await cur.fetchall()
                
                # Get recent event bookings
                await cur.execute("""
                    SELECT eb.*, e.title as event_title, u.name as participant_name
                    FROM event_bookings eb
                    JOIN cultural_events e ON eb.event_id = e.id
                    JOIN users u ON eb.user_id = u.id
                    WHERE eb.organizer_id = %s
                    ORDER BY eb.created_at DESC LIMIT 5
                """, (current_user['id'],))
                
                recent_bookings = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "stats": stats,
                        "notifications": notifications,
                        "recent_orders": recent_orders,
                        "recent_bookings": recent_bookings
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketplace dashboard: {str(e)}")

# MARKETPLACE TOGGLE FOR PROVIDERS
@api_router.post("/providers/marketplace/enable")
async def enable_provider_marketplace(current_user: dict = Depends(get_current_user)):
    """Enable marketplace for a provider"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can enable marketplace")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                # Update provider to enable marketplace
                await cur.execute("""
                    UPDATE providers 
                    SET marketplace_enabled = 1 
                    WHERE user_id = %s
                """, (current_user['id'],))
                
                if cur.rowcount == 0:
                    # Create a basic provider entry if doesn't exist
                    await cur.execute("""
                        INSERT INTO providers (id, user_id, name, category, service_name, description, price, location, contact, marketplace_enabled, is_active)
                        SELECT %s, id, name, 'marketplace', 'Marketplace Services', 'Providing marketplace services', 0, 'Various Locations', phone, 1, 1
                        FROM users WHERE id = %s
                    """, (str(uuid.uuid4()), current_user['id']))
                
                await conn.commit()
                
                return {"success": True, "message": "Marketplace enabled successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enabling marketplace: {str(e)}")

# HANDICRAFTS MANAGEMENT FOR PROVIDERS
@api_router.get("/providers/marketplace/handicrafts")
async def get_provider_handicrafts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get all handicrafts for the current provider"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can access this endpoint")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Get total count
                await cur.execute("""
                    SELECT COUNT(*) as total FROM handicrafts 
                    WHERE seller_id = %s
                """, (current_user['id'],))
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get handicrafts with pagination
                await cur.execute("""
                    SELECT h.*, u.name as seller_name
                    FROM handicrafts h
                    JOIN users u ON h.seller_id = u.id
                    WHERE h.seller_id = %s
                    ORDER BY h.created_at DESC
                    LIMIT %s OFFSET %s
                """, (current_user['id'], limit, offset))
                
                handicrafts = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": handicrafts,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching handicrafts: {str(e)}")

@api_router.post("/providers/marketplace/handicrafts")
async def create_handicraft(
    handicraft_data: HandicraftCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new handicraft for the current provider"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can create handicrafts")
    
    try:
        async with get_db_connection() as conn:
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
                
                await conn.commit()
                
                # Create notification for successful creation
                await cur.execute("""
                    INSERT INTO marketplace_notifications (id, user_id, type, title, message, related_id, related_type, priority)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()), current_user['id'], 'new_message',
                    'Handicraft Created Successfully',
                    f'Your handicraft "{handicraft_data.name}" has been created and is now available in the marketplace.',
                    handicraft_id, 'handicraft', 'medium'
                ))
                
                await conn.commit()
                
                return {
                    "success": True,
                    "message": "Handicraft created successfully",
                    "data": {"handicraft_id": handicraft_id}
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating handicraft: {str(e)}")

# EVENTS MANAGEMENT FOR PROVIDERS
@api_router.get("/providers/marketplace/events")
async def get_provider_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get all events for the current provider"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can access this endpoint")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Get total count
                await cur.execute("""
                    SELECT COUNT(*) as total FROM cultural_events 
                    WHERE organizer_id = %s
                """, (current_user['id'],))
                
                total_result = await cur.fetchone()
                total = total_result['total'] if total_result else 0
                
                # Get events with pagination
                await cur.execute("""
                    SELECT e.*, u.name as organizer_name
                    FROM cultural_events e
                    JOIN users u ON e.organizer_id = u.id
                    WHERE e.organizer_id = %s
                    ORDER BY e.start_date DESC
                    LIMIT %s OFFSET %s
                """, (current_user['id'], limit, offset))
                
                events = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": {
                        "items": events,
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "pages": (total + limit - 1) // limit
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@api_router.post("/providers/marketplace/events")
async def create_event(
    event_data: CulturalEventCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new cultural event for the current provider"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can create events")
    
    try:
        async with get_db_connection() as conn:
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
                
                await conn.commit()
                
                # Create notification for successful creation
                await cur.execute("""
                    INSERT INTO marketplace_notifications (id, user_id, type, title, message, related_id, related_type, priority)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()), current_user['id'], 'new_message',
                    'Event Created Successfully',
                    f'Your event "{event_data.title}" has been created and is now available for booking.',
                    event_id, 'event', 'medium'
                ))
                
                await conn.commit()
                
                return {
                    "success": True,
                    "message": "Event created successfully",
                    "data": {"event_id": event_id}
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

# ORDERS MANAGEMENT FOR PROVIDERS
@api_router.get("/providers/marketplace/orders")
async def get_provider_orders(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get all orders for the current provider"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can access this endpoint")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                offset = (page - 1) * limit
                
                # Build query with optional status filter
                where_clause = "WHERE ho.seller_id = %s"
                params = [current_user['id']]\n                
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
                    SELECT ho.*, h.name as handicraft_name, u.name as buyer_name, u.email as buyer_email
                    FROM handicraft_orders ho
                    JOIN handicrafts h ON ho.handicraft_id = h.id
                    JOIN users u ON ho.user_id = u.id
                    {where_clause}
                    ORDER BY ho.created_at DESC
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
                        "pages": (total + limit - 1) // limit
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

# REAL-TIME NOTIFICATIONS
@api_router.get("/providers/marketplace/notifications")
async def get_provider_notifications(
    is_read: Optional[bool] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get notifications for the current provider"""
    if current_user['role'] not in ['provider', 'admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                where_clause = "WHERE user_id = %s AND (expires_at > NOW() OR expires_at IS NULL)"
                params = [current_user['id']]
                
                if is_read is not None:
                    where_clause += " AND is_read = %s"
                    params.append(is_read)
                
                await cur.execute(f"""
                    SELECT * FROM marketplace_notifications 
                    {where_clause}
                    ORDER BY created_at DESC
                    LIMIT %s
                """, params + [limit])
                
                notifications = await cur.fetchall()
                
                return {
                    "success": True,
                    "data": notifications
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

@api_router.put("/providers/marketplace/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    if current_user['role'] not in ['provider', 'admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    UPDATE marketplace_notifications 
                    SET is_read = 1 
                    WHERE id = %s AND user_id = %s
                """, (notification_id, current_user['id']))
                
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Notification not found")
                
                await conn.commit()
                
                return {"success": True, "message": "Notification marked as read"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating notification: {str(e)}")

# MARKETPLACE ANALYTICS FOR PROVIDERS
@api_router.get("/providers/marketplace/analytics")
async def get_provider_analytics(
    period: str = Query("month", regex="^(week|month|year)$"),
    current_user: dict = Depends(get_current_user)
):
    """Get analytics data for provider's marketplace activities"""
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only providers can access analytics")
    
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Determine date range based on period
                if period == "week":
                    date_filter = "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
                elif period == "month":
                    date_filter = "MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())"
                else:  # year
                    date_filter = "YEAR(created_at) = YEAR(NOW())"
                
                # Get sales analytics
                await cur.execute(f"""
                    SELECT 
                        COUNT(*) as total_orders,
                        SUM(total_price) as total_revenue,
                        AVG(total_price) as avg_order_value,
                        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
                    FROM handicraft_orders 
                    WHERE seller_id = %s AND {date_filter}
                """, (current_user['id'],))
                
                sales_stats = await cur.fetchone()
                
                # Get product performance
                await cur.execute(f"""
                    SELECT h.name, h.category, COUNT(ho.id) as orders, SUM(ho.total_price) as revenue
                    FROM handicrafts h
                    LEFT JOIN handicraft_orders ho ON h.id = ho.handicraft_id AND {date_filter}
                    WHERE h.seller_id = %s
                    GROUP BY h.id, h.name, h.category
                    ORDER BY revenue DESC
                    LIMIT 10
                """, (current_user['id'],))
                
                product_performance = await cur.fetchall()
                
                # Get event booking analytics
                await cur.execute(f"""
                    SELECT 
                        COUNT(*) as total_bookings,
                        SUM(total_price) as total_revenue,
                        AVG(participants) as avg_participants
                    FROM event_bookings 
                    WHERE organizer_id = %s AND {date_filter}
                """, (current_user['id'],))
                
                event_stats = await cur.fetchone()
                
                return {
                    "success": True,
                    "data": {
                        "period": period,
                        "sales_stats": sales_stats,
                        "product_performance": product_performance,
                        "event_stats": event_stats
                    }
                }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")