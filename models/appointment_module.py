# Appointment module contains all the function related to appointment for all the roles

from python_database.db import get_db_connection
from psycopg2.extras import RealDictCursor

def get_appointments(role_id, user_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :
        # for staff

        if role_id == 4:

            cursor.execute("""
                            SELECT staff_id
                           FROM staff 
                           WHERE user_id = %s
                            """, (user_id,))
            
            staff = cursor.fetchone()

            if not staff:
                return []

            staff_id = staff["staff_id"]

            # get staff appointments
            cursor.execute("""
                              SELECT 
                              a.appointment_id,
                              c.full_name AS customer_name,
                              sv.service_name,
                              CONCAT(s.first_name, ' ', s.last_name)
                              AS staff_name,
                              a.appointment_date,
                               a.start_time,
                           a.end_time,
                           a.appointment_status,
                           p.payment_status
                           
                           FROM appointments a
                           
                           JOIN bookings b
                           ON a.booking_id = b.booking_id
                           
                           JOIN customers c
                           ON b.customer_id = c.customer_id
                           
            
                           
                           JOIN booking_services bs
                           ON b.booking_id = bs.booking_id

                              JOIN services sv
                           ON bs.service_id = sv.service_id
                           
                           JOIN staff s
                           ON a.staff_id = s.staff_id
                           
                          LEFT JOIN payments p
                           ON a.appointment_id = p.appointment_id
                           
                           WHERE a.staff_id = %s

                           ORDER BY 
                           a.appointment_date DESC,
                            a.start_time DESC
                            """, (staff_id,))
            
        else :

            cursor.execute("""
                    SELECT
                        a.appointment_id AS id,
                        a.booking_id,

                        c.full_name AS customer_name,
                        c.phone AS customer_phone,

                        STRING_AGG(
                            DISTINCT sv.service_name,
                           ', ') AS service_name,

                        CONCAT(
                            s.first_name,
                            ' ',
                            s.last_name
                        ) AS staff_name,

                        a.appointment_date AS date,
                        a.start_time,
                        a.end_time,

                        LOWER(a.appointment_status) AS status,

                        LOWER(
                            COALESCE(
                                p.payment_status,
                                'PENDING'
                            )
                        ) AS payment_status,

                        COALESCE(
                            p.amount,
                            0
                        ) AS amount

                    FROM appointments a

                    JOIN bookings b
                        ON a.booking_id = b.booking_id

                    JOIN customers c
                        ON b.customer_id = c.customer_id

                    JOIN staff s
                        ON a.staff_id = s.staff_id

                    JOIN booking_services bs
                        ON b.booking_id = bs.booking_id

                    JOIN services sv
                        ON bs.service_id = sv.service_id

                    LEFT JOIN payments p
                        ON a.appointment_id = p.appointment_id
                    
                     GROUP BY
                           a.appointment_id,
                           a.booking_id,
                           c.full_name,
                           c.phone,
                           s.staff_id,
                           s.first_name,
                           s.last_name,
                           a.appointment_date,
                           a.start_time,
                           a.end_time,
                           a.appointment_status,
                           p.payment_status,
                           p.amount 

                    ORDER BY
                        a.appointment_date DESC,
                        a.start_time ASC
                   """)
        appointments = cursor.fetchall()
        return appointments
    
    except Exception as e:
        print("Error fetching appointments:", e)
        return []
    
    finally:
        cursor.close()
        connection.close()

  # ===========================================staff related function==========================

def get_appointment_details(appointment_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :
        cursor.execute("""
                       SELECT 
                       a.appointment_id,
                       a.booking_id,

                       c.full_name AS customer_name,
                       c.phone AS phone_number,
                       
                       sv.service_name,
                       CONCAT(s.first_name, ' ', s.last_name )
                       AS staff_name,
                       
                       a.appointment_date, 
                       a.start_time,
                       a.end_time,
                       a.appointment_status,

                       p.payment_status
                       
                       FROM appointments a
                       
                       JOIN bookings b
                        ON a.booking_id = b.booking_id
                       
                       JOIN customers c
                       ON b.customer_id = c.customer_id

                       JOIN booking_services bs
                       ON b.booking_id = bs.booking_id

                       JOIN services sv 
                       ON bs.service_id = sv.service_id

                       JOIN staff s
                       ON a.staff_id = s.staff_id

                       LEFT JOIN payments p
                       ON  a.appointment_id = p.appointment_id

                       WHERE a.appointment_id = %s
                       """, (appointment_id,))

        appointment = cursor.fetchone()
        return appointment
    
    except Exception as e:
        print("Error fetching appoitment details:",  e)
        return None
    
    finally:
        cursor.close()
        connection.close()


def mark_appointment_complete(
    appointment_id
):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        cursor.execute("""
            UPDATE appointments
            SET appointment_status = %s
            WHERE appointment_id = %s
        """, (
            'COMPLETED',
            appointment_id
        ))

        connection.commit()

        return True

    except Exception as e:

        print(
            "Error updating appointment:",
            e
        )

        connection.rollback()

        return False

    finally:
        cursor.close()
        connection.close()

# =========================================admin related function=============================

def get_appointment_stats():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :

        cursor.execute("""
                    SELECT COUNT(*) AS total,
                    COUNT(
                            CASE 
                            WHEN appointment_status = 'SCHEDULED'
                            THEN 1
                            END
                    ) AS scheduled,


                    COUNT(
                                CASE
                                    WHEN appointment_status = 'IN_PROGRESS'
                                    THEN 1
                                END
                            ) AS in_progress,

                    COUNT(
                                CASE
                                WHEN appointment_status = 'COMPLETED'
                                THEN 1
                                END
                    ) AS completed,

                    COUNT(
                                CASE
                                WHEN appointment_status = 'CANCELLED'
                                THEN 1 
                                END
                        ) AS cancelled
                    
                    FROM appointments
                    """)
        
        stats = cursor.fetchone()

        # revenue 
        cursor.execute("""
                    SELECT
                            COALESCE(SUM(amount), 0) AS revenue
                    FROM payments
                    WHERE payment_status = 'SUCCESS'
            """)
        
        revenue = cursor.fetchone()

        stats["revenue"] = revenue["revenue"]

        return stats
    
    except Exception as e :
        print("Error fetching appointment stats:", e)
        return {}
    
    finally:
        cursor.close()
        connection.close()


def get_staff_list():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :
        cursor.execute("""
                    SELECT 
                        staff_id,
                       CONCAT(first_name, ' ', last_name)
                       AS staff_name
                    FROM staff
                       ORDER BY first_name    
                    """)
        return cursor.fetchall()
    
    except Exception as e:
          print("Error fetching staff:", e)
          return []
    
    finally:
        cursor.close()
        connection.close()

#================================== manager related functions========================================
def update_appointment(appointment_id, appointment_status, staff_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    try :
         cursor.execute("""
                        UPDATE appointments
                        SET
                            appointment_status = %s,
                            staff_id = %s
                        WHERE booking_service_id = %s
                    """, (
                        appointment_status.upper(),
                        staff_id,
                        appointment_id
                    ))

        
         connection.commit()
 
         return True
    
    except Exception as e:
        print("Error updating appointment", e)

        connection.rollback()

        return False
    
    finally:
        cursor.close()
        connection.close()


def update_appointment_status(appointment_id, status):

    connection= get_db_connection()
    cursor = connection.cursor()

    try :
        cursor.execute("""
                       UPDATE appointments
                       SET appointment_status = %s
                       WHERE appointment_id = %s
                       """, (status,appointment_id))
        
        connection.commit()

        return True
    
    except Exception as e:
        print(
            "Error updating appointment status:",
            e
        )

        connection.rollback()

        return False
    
    finally:
        cursor.close()
        connection.close()

def get_receptionist_appointment_stats():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                COUNT(*) FILTER (
                    WHERE appointment_date = CURRENT_DATE
                ) AS total_today,

                COUNT(*) FILTER (
                    WHERE status = 'scheduled'
                ) AS pending,

                COUNT(*) FILTER (
                    WHERE status = 'completed'
                    AND appointment_date = CURRENT_DATE
                ) AS completed_today,

                COUNT(*) FILTER (
                    WHERE booking_type = 'walk_in'
                ) AS walkin_customers

            FROM appointments
        """)

        return cursor.fetchone()

    except Exception as e:
        print("Error fetching appointment stats:", e)
        return {
            "total_today": 0,
            "pending": 0,
            "completed_today": 0,
            "walkin_customers": 0
        }

    finally:
        cursor.close()
        connection.close()