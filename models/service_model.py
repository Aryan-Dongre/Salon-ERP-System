# Service module contains all the function related to services for all the roles

from python_database.db import get_db_connection
from psycopg2.extras import RealDictCursor

def service_card():
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)
     
    try :
        cursor.execute("""
                            SELECT COUNT(*)
                            FROM services;
                                """)
        total_card = cursor.fetchone()['count']

        cursor.execute("""
                            SELECT COUNT(*)
                            FROM services
                            WHERE is_active = TRUE
                            """)
        active_service = cursor.fetchone()['count']

        cursor.execute("""
                            SELECT COUNT(*)
                            FROM services
                            WHERE is_active = FALSE
                            """)
        inactive_service = cursor.fetchone()['count']
            
        return {'total_card' : total_card,
                'active_service': active_service,
                'inactive_service':inactive_service
                     }
    
    except Exception as e :
        print("Error to load cards", e) 
        return {'total_card' :0,
                'active_service':0,
                'inactive_service':0
        }
    
    finally :
        cursor.close()
        connection.close()

        
def get_all_service():

    try: 
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
                     SELECT
                       s.service_id,
                       s.service_name,
                       sc.category_name,
                       s.description,
                       s.duration_minutes,
                       s.price,
                       s.is_active,
                       s.created_at

                       FROM services s

                       INNER JOIN service_categories sc
                       ON s.category_id = sc.category_id

                       ORDER BY s.created_at DESC;
                       """)    
        
        service_data = cursor.fetchall()

        return service_data
    
    except Exception as e:
        print(
            "Error loading services:", e
        )

        return []

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

def update_service_status(
    service_id,
    is_active
):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute("""
            UPDATE services
            SET is_active = %s
            WHERE service_id = %s
        """, (
            is_active,
            service_id
        ))

        connection.commit()

        return True

    except Exception as e:
        print(
            "Error updating service status:",
            e
        )

        if connection:
            connection.rollback()

        return False

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()
    

def update_service_details(
    service_id,
    service_name,
    duration_minutes,
    price,
    description,
    is_active
):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute("""
            UPDATE services
            SET
                service_name = %s,
                duration_minutes = %s,
                price = %s,
                description = %s,
                is_active = %s
            WHERE service_id = %s
        """, (
            service_name,
            duration_minutes,
            price,
            description,
            is_active,
            service_id
        ))

        connection.commit()

        return True

    except Exception as e:

        print(
            "Error updating service:",
            e
        )

        if connection:
            connection.rollback()

        return False

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
   

