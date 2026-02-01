import json
import os
from datetime import datetime, timedelta
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event: dict, context) -> dict:
    """API для создания и управления заказами игровых серверов"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            customer_name = body.get('customerName')
            customer_email = body.get('customerEmail')
            customer_phone = body.get('customerPhone', '')
            plan_type = body.get('planType')
            slots = body.get('slots')
            days = body.get('days')
            total_price = body.get('totalPrice')
            server_name = body.get('serverName')
            game_type = body.get('gameType', 'SAMP')
            
            if not all([customer_name, customer_email, plan_type, slots, days, total_price, server_name]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            expires_at = datetime.now() + timedelta(days=int(days))
            
            cursor.execute("""
                INSERT INTO orders 
                (customer_name, customer_email, customer_phone, plan_type, slots, days, 
                 total_price, server_name, game_type, status, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)
                RETURNING id, customer_name, customer_email, plan_type, slots, days, 
                          total_price, server_name, game_type, status, created_at, expires_at
            """, (customer_name, customer_email, customer_phone, plan_type, slots, days,
                  total_price, server_name, game_type, expires_at))
            
            order = dict(cursor.fetchone())
            
            server_ip = f"185.{100 + order['id'] % 155}.{order['id'] % 256}.{10 + order['id'] % 245}"
            server_port = 7777 + (order['id'] % 1000)
            ftp_host = server_ip
            ftp_user = f"user_{order['id']}"
            ftp_password = f"pass_{order['id']}_ftP"
            db_host = "db.lordhost.ru"
            db_name = f"server_{order['id']}"
            db_user = f"user_{order['id']}"
            db_password = f"dbpass_{order['id']}"
            
            cursor.execute("""
                INSERT INTO servers 
                (order_id, server_ip, server_port, ftp_host, ftp_user, ftp_password,
                 db_host, db_name, db_user, db_password, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'installing')
                RETURNING id, server_ip, server_port, ftp_host, ftp_user, 
                          db_host, db_name, db_user, status
            """, (order['id'], server_ip, server_port, ftp_host, ftp_user, ftp_password,
                  db_host, db_name, db_user, db_password))
            
            server = dict(cursor.fetchone())
            server['ftp_password'] = ftp_password
            server['db_password'] = db_password
            
            conn.commit()
            
            order['created_at'] = order['created_at'].isoformat()
            order['expires_at'] = order['expires_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'order': order,
                    'server': server,
                    'message': 'Заказ создан! Сервер устанавливается, данные доступа отправлены на email'
                }, default=decimal_default),
                'isBase64Encoded': False
            }
            
        elif method == 'GET':
            email = event.get('queryStringParameters', {}).get('email')
            
            if email:
                cursor.execute("""
                    SELECT o.*, 
                           s.server_ip, s.server_port, s.ftp_host, s.ftp_user,
                           s.db_host, s.db_name, s.db_user, s.status as server_status
                    FROM orders o
                    LEFT JOIN servers s ON o.id = s.order_id
                    WHERE o.customer_email = %s
                    ORDER BY o.created_at DESC
                """, (email,))
            else:
                cursor.execute("""
                    SELECT o.*, 
                           s.server_ip, s.server_port, s.status as server_status
                    FROM orders o
                    LEFT JOIN servers s ON o.id = s.order_id
                    ORDER BY o.created_at DESC
                    LIMIT 50
                """)
            
            orders = cursor.fetchall()
            orders_list = []
            for order in orders:
                order_dict = dict(order)
                if order_dict.get('created_at'):
                    order_dict['created_at'] = order_dict['created_at'].isoformat()
                if order_dict.get('expires_at'):
                    order_dict['expires_at'] = order_dict['expires_at'].isoformat()
                orders_list.append(order_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'orders': orders_list}, default=decimal_default),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()