# User module contains all the function related to customer page

from python_database.db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import uuid

# Home page

def get_featured_services(limit = 4):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
                    SELECT
                       s.service_id,
                       s.service_name,
                       s.description,
                       s.price,
                       s.duration_minutes,
                       sc.category_name

                       FROM services s

                       JOIN service_categories sc
                       ON s.category_id = sc.category_id
                       WHERE s.is_active = TRUE
                       ORDER BY service_id DESC
                       LIMIT %s
                       """, (limit,))
        
        services = cursor.fetchall()
        return services
    
    except Exception as e:
        print("Error to show services", e)
        return []
    
    finally:
        cursor.close()
        connection.close()    

# Service page

def get_all_services():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory= RealDictCursor)

    try:
       cursor.execute( """SELECT
                        s.service_id,
                      s.service_name,
                      s.description,
                      s.duration_minutes,
                      s.price,
                      sc.category_name

                      FROM services s
                      JOIN service_categories sc
                      ON s.category_id = sc.category_id
                      WHERE s.is_active = TRUE
                      ORDER BY s.service_name ASC

                        """)
       all_services = cursor.fetchall()
       return all_services
    
    except Exception as e:
        print("Error to fetch all services", e)
        return []  

    finally:
        cursor.close()
        connection.close()

def get_service_by_id(service_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(""" SELECT
                        s.service_id,
                        s.service_name,
                        s.description,
                        s.duration_minutes,
                        s.price,
                        sc.category_name
            FROM services s
            JOIN service_categories sc
                ON s.category_id = sc.category_id
            WHERE s.service_id = %s
            AND s.is_active = TRUE
            LIMIT 1
        """, (service_id,))

        
        service = cursor.fetchone()
        return service

    except Exception as e:
        print("Error", e)
        return []

    finally :
        cursor.close()
        connection.close()

def get_staff_by_service(service_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                st.staff_id,
                st.first_name,
                st.last_name,
                ss.experience_level
            FROM staff_services ss
            JOIN staff st
                ON ss.staff_id = st.staff_id
            WHERE ss.service_id = %s
            AND ss.is_active = TRUE
            AND st.employment_status = 'ACTIVE'
            AND st.is_available = TRUE
            ORDER BY
                CASE ss.experience_level
                    WHEN 'EXPERT' THEN 1
                    WHEN 'ADVANCED' THEN 2
                    WHEN 'INTERMEDIATE' THEN 3
                    ELSE 4
                END
        """, (service_id,))

        staff = cursor.fetchall()

        return staff

    except Exception as e:
        print("Error fetching staff:", e)
        return []

    finally:
        cursor.close()
        connection.close()


# =====================================Appointment=================
 
def get_appointment_services():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory= RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                s.service_id,
                s.service_name,
                s.description,
                s.duration_minutes,
                s.price,
                sc.category_name
            FROM services s
            JOIN service_categories sc
                ON s.category_id = sc.category_id
            WHERE s.is_active = TRUE
            ORDER BY s.service_name ASC
        """)

        services = cursor.fetchall()

        return services

    except Exception as e:
        print("Error fetching appointment services:", e)
        return []

    finally:
        cursor.close()
        connection.close()  


def create_booking_appointment(form_data):

    connection = get_db_connection()
    cursor = connection.cursor(
        cursor_factory=RealDictCursor
    )

    try:

      
        # Input data 
      

        full_name = form_data.get("full_name")
        email = form_data.get("email")
        phone = form_data.get("phone")
        booking_date = form_data.get("date")
        booking_time = form_data.get("time")
        selected_services = form_data.getlist("services")
        notes = form_data.get("notes", "")

      
        # Validation
      

        if not all([
            full_name,
            email,
            phone,
            booking_date,
            booking_time
        ]):
            raise Exception(
                "Missing booking details"
            )

        if not selected_services:
            raise Exception(
                "No services selected"
            )

      
        # customer check already present or not
      

        cursor.execute("""
            SELECT
                customer_id,
                customer_status
            FROM customers
            WHERE email = %s
            OR phone = %s
            LIMIT 1
        """, (email, phone))

        customer = cursor.fetchone()

        # Existing customer
        if customer:

            customer_id = customer[
                "customer_id"
            ]

            # Update REGISTERED → CLIENT
            if customer[
                "customer_status"
            ] == "REGISTERED":

                cursor.execute("""
                    UPDATE customers
                    SET customer_status = 'CLIENT'
                    WHERE customer_id = %s
                """, (customer_id,))

        # New customer
        else:

            cursor.execute("""
                INSERT INTO customers (
                    full_name,
                    email,
                    phone,
                    login_provider,
                    customer_status
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    'EMAIL',
                    'CLIENT'
                )
                RETURNING customer_id
            """, (
                full_name,
                email,
                phone
            ))

            customer_id = cursor.fetchone()[
                "customer_id"
            ]

      
        # Creating Bookings
      

        cursor.execute("""
            INSERT INTO bookings (
                customer_id,
                booking_date,
                booking_time,
                booking_status,
                notes
            )
            VALUES (
                %s,
                %s,
                %s,
                'CONFIRMED',
                %s
            )
            RETURNING booking_id
        """, (
            customer_id,
            booking_date,
            booking_time,
            notes
        ))

        booking_id = cursor.fetchone()[
            "booking_id"
        ]

      
        # Creating Appointment
      

        current_time = datetime.strptime(
            booking_time,
            "%H:%M:%S"
        )

        created_appointments = []

        for service_id in selected_services:

            
            # SERVICE DETAILS
            
            cursor.execute("""
                SELECT
                    service_id,
                    duration_minutes,
                    price
                FROM services
                WHERE service_id = %s
                AND is_active = TRUE
            """, (service_id,))

            service = cursor.fetchone()

            if not service:
                continue

            
            # Booking service
            
            cursor.execute("""
                INSERT INTO booking_services (
                    booking_id,
                    service_id,
                    quantity,
                    price_snapshot
                )
                VALUES (
                    %s,
                    %s,
                    1,
                    %s
                )
                RETURNING booking_service_id
            """, (
                booking_id,
                service_id,
                service["price"]
            ))

            booking_service_id = cursor.fetchone()[
                "booking_service_id"
            ]

            
            # Staff assignment
            
            cursor.execute("""
                SELECT
                    st.staff_id
                FROM staff_services ss

                JOIN staff st
                    ON ss.staff_id =
                    st.staff_id

                WHERE ss.service_id = %s
                AND ss.is_active = TRUE
                AND st.is_available = TRUE
                AND st.employment_status = 'ACTIVE'

                ORDER BY
                    CASE
                        WHEN ss.experience_level =
                            'EXPERT'
                        THEN 1

                        WHEN ss.experience_level =
                            'ADVANCED'
                        THEN 2

                        WHEN ss.experience_level =
                            'INTERMEDIATE'
                        THEN 3

                        ELSE 4
                    END

                LIMIT 1
            """, (service_id,))

            staff = cursor.fetchone()

            if not staff:
                raise Exception(
                    "No staff available "
                    "for selected service"
                )

            staff_id = staff["staff_id"]

            
            # Time calculation
            
            start_time = current_time

            end_time = (
                current_time
                + timedelta(
                    minutes=service[
                        "duration_minutes"
                    ]
                )
            )

            
            # create appointment 
            
            cursor.execute("""
                INSERT INTO appointments (
                    booking_id,
                    booking_service_id,
                    staff_id,
                    appointment_date,
                    start_time,
                    end_time,
                    appointment_status,
                    assigned_by,
                    priority_score
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    'SCHEDULED',
                    'SYSTEM',
                    90
                )
                RETURNING appointment_id
            """, (
                booking_id,
                booking_service_id,
                staff_id,
                booking_date,
                start_time.time(),
                end_time.time()
            ))

            appointment_id = cursor.fetchone()[
                "appointment_id"
            ]

            created_appointments.append(
                appointment_id
            )

            # next service start time
            current_time = end_time

      
        # Total amount
      

        cursor.execute("""
            SELECT
                COALESCE(
                    SUM(price_snapshot),
                    0
                ) AS total
            FROM booking_services
            WHERE booking_id = %s
        """, (booking_id,))

        total_amount = cursor.fetchone()[
            "total"
        ]

      
        # Fake payemnt
      

        if created_appointments:

            transaction_reference = (
                "DEMO-"
                + uuid.uuid4()
                .hex[:8]
                .upper()
            )

            cursor.execute("""
                INSERT INTO payments (
                    appointment_id,
                    amount,
                    payment_status,
                    transaction_reference
                    
                )
                VALUES (
                    %s,
                    %s,
                    'PENDING',
                    %s
                )
            """, (
                created_appointments[0],
                total_amount,
                transaction_reference
            ))

      
        # Commit
      

        connection.commit()

        return {
            "success": True,
            "booking_id": booking_id
        }

    except Exception as e:

        connection.rollback()

        print(
            "Booking Error:",
            e
        )

        return {
            "success": False,
            "message": str(e)
        }

    finally:
        cursor.close()
        connection.close()

# profile part

def get_customer_profile(user_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
                       SELECT
                        c.customer_id,
                       c.full_name,
                       c.email,
                       c.phone,
                       c.created_at,
                       u.user_code
                       
                       FROM customers c
                        JOIN users u
                       ON c.user_id =u.user_id
                       
                       WHERE c.user_id = %s
                       """, (user_id,))
        
        return cursor.fetchone()
    
    finally:
        cursor.close()
        connection.close()

# My appointment part

def get_my_appointments(user_id):

    connection = get_db_connection()
    cursor =connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
                        SELECT
                        a.appointment_id,
                        a.appointment_date,
                       a.start_time,
                       a.appointment_status,
                       
                       p.payment_status,
                       
                       s.first_name,
                       s.last_name,
                       
                       STRING_AGG(
                             sv.service_name,
                           ', '
                       ) AS services

                       FROM customers c

                       JOIN bookings b
                       ON c.customer_id = b.customer_id

                       JOIN appointments a
                       ON a.appointment_id = a.booking_id

                       LEFT JOIN payments p
                       ON a.appointment_id = p.appointment_id

                       LEFT JOIN staff s
                       ON a.staff_id = s.staff_id

                       LEFT JOIN booking_services bs
                       ON b.booking_id =bs.booking_id

                       LEFT JOIN services sv
                       ON bs.service_id = sv.service_id

                       WHERE c.user_id = %s

                       GROUP BY 
                       a.appointment_id,
                       p.payment_status,
                       s.first_name,
                       s.last_name

                       ORDER BY 
                         a.appointment_date DESC
                       
                        """,(user_id,))

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()
        
              
