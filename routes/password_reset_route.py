# This route contains all reset password things

from flask import Blueprint, render_template 
from flask import redirect , url_for , session
from flask import request
from datetime import date
from flask import flash

from models.password_reset_model import get_customer_by_email
from models.password_reset_model import create_reset_token
from models.password_reset_model import get_valid_token
from models.password_reset_model import invalidate_reset_token
from models.password_reset_model import update_user_password

from utils.password_token import generate_password_reset_token
from utils.password_token import verify_signed_token
from utils.password_token import hash_token

password_reset_bp = Blueprint("password_reset", __name__)

@password_reset_bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():

    if request.method == "POST":

        email = request.form.get("email")

        customer =get_customer_by_email(email)

        if not customer:
            flash(
                "No account found with this email.",
                "danger"
            )    
        
            return redirect(
            url_for("password_reset.forgot_password")
            )
    
        # generate Token 
        signed_token, hashed_token = (generate_password_reset_token())

        # store hashed token 
        reset_record = create_reset_token(
                     customer["user_id"],
                     hashed_token
        )

        reset_link = url_for(
            "password_reset.reset_password",
            token = signed_token,
            _external =True
        )

        print(
            f"Reset Link: {reset_link}"
        )

        if not reset_record:

            flash(
                "Unable to generate reset link.",
                "danger"
            )

            return redirect(
                url_for(
                    "password_reset.forgot_password"
                )
            )


    return render_template(
        "auth/forgot_password.html"
    )    

# Reset password part

def reset_password(token):

    # Verify signed token
    raw_token = verify_signed_token(token)

    if not raw_token:

        flash(
            "Invalid or expired reset link.",
            "danger"
        )

        return redirect(
            url_for("password_reset.forgot_password")
        )

    # Hash token
    hashed_token_value = hash_token(
        raw_token
    )

    # Get token record
    reset_record = get_valid_token(
        hashed_token_value
    )

    if not reset_record:

        flash(
            "Invalid or expired reset link.",
            "danger"
        )

        return redirect(
            url_for("password_reset.forgot_password")
        )

    # Form Submitted
    if request.method == "POST":

        password = request.form.get(
            "password"
        )

        confirm_password = request.form.get(
            "confirm_password"
        )

        # Password Match Validation
        if password != confirm_password:

            flash(
                "Passwords do not match.",
                "danger"
            )

            return redirect(
                url_for(
                    "password_reset.reset_password",
                    token=token
                )
            )

        # Update Password
        update_user_password(
            reset_record["user_id"],
            password
        )

        # Invalidate Token
        invalidate_reset_token(
            reset_record["reset_id"]
        )

        flash(
            "Password reset successful. Please login.",
            "success"
        )

        return redirect(
            url_for("auth.login")
        )

    return render_template(
        "auth/reset_password.html"
    )
   

