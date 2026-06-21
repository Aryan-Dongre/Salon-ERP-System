from python_database.db import get_db_connection
from utils.auth import hash_password

def get_user_by_code(user_code):

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """SELECT user_id, role_id, 
            user_code, password_hash, 
            is_active
    FROM users
    WHERE user_code = %s """ 

    cursor.execute(query, (user_code,))
    user= cursor.fetchone()

    cursor.close()
    conn.close()

    return user

def register_customer(
    full_name,
    email,
    password
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        # Check email already exists

        cursor.execute(
            """
            SELECT customer_id
            FROM customers
            WHERE email = %s
            """,
            (email,)
        )

        existing_customer = cursor.fetchone()

        if existing_customer:

            return {
                "success": False,
                "message": "Email already registered"
            }

        # Generate customer code

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM users
            WHERE role_id = 5
            """
        )

        count = cursor.fetchone()[0]

        user_code = email

        # Hash password

        password_hash = hash_password(
            password
        )

        # Insert user

        cursor.execute(
            """
            INSERT INTO users
            (
                role_id,
                user_code,
                password_hash
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            RETURNING user_id
            """,
            (
                5,
                user_code,
                password_hash
            )
        )

        user_id = cursor.fetchone()[0]

        # Insert customer

        cursor.execute(
            """
            INSERT INTO customers
            (
                user_id,
                full_name,
                email
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            """,
            (
                user_id,
                full_name,
                email
            )
        )

        conn.commit()

        return {
            "success": True,
            "message": (
                f"Account created successfully. "
                f"Your User Code is {user_code}"
            )
        }

    except Exception as e:

        conn.rollback()

        print(
            "REGISTER CUSTOMER ERROR:",
            e
        )

        return {
            "success": False,
            "message": "Registration failed"
        }

    finally:

        cursor.close()
        conn.close()