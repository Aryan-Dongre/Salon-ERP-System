# Customer module contains all the function related to customer for all the roles

from python_database.db import get_db_connection
from psycopg2.extras import RealDictCursor

def customer_details():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try : 
        cursor.execute( """
                SELECT
                customer_id,
                full_name,
                email,
                phone,
                profile_image,
                login_provider,
                customer_status,
                last_visit_date,
                created_at
            FROM customers
            ORDER BY created_at DESC 
                """)
        
        customer = cursor.fetchall()

        return customer
    
    except Exception as e :

        print("Error fetching customer", e)
        return []
    
    finally:
        cursor.close()
        connection.close()

def customer_card():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        
        # total customer
        cursor.execute("""
                         SELECT COUNT(*)
                       FROM customers
                        """)
        total_customers = cursor.fetchone()['count']

        # register user
        cursor.execute("""
                       SELECT COUNT(*)
                        FROM customers
                        WHERE customer_status = 'REGISTERED'
                       """)
        registered_users = cursor.fetchone()['count']

        # Active client 
        cursor.execute("""
            SELECT COUNT(*)
            FROM customers
            WHERE customer_status = 'CLIENT'
        """)
        active_clients = cursor.fetchone()['count']


        # Visited Customers
        cursor.execute("""
            SELECT COUNT(*)
            FROM customers
            WHERE last_visit_date IS NOT NULL
        """)
        visited_customers = cursor.fetchone()['count']

        return {
            'total_customers': total_customers,
            'registered_users': registered_users,
            'active_clients': active_clients,
            'visited_customers': visited_customers
        }
    
    except Exception as e :

         print("Customer stats error:", e)

         return {
            'total_customers': 0,
            'registered_users': 0,
            'active_clients': 0,
            'visited_customers': 0
        }

    finally:
        cursor.close()
        connection.close()