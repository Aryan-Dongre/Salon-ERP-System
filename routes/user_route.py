# This route contain a parts which is only related to user

from flask import Blueprint, render_template 
from flask import redirect , url_for , session
from flask import request
from datetime import date
from flask import flash

from utils.decorators import login_required

from models.user_module import get_featured_services
from models.user_module import get_all_services
from models.user_module import get_appointment_services
from models.user_module import get_service_by_id
from models.user_module import create_booking_appointment

from models.payment_model import get_payment_details
from models.payment_model import update_payment_method
from models.payment_model import mark_payment_success
from models.payment_model import confirm_pay_at_salon

from models.user_module import get_customer_profile
from models.user_module import get_my_appointments


user_bp = Blueprint(
    "user",
    __name__
)

@user_bp.route("/")
def home():

    featured_services = get_featured_services()

    return render_template(
        "user/home.html",
        featured_services=featured_services
    )

# Service Part

@user_bp.route("/services")
def services():

    services = get_all_services()

    return render_template(
        "user/service.html",
        services =services
    )


# Appointment Part 

@user_bp.route("/appointment",methods=["GET", "POST"])
@login_required
def appointment():

    # book appointment
    if request.method == "POST":

        result = create_booking_appointment(
            request.form
        )
        print("BOOKING RESULT =", result)

        if result["success"]:

            # Clear temporary session data
            session.pop(
                "appointment_draft",
                None
            )

            session.pop(
                "selected_services",
                None
            )

            flash(
                "Appointment booked successfully!",
                "success"
            )

            return redirect(
                url_for("user.payment_page",
                        booking_id = result["booking_id"])
            )

        flash(
            result["message"],
            "danger"
        )

        return redirect(
            url_for("user.appointment")
        )


    selected_service_id = request.args.get(
        "service_id",
        type=int
    )

    services = get_appointment_services()

    # Restore saved form draft
    draft = session.get(
        "appointment_draft",
        {}
    )

    # Restore selected services
    stored_services = session.get(
        "selected_services",
        []
    )

    # Add newly selected service
    if selected_service_id:

        existing_ids = [
            service["service_id"]
            for service in stored_services
        ]

        if selected_service_id not in existing_ids:

            selected_service = get_service_by_id(
                selected_service_id
            )

            if selected_service:

                stored_services.append(
                    selected_service
                )

                session[
                    "selected_services"
                ] = stored_services

    service_list = stored_services

    # Total amount
    print(service_list)
    total_amount = sum(
    float(service["price"] or 0)
    for service in service_list
            )

    return render_template(
        "user/appointment.html",

        draft=draft,

        today=date.today().isoformat(),

        service_list=service_list,

        total_amount=total_amount,

        services=services,

        selected_service_id=selected_service_id
    )


@user_bp.route("/save-appointment-draft", methods=["POST"])
@login_required
def save_appointment():

    session["appointment_draft"] = {

        "full_name": request.form.get("full_name"),
        "email": request.form.get("email"),
        "phone": request.form.get("phone"),
        "date": request.form.get("date"),
        "time": request.form.get("time")
    }

    return{"success": True}

# Payment part

@user_bp.route("/payment/<int:booking_id>")
@login_required
def payment_page(booking_id):
    


    payment_data = get_payment_details(booking_id)

    print(payment_data)

    if not payment_data:
        flash("Booking not found.",
              "danger"
              )
        return redirect(
            url_for("user.services")
        )
    
    return render_template(
        "user/payment.html",
        payment = payment_data
    )



@user_bp.route("/payment/process/<int:booking_id>", methods=["POST"])
@login_required
def process_payment(booking_id):

    payment_method = request.form.get("payment_method")

    if not payment_method:

        flash(
            "Please select a payment method.",
            "warning"
        )

        return redirect(
            url_for("user.payment_page",
                    booking_id= booking_id)
        )
    
    update_payment_method(booking_id, payment_method)

    # selected online
    if payment_method =="ONLINE":

        return redirect(
            url_for(
                "user.payment_loading",
                booking_id = booking_id
            )
        )

    # pay at salon

    return redirect(
        url_for(
            "user.appointment_confirmed",
            booking_id=booking_id
        )
    ) 

@user_bp.route("/payment/loading/<int:booking_id>")
@login_required
def payment_loading(booking_id):

    payment_data = get_payment_details(booking_id)

    if not payment_data:

        flash(
            "Booking not found.",
            "danger"
        )

        return redirect(
            url_for("user.home")
        )
    
    return render_template(
        "user/payment_loading.html",
        payment=payment_data
    )

@user_bp.route("/payment/success/<int:booking_id>")
@login_required
def payment_success(booking_id):

    mark_payment_success(booking_id)

    payment_data = get_payment_details(booking_id)

    if not payment_data:

        flash(
            "Booking not found.",
            "danger"
        )

        return redirect(
            url_for("user.home")
        )
    
    return render_template(
        "user/payment_success.html",
        payment = payment_data
    )

# pay at salon

@user_bp.route("/payment/appointment/<int:booking_id>")
@login_required
def appointment_confirmed(booking_id):

    confirm_pay_at_salon(booking_id)

    payment_data = get_payment_details(booking_id)

    if not payment_data:
        flash(
            "Booking not found.",
            "danger"
        )

        return redirect(
            url_for("user.home")
        )
    
    return render_template(
        "user/appointment_confirmed.html",
        payment=payment_data
    )

# Contact Part 
@user_bp.route("/contact")
def contact():
    return render_template(
        "user/contact.html"
    )

# profile part

@user_bp.route("/profile")
def profile():

    if session.get("role_id")!= 5:
        return redirect(url_for("auth.login"))
    
    customer = get_customer_profile(session["user_id"])

    return render_template(
        "user/profile.html",
        customer=customer
    )

# My appointment part

@user_bp.route("/my-appointment")

def my_appointment():

    if session.get("role_id")!= 5:
        return redirect(
            url_for("auth.login")
        )
    
    appointments = get_my_appointments(session["user_id"])

    return render_template(
        "user/my_appointment.html",
        appointments=appointments
    )

