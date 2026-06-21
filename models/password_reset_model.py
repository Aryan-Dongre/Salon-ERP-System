# this models contains all the function related to reset password

from psycopg2.extras import RealDictCursor
from python_database.db import get_db_connection
from datetime import datetime, timedelta

def get_customer_by_email(email):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
                    SELECT
                       c.customer_id,
                       c.user_id,
                       c.full_name,
                       c.email
                       FROM customers c
                       WHERE c.email = %s
                       """,(email,))
        customer = cursor.fetchone()

        return customer
    
    finally:
        cursor.close()
        connection.close()

def create_reset_token(user_id, hashed_token):
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        expires_at = (
            datetime.now() + timedelta(minutes=30)
        )

        cursor.execute("""
                       INSERT INTO password_resets(
                       user_id, reset_token, expires_at
                       )
                       VALUES (
                       %s,
                       %s,
                       %s
                       ) RETURNING reset_id
                       """,(user_id, hashed_token, expires_at))
        
        reset_record = cursor.fetchone()

        connection.commit()

        return reset_record
    
    except Exception as e:
        connection.rollback()

        print(
            f"Reset token creation error: {e}"
        )

        return None
    
    finally:
        cursor.close()
        connection.close()

def get_valid_token(hashed_token):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
                        SELECT 
                        reset_id,
                       user_id,
                       reset_token,
                       expires_at,
                       is_used
                       FROM password_resets
                       WHERE reset_token = %s
                       AND is_used = FALSE
                       AND expires_at > CURRENT_TIMESTAMP
                       """,(hashed_token,))

        reset_record = cursor.fetchone()

        return reset_record

    finally:
        cursor.close()
        connection.close()

def invalidate_reset_token(reset_id):

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(""" 
                       UPDATE password_resets
                       SET is_used = TRUE
                       WHERE reset_id = %s
                       """ ,(reset_id,))
        
        connection.commit()

        return True
    
    except Exception as e:

        connection.rollback()

        print(
            f"Token invalidation error: {e}"
        )

        return False
    
    finally:
        cursor.close()
        connection.close()

def update_user_password(
    user_id,
    password_hash
):

    connection = get_db_connection()

    cursor = connection.cursor(
        cursor_factory=RealDictCursor
    )

    try:

        cursor.execute("""
            UPDATE users
            SET password_hash = %s
            WHERE user_id = %s
        """,
        (
            password_hash,
            user_id
        ))

        connection.commit()

        return True

    except Exception as e:

        connection.rollback()

        print(
            f"Password update error: {e}"
        )

        return False

    finally:

        cursor.close()
        connection.close()        
