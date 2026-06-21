from functools import wraps
from flask import session, redirect , url_for, request

def login_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        if "user_id" not in session:
            return redirect(url_for("auth.login"))
        
        
        return func(*args, **kwargs)
    
    return wrapper

def role_required(allowed_roles):

    def decorator(func):

        @wraps(func)
        def wrapper(*args, **kwargs):

            if "role_id" not in session:
                return redirect(url_for("auth.login", next=request.url))
            
            if session["role_id"] not in allowed_roles:
                return "Unauthorized access. You do not have permission to view this page."
            
            return func(*args, **kwargs)
        
        return wrapper
    
    return decorator

    