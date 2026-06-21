# Payment module contains all the function related to payment for user side

from python_database.db import get_db_connection
from psycopg2.extras import RealDictCursor

def get_payment_details(booking_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
         # booking + customer +appointment + payment

            cursor.execute("""
                       SELECT 
                       b.booking_id,
                        b.customer_id,
                        c.full_name,
                        c.email,
                        c.phone,
                        
                        a.appointment_id,
                        a.appointment_date,
                        a.start_time,
                        
                        p.payment_id,
                        p.amount,
                        p.payment_method,
                        p.payment_status
                        
                        FROM bookings b
                        
                        JOIN customers c
                        ON b.customer_id = c.customer_id
                        
                        JOIN appointments a
                        ON b.booking_id = a.booking_id
                        
                        JOIN payments p
                        ON p.appointment_id = a.appointment_id
                        
                        WHERE b.booking_id = %s
                         """, (booking_id,))
         
            booking = cursor.fetchone()

            if not booking:
                  return None
            
            # service

            cursor.execute("""
                      SELECT 
                           s.service_name,
                           s.duration_minutes,
                           bs.price_snapshot
                           
                           FROM booking_services bs
                           
                           JOIN services s
                           ON bs.service_id = s.service_id
                           
                           WHERE bs.booking_id = %s
                           
                           ORDER BY s.service_name
                           """, (booking_id,))
            
            services = cursor.fetchall()

            booking["services"] = services

            return booking
    
    except Exception as e:
          
        print("Payment Page Error:", e)
        return None
    
    finally:
          
        cursor.close()
        connection.close()

def update_payment_method(booking_id, payment_method):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            UPDATE payments
            SET payment_method = %s

            WHERE appointment_id = (

                SELECT appointment_id
                FROM appointments
                WHERE booking_id = %s

                LIMIT 1
            )
        """, (
            payment_method,
            booking_id
        ))

        connection.commit()

        return True

    except Exception as e:

        connection.rollback()
        print("Update Payment Method Error:", e)
        return False

    finally:  

         cursor.close()
         connection.close()

def mark_payment_success(booking_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
                        UPDATE payments
                        SET payment_status = 'SUCCESS',
                        paid_at = CURRENT_TIMESTAMP
                        
                        WHERE appointment_id = (
                               SELECT appointment_id
                        FROM appointments
                        WHERE booking_id = %s
                        
                        LIMIT 1
                        )
                        """, (booking_id,))
        connection.commit()
        return True

    except Exception as e:
         
        connection.rollback()
        print("Payment Success Error:", e)
        return False
    
    finally:
         cursor.close()
         connection.close()
                      
def confirm_pay_at_salon(booking_id):
     
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
                      UPDATE payments
                        SET payment_method = 'CASH',
                            payment_status = 'PENDING'
                        WHERE appointment_id = (
                                SELECT appointment_id
                                FROM appointments
                                WHERE booking_id = %s
                        )
                        """, (booking_id,))
        connection.commit()
        return True

    except Exception as e:
        
        print("Pay at salon error: ", e)
        return False

    finally:
         cursor.close()
         connection.close() 


      


       
      

