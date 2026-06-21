# This route contain all the dashboard related part for admin, manager, recetionist, and staff

from flask import Blueprint, session, redirect , render_template
from utils.decorators import login_required, role_required
from python_database.db import get_db_connection

from flask import url_for

dashboard_bp = Blueprint("dashboard", 
                         __name__,
                         url_prefix="/dashboard")


@dashboard_bp.route("/")
@login_required
def dashboard():

     role_id = session.get("role_id")

     if role_id ==1:
         return redirect("/dashboard/admin")
     
     elif role_id ==2:
            return redirect("/dashboard/manager")
     
     elif role_id ==3:
          return redirect("/dashboard/receptionist")
     
     elif role_id == 4:
          return redirect("/dashboard/staff")
     
     elif role_id ==5:
          return redirect(url_for("user.home"))
     
     
     session.clear()
     return redirect("/")



@dashboard_bp.route("/admin")
@login_required
@role_required([1])
def admin_dashboard():

    connection = get_db_connection()

    cursor = connection.cursor()

    # total staff

    cursor.execute("""SELECT COUNT(*) FROM staff""")
    total_staff = cursor.fetchone()[0]

    # total customer
    cursor.execute("""
                SELECT COUNT(*) FROM  customers
                   """)
    total_customers = cursor.fetchone()[0]

    # total services
    cursor.execute("""
                SELECT COUNT(*) FROM  services
                   """)
    total_services = cursor.fetchone()[0]

    # total booking
    cursor.execute("""
               SELECT COUNT(*)FROM bookings
                   """)
    total_bookings = cursor.fetchone()[0]
    
    # recent appointment 
    cursor.execute("""
                   SELECT 
                   c.full_name, 
                   s.service_name, 
                   b.booking_date,
                   b.booking_id,
                   b.booking_status
                   FROM bookings b
                   
                   JOIN customers c
                   ON b.customer_id = c.customer_id
                   
                   JOIN booking_services bs
                   ON b.booking_id = bs.booking_id
                   
                   JOIN services s
                   ON bs.service_id = s.service_id
                   
                   ORDER BY b.created_at DESC
                   LIMIT 5""")
    
    recent_bookings = cursor.fetchall()
    
    cursor.close()
    connection.close()

    return render_template(
         "dashboard/admin/dashboard.html",
         total_staff= total_staff,
         total_customers= total_customers,
         total_services = total_services,
         total_bookings= total_bookings,
         recent_bookings = recent_bookings
    )

@dashboard_bp.route("/manager")
@login_required
@role_required([2])
def manager_dashboard():

     connection = get_db_connection()
     cursor = connection.cursor()

     #today's appointment
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM bookings
                    WHERE booking_date = CURRENT_DATE
                    """)
     todays_appointments = cursor.fetchone()[0]

     #pending appointments

     cursor.execute("""
                    SELECT COUNT(*)
                    FROM bookings
                    WHERE booking_status = 'PENDING'
                    """)
     pending_appointments = cursor.fetchone()[0]

     # Available staff
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM staff
                    WHERE is_available = TRUE
                    """)
     available_staff = cursor.fetchone()[0]

     # total staff
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM staff""")
     total_staff = cursor.fetchone()[0]

     # total revenue
     cursor.execute("""
                    SELECT COALESCE(SUM(bs.price_snapshot), 0)

                         FROM booking_services bs

                         JOIN bookings b
                         ON bs.booking_id = b.booking_id

                         WHERE b.booking_date = CURRENT_DATE
                         AND b.booking_status = 'COMPLETED'
                    """)
     todays_revenue = cursor.fetchone()[0]

     # walk-in customers  today
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM customers
                    WHERE created_at::date = CURRENT_DATE
                    """)
     walk_in_customers = cursor.fetchone()[0]

     # service complete today
     cursor.execute("""
          SELECT COUNT(*)
          FROM bookings
          WHERE booking_status = 'COMPLETED'
          AND booking_date = CURRENT_DATE
     """)
     services_completed = cursor.fetchone()[0]

     # todays schedule table

     cursor.execute("""
    SELECT
        c.full_name,
        s.service_name,
        st.first_name,
        a.start_time,
        LOWER(b.booking_status)

          FROM bookings b

          JOIN customers c
          ON b.customer_id = c.customer_id

          JOIN booking_services bs
          ON b.booking_id = bs.booking_id

          JOIN services s
          ON bs.service_id = s.service_id

          JOIN appointments a
          ON b.booking_id = a.booking_id

          JOIN staff st
          ON a.staff_id = st.staff_id

          WHERE b.booking_date = CURRENT_DATE

          ORDER BY a.start_time ASC
          """)

     appointments = cursor.fetchall()
     
     

     cursor.close()
     connection.close()


     return render_template("dashboard/manager/dashboard.html",
                             
                              todays_appointments=todays_appointments,
                              pending_appointments=pending_appointments,
                              available_staff=available_staff,
                              total_staff=total_staff,
                              todays_revenue=todays_revenue,
                              walk_in_customers=walk_in_customers,
                              services_completed=services_completed,
                              appointments=appointments)


@dashboard_bp.route("/receptionist")
@login_required
@role_required([3])
def receptionist_dashboard():

     connection = get_db_connection()
     cursor = connection.cursor()

     # todays appointment 

     cursor.execute("""
                     SELECT COUNT(*)
                    FROM bookings
                    WHERE booking_date = CURRENT_DATE
                     """)
     todays_appointments = cursor.fetchone()[0]

     # pending appointments
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM bookings
                    WHERE booking_status = 'PENDING'
                    AND booking_date = CURRENT_DATE
                    """)
     pending_appointments = cursor.fetchone()[0]

     # confirmed booking
     cursor.execute("""
                   SELECT COUNT(*)
                    FROM bookings
                    WHERE booking_status = 'CONFIRMED'
                    AND booking_date = CURRENT_DATE
                    """)
     confirmed_bookings = cursor.fetchone()[0]

     # walk-in customers  today
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM customers
                    WHERE created_at::date = CURRENT_DATE
                    """)
     walk_in_customers = cursor.fetchone()[0]

     # today revenue
     cursor.execute("""
                    SELECT COALESCE(SUM(bs.price_snapshot),0)
                    FROM booking_services bs

                    JOIN bookings b
                    ON bs.booking_id = b.booking_id
                    WHERE b.booking_date = CURRENT_DATE 
                    AND b.booking_status = 'COMPLETED'
                    """)
     todays_revenue = cursor.fetchone()[0]

     # new customers
     cursor.execute("""
                     SELECT COUNT(*)
                    FROM customers
                    WHERE created_at::date = CURRENT_DATE
                     """)
     new_customers = cursor.fetchone()[0]

     # todays appointment table 
     cursor.execute("""
                    SELECT 
                    c.full_name,
                    s.service_name,
                    st.first_name,
                    a.start_time,
                    LOWER(b.booking_status)
                    
                    FROM bookings b
                    
                    JOIN customers c
                    ON b.customer_id = c.customer_id
                    
                    JOIN booking_services bs
                    ON bs.booking_id = b.booking_id
                    
                    JOIN services s
                    ON bs.service_id = s.service_id
                    
                    JOIN appointments a
                    ON b.booking_id = a.booking_id
                    
                    JOIN staff st
                    ON a.staff_id = st.staff_id
                    
                    WHERE b.booking_date = CURRENT_DATE
                    
                    ORDER BY a.start_time ASC
                    LIMIT 10 
                    """)
     
     appointments = cursor.fetchall()

     # recent customers
     cursor.execute("""
                    SELECT
                    full_name,
                    phone,
                    TO_CHAR(created_at, 'DD Mon YYYY') AS created_at
                    FROM customers
                    ORDER BY created_at DESC
                    LIMIT 7
                    """)
     recent_customers = cursor.fetchall()

     cursor.close()
     connection.close()

     return render_template(
          "dashboard/receptionist/dashboard.html",
          todays_appointments=todays_appointments,
          pending_appointments=pending_appointments,
          confirmed_bookings=confirmed_bookings,
          walk_in_customers=walk_in_customers,
          todays_revenue=todays_revenue,
          new_customers=new_customers,
          appointments=appointments,
          recent_customers=recent_customers)




from datetime import datetime

@dashboard_bp.route("/staff")
@login_required
@role_required([4])
def staff_dashboard():

     connection = get_db_connection()
     cursor = connection.cursor()

     # logged in 
     user_id = session.get("user_id")

     # staff details 
     cursor.execute("""
                       SELECT staff_id,
                      first_name
                     FROM staff 
                     WHERE user_id = %s
                     """, (user_id,))
     
     staff_data = cursor.fetchone()

     # safety check
     if not staff_data:
          cursor.close()
          connection.close()
          session.clear()
          return redirect("/")
     
     staff_id = staff_data[0]
     staff_name = staff_data[1]

     # todays appointment 
     cursor.execute("""
                     SELECT COUNT(*)
                    FROM appointments
                    WHERE staff_id = %s
                    AND appointment_date = CURRENT_DATE
                    """, (staff_id,))
     todays_appointments = cursor.fetchone()[0]

     # completed services
     cursor.execute("""
                    SELECT COUNT(*)
                    FROM appointments 
                    WHERE staff_id = %s
                    AND appointment_status = 'COMPLETED'
                    """, (staff_id,))
     completed_services = cursor.fetchone()[0]

     # pending appointments
     cursor.execute("""
              SELECT COUNT(*)
                    FROM appointments 
                    WHERE staff_id =%s
                    AND appointment_status = 'PENDING'
                    """, (staff_id,))
     pending_appointments = cursor.fetchone()[0]

     # todays revenue
     cursor.execute("""
                    SELECT COALESCE(SUM(bs.price_snapshot),0)
                    FROM appointments a
                    
                    JOIN bookings b
                    ON a.booking_id = b.booking_id
                    
                    JOIN booking_services bs
                    ON bs.booking_id = b.booking_id
                    
                    WHERE a.staff_id = %s
                    AND a.appointment_date = CURRENT_DATE
                    AND a.appointment_status = 'COMPLETED'
                    """, (staff_id,))
     todays_revenue = cursor.fetchone()[0]


     # today's schedule table
     cursor.execute("""
    SELECT
        c.full_name,
        s.service_name,
        a.start_time,
        LOWER(a.appointment_status)

     FROM appointments a

     JOIN bookings b
     ON a.booking_id = b.booking_id

     JOIN customers c
     ON b.customer_id = c.customer_id

     JOIN booking_services bs
     ON b.booking_id = bs.booking_id

     JOIN services s
     ON bs.service_id = s.service_id

     WHERE a.staff_id = %s
     AND a.appointment_date = CURRENT_DATE

     ORDER BY a.start_time ASC
     """, (staff_id,))

     todays_schedule = cursor.fetchall()

     # most performed service by staff

     cursor.execute("""
                    SELECT 
                    s.service_name,
                    COUNT(*) AS total_count
                    
                    FROM appointments a
                    
                    JOIN bookings b 
                    ON a.booking_id = b.booking_id
                    
                    JOIN booking_services bs
                    ON b.booking_id = bs.booking_id
                    
                    JOIN services s
                    ON bs.service_id = s.service_id
                    
                    WHERE a.staff_id = %s
                    AND a.appointment_status = 'COMPLETED'
                    GROUP BY s.service_name
                    ORDER BY total_count DESC
                    LIMIT 1
                    """, (staff_id ,))
     
     service_data = cursor.fetchone()

     most_performed_service = (
          service_data[0]
          if service_data
          else "No Service"
          )
     # total clients served by staff
     cursor.execute("""
                      SELECT COUNT(DISTINCT b.customer_id)
                     FROM appointments a
                    
                    JOIn Bookings b 
                    ON a.booking_id = b.booking_id
                    
                    WHERE a.staff_id = %s
                    AND a.appointment_status = 'COMPLETED'
                    """, (staff_id,))

     total_clients_served = cursor.fetchone()[0]

     # monthly completed services

     cursor.execute("""
                    SELECT COUNT (*)
                    FROM appointments
                    WHERE staff_id = %s
                    AND appointment_status = 'COMPLETED'
                    
                    AND DATE_TRUNC('month', appointment_date) = 
                    DATE_TRUNC('month', CURRENT_DATE)
                    """, (staff_id,))
     
     monthly_completed_services = cursor.fetchone()[0]


     cursor.close()
     connection.close()

     return render_template(
          "dashboard/staff/dashboard.html",
          staff_name=staff_name,
          todays_appointments=todays_appointments,
          completed_services=completed_services,
          pending_appointments=pending_appointments,
          now=datetime.now(),
          todays_revenue=todays_revenue,
          todays_schedule=todays_schedule,
          most_performed_service=most_performed_service,
          total_clients_served=total_clients_served,
          monthly_completed_services=monthly_completed_services)
