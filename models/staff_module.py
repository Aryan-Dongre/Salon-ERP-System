# Staff module contains all the function related to staff for all the roles

from python_database.db import get_db_connection
from psycopg2.extras import RealDictCursor
import math 

from utils.auth import hash_password

def get_staff():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:

        cursor.execute("""
            SELECT
                COUNT(*) AS total_staff,

                COUNT(
                    CASE
                        WHEN is_available = TRUE
                        THEN 1
                    END
                ) AS present_staff,

                COUNT(
                    CASE
                        WHEN is_available = FALSE
                        THEN 1
                    END
                ) AS absent_staff

            FROM staff
            WHERE employment_status = 'ACTIVE'
        """)

        stats = cursor.fetchone()

        return {
            "total_staff": stats["total_staff"],
            "present_staff": stats["present_staff"],
            "absent_staff": stats["absent_staff"]
        }

    except Exception as e:
        print("Error in get_staff_stats:", e)

        return {
            "total_staff": 0,
            "present_staff": 0,
            "absent_staff": 0
        }

    finally:
        cursor.close()
        connection.close()


def get_staff_list(
    page=1,
    per_page=10,
    search_name="",
    search_staff_id=""
):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:

        offset = (page - 1) * per_page

        query = """
            SELECT
                s.staff_id,

                CONCAT(
                    s.first_name,
                    ' ',
                    COALESCE(s.last_name, '')
                ) AS full_name,

                s.phone,
                s.gender,
                s.specialization,
                s.employment_status,

                r.role_name

            FROM staff s

            JOIN users u
                ON s.user_id = u.user_id

            JOIN roles r
                ON u.role_id = r.role_id

            WHERE r.role_name = 'STAFF'
        """

        params = []

        # Search by name
        if search_name:

            query += """
                    AND (
                        LOWER(s.first_name) LIKE LOWER(%s)
                        OR LOWER(COALESCE(s.last_name, '')) LIKE LOWER(%s)
                        OR LOWER(
                            CONCAT(
                                s.first_name,
                                ' ',
                                COALESCE(s.last_name, '')
                            )
                        ) LIKE LOWER(%s)
                    )
                """

            params.extend([
                f"%{search_name}%",
                f"%{search_name}%",
                f"%{search_name}%"
    ])

        # Search by staff id
        if search_staff_id:

            query += """
                AND CAST(s.staff_id AS TEXT)
                LIKE %s
            """

            params.append(f"%{search_staff_id}%")

        # Count total records
        count_query = f"""
            SELECT COUNT(*)
            FROM ({query}) AS total
        """

        cursor.execute(count_query, params)

        total_records = cursor.fetchone()["count"]

        total_pages = max(
            1, 
            math.ceil(
            total_records / per_page)
        )

        # Pagination
        query += """
            ORDER BY s.staff_id DESC
            LIMIT %s OFFSET %s
        """

        params.extend([per_page, offset])

        cursor.execute(query, params)

        staff_list = cursor.fetchall()

        return {
            "staff": staff_list,
            "current_page": page,
            "total_pages": total_pages,
            "total_records": total_records
        }

    except Exception as e:

        print("Error in get_staff_list:", e)

        return {
            "staff": [],
            "current_page": 1,
            "total_pages": 0,
            "total_records": 0
        }

    finally:
        cursor.close()
        connection.close()

# Admin 
def get_all_staff():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :

        query = """
                     SELECT 
                     s.staff_id,
                     CONCAT(
                     s.first_name,
                        ' ',
                          COALESCE(s.last_name, '')
                         ) AS full_name,
                      s.email, 
                      s.phone,
                      s.gender,
                      s.salary,
                      s.specialization,
                      s.employment_status,

                      r.role_name 

                      FROM staff s

                      JOIN users u
                      ON s.user_id = u.user_id

                      JOIN roles r
                      ON u.role_id = r.role_id

                      WHERE r.role_name = 'STAFF'
                      ORDER BY s.staff_id 
                      """        
        
        cursor.execute(query)

        staff_data = cursor.fetchall()

        return staff_data
    
    except Exception as e:
        print(f"Error fetching staff: {e}")
        return []
    
    finally:
        cursor.close()
        connection.close()

def get_card_details ():

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory = RealDictCursor) 

    try :
        query = """
               SELECT 
               COUNT(*) AS total_staff,
               
               COUNT(
                      CASE 
                           WHEN employment_status = 'ACTIVE'
                           THEN 1
                        END
                    ) AS active_staff,
                    
                COUNT(
                        DISTINCT specialization 
                     ) AS specialization_count,
                
                COALESCE(
                         SUM(salary),0
                         ) AS total_salary
                          
                FROM staff 
                
                """
        cursor.execute(query)

        stats = cursor.fetchone()

        return stats
    
    except Exception as e:
          print(
            "Error in get_staff_stats:",
            e
        )
          
          return {
              "total_staff": 0,
            "active_staff": 0,
            "specialization_count": 0,
            "total_salary": 0
          }   
    
    finally :
        cursor.close()
        connection.close()

def update_specialization(staff_id, specialization):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :
         query = """
                UPDATE staff
                SET specialization = %s
                WHERE staff_id = %s
                """
         cursor.execute(query,
                        (
                            specialization,
                            staff_id
                        )
                        )
         connection.commit()

         return True
    
    except Exception as e:
        connection.rollback()

        print("Error updating specialization:",e)

        return False
    
    finally :
        cursor.close()
        connection.close()


def update_staff_status(staff_id, status):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try :

        query = """
               UPDATE staff
               SET employment_status = %s
               WHERE staff_id = %s
               """
        
        cursor.execute(query,(status, staff_id))

        connection.commit()

        return True
    
    except Exception as e:
        print( "Error updating staff status:",e)

        return False
    
    finally:
        cursor.close()
        connection.close()

def remove_staff(staff_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    try :

        query = """
                DELETE FROM staff
                WHERE staff_id = %s
                """
        
        cursor.execute(query, (staff_id,))

        connection.commit()

        return True
    
    except Exception as e:
        print( "Error removing staff:", e)

        return False
    
    finally :
         cursor.close()
         connection.close()


def update_details(staff_id,
                   first_name,
                   last_name,
                   email,
                   phone,
                   salary,
                   gender,
                   specialization,
                   employment_status):
    
    connection = get_db_connection()
    cursor = connection.cursor()

    try :

        query = """
                UPDATE staff
                SET 
                    first_name = %s,
                    last_name = %s,
                    email = %s,
                    phone = %s,
                    salary = %s,
                    gender =%s,
                    specialization = %s,
                    employment_status = %s

                    WHERE staff_id = %s
                """
        cursor.execute(query, (
                        first_name,
                        last_name,
                        email,
                        phone,
                        salary,
                        gender,
                        specialization,
                        employment_status,
                        staff_id
        )
        ) 

        connection.commit()

        return True
    
    except Exception as e :
        print("Error updating staff:", e)

        return False
    
    finally :
        cursor.close()
        connection.close()


def add_staff(data):

    connection =get_db_connection()
    cursor = connection.cursor()

    try : 

        hashed_password = hash_password(data["password"])

        # insert query 

        user_query  = """INSERT INTO users (
                role_id,
                user_code,
                password_hash,
                is_active
            )
            VALUES (
                %s, %s, %s, %s
            )
            RETURNING user_id
        """

        user_values = (
            data["role_id"],
            data["user_code"],
            hashed_password,
            True
        )

        cursor.execute(user_query, user_values)

        user_id = cursor.fetchone()[0]

        # insert into staff 

        staff_query = """
            INSERT INTO staff (
                user_id,
                first_name,
                last_name,
                email,
                phone,
                gender,
                joining_date,
                salary,
                specialization,
                employment_status
            )
            VALUES (
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s
            )
        """

        staff_values = (
            user_id,
            data["first_name"],
            data["last_name"],
            data["email"],
            data["phone"],
            data["gender"],
            data["joining_date"],
            data["salary"],
            data["specialization"],
            data["employment_status"]
        )

        cursor.execute(
            staff_query,
            staff_values
        )

        connection.commit()

        return {
            "success": True,
            "message": "staff added successfully"
        }
    
    except Exception as e:

        connection.rollback()

        print(
            "ADD STAFF ERROR:",
            e
        )

        return {
            "success": False,
            "message": str(e)
        }

    finally:

        cursor.close()
        connection.close()

