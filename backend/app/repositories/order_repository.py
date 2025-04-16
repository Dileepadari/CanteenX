from datetime import datetime
from typing import List, Optional, Dict, Any
from ..db import get_db_cursor

class OrderRepository:
    """Repository for order-related database operations"""

    @staticmethod
    def list_orders(canteen_id: Optional[int] = None, status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List orders with optional filters"""
        with get_db_cursor() as cursor:
            query = """
            SELECT o.*, u.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE 1=1
            """
            params = []

            if canteen_id is not None:
                query += " AND o.canteen_id = %s"
                params.append(canteen_id)
            
            if status is not None:
                query += " AND o.status = %s"
                params.append(status)

            query += " ORDER BY o.created_at DESC LIMIT %s"
            params.append(limit)

            cursor.execute(query, params)
            orders = cursor.fetchall()

            # Get order items for each order
            for order in orders:
                order_id = order['id']
                items_query = """
                SELECT oi.*, mi.name as item_name
                FROM order_items oi
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE oi.order_id = %s
                """
                cursor.execute(items_query, (order_id,))
                items = cursor.fetchall()
                
                # Convert the RealDictRow items to OrderItem instances
                processed_items = []
                for item in items:
                    processed_item = {
                        'id': item['id'],
                        'menuItemId': item['menu_item_id'],
                        'itemName': item['item_name'],
                        'quantity': item['quantity'],
                        'price': item['price'],
                        'notes': item['notes']
                    }
                    processed_items.append(processed_item)
                
                # Also convert order fields to camelCase
                order['customerName'] = order.pop('customer_name')
                order['totalAmount'] = order.pop('total_amount')
                order['createdAt'] = order.pop('created_at')
                order['updatedAt'] = order.pop('updated_at')
                order['items'] = processed_items

            return orders

    @staticmethod
    def get_order(order_id: int) -> Optional[Dict[str, Any]]:
        """Get a single order by ID with its items"""
        with get_db_cursor() as cursor:
            query = """
            SELECT o.*, u.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = %s
            """
            cursor.execute(query, (order_id,))
            order = cursor.fetchone()

            if not order:
                return None

            # Get order items
            items_query = """
            SELECT oi.*, mi.name as item_name
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = %s
            """
            cursor.execute(items_query, (order_id,))
            items = cursor.fetchall()
            
            # Convert the RealDictRow items to OrderItem instances
            processed_items = []
            for item in items:
                processed_item = {
                    'id': item['id'],
                    'menuItemId': item['menu_item_id'],
                    'itemName': item['item_name'],
                    'quantity': item['quantity'],
                    'price': item['price'],
                    'notes': item['notes']
                }
                processed_items.append(processed_item)
            
            # Also convert order fields to camelCase
            order['customerName'] = order.pop('customer_name')
            order['totalAmount'] = order.pop('total_amount')
            order['createdAt'] = order.pop('created_at')
            order['updatedAt'] = order.pop('updated_at')
            order['items'] = processed_items

            return order

    @staticmethod
    def update_order_status(order_id: int, status: str) -> bool:
        """Update the status of an order"""
        with get_db_cursor() as cursor:
            query = """
            UPDATE orders 
            SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id
            """
            cursor.execute(query, (status, order_id))
            result = cursor.fetchone()
            return result is not None

    @staticmethod
    def create_order(user_id: int, canteen_id: int, items: List[Dict[str, Any]], 
                    total_amount: float, notes: Optional[str] = None) -> Optional[int]:
        """Create a new order with items"""
        with get_db_cursor() as cursor:
            try:
                # Begin transaction
                cursor.execute("BEGIN")
                
                # Insert order
                order_query = """
                INSERT INTO orders (user_id, canteen_id, status, total_amount, notes)
                VALUES (%s, %s, 'pending', %s, %s)
                RETURNING id
                """
                cursor.execute(order_query, (user_id, canteen_id, total_amount, notes))
                order_id = cursor.fetchone()['id']
                
                # Insert order items
                for item in items:
                    item_query = """
                    INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes)
                    VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.execute(item_query, (
                        order_id,
                        item['menu_item_id'],
                        item['quantity'],
                        item['price'],
                        item.get('notes')
                    ))
                
                # Commit transaction
                cursor.execute("COMMIT")
                return order_id
            except Exception as e:
                cursor.execute("ROLLBACK")
                print(f"Error creating order: {e}")
                return None

    @staticmethod
    def get_orders_count_by_status(canteen_id: Optional[int] = None) -> Dict[str, int]:
        """Get the count of orders grouped by status"""
        with get_db_cursor() as cursor:
            query = """
            SELECT status, COUNT(*) as count
            FROM orders
            WHERE 1=1
            """
            params = []

            if canteen_id is not None:
                query += " AND canteen_id = %s"
                params.append(canteen_id)

            query += " GROUP BY status"
            cursor.execute(query, params)
            results = cursor.fetchall()

            counts = {
                'pending': 0,
                'preparing': 0,
                'ready': 0,
                'completed': 0,
                'cancelled': 0
            }
            
            for row in results:
                counts[row['status']] = row['count']
                
            return counts 