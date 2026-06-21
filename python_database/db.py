import psycopg2
from config import Config

def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=Config.DB_HOST,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            port=Config.DB_PORT
        )

        print("Database connection successful")
        
        return connection
    
    except Exception as e:
        print("Database connection failed", e)

        return None