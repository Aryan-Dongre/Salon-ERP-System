# This route contain a parts which is only related to authentication

from flask import Blueprint, render_template, request, Response
from flask import session, redirect, url_for , flash
from models.auth_model import get_user_by_code
from utils.auth import verify_password

from models.auth_model import register_customer


auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        user_code = request.form.get("user_code")
        password = request.form.get("password")

        user = get_user_by_code(user_code)

        if user:

            db_password = user[3]

            if verify_password(password, db_password):

                session["user_id"] = user[0]
                session["role_id"] = user[1]
                session["user_code"] = user[2]

                flash("Login Successful", "success")

                return redirect("/dashboard")

            flash("Invalid Password", "danger")
            return redirect(url_for("auth.login"))

        flash("User Not Found", "danger")
        return redirect(url_for("auth.login"))

    return render_template("auth/login.html")


@auth_bp.route("/logout")
def logout():
     session.clear()
     response = redirect(url_for("auth.login"))

     response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
     response.headers["Pragma"] = "no-cache"
     response.headers["Expires"] = "0"

     return response
    # return redirect(url_for("auth.login"))


@auth_bp.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    if request.method == "POST":

        full_name = request.form.get("full_name").strip()

        email = request.form.get("email").strip().lower()

        password = request.form.get("password")

        result = register_customer(
            full_name,
            email,
            password
        )

        if result["success"]:

            flash(
                "Account create successfully. Please login"
                "success"
            )

            return redirect(
                url_for("auth.login")
            )

        flash(
            result["message"],
            "danger"
        )

        return redirect(
            url_for("auth.register")
        )

    return render_template(
        "auth/register.html"
    )