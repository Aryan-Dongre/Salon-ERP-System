# This route contain a parts which is only related to receptionist

from models.appointment_module import get_appointments
from models.appointment_module import get_staff_list as get_appointment_staff_list
from models.appointment_module import get_receptionist_appointment_stats
from models.appointment_module import update_appointment_status
from models.appointment_module import get_appointment_details

from models.staff_module import get_staff_list
from models.staff_module import get_staff

from models.customer_model import customer_details
from models.customer_model import customer_card

from models.service_model import service_card
from models.service_model import get_all_service
from models.service_model import update_service_status
from models.service_model import update_service_details


from flask import Blueprint, session , render_template, redirect, request
from flask import jsonify
from utils.decorators import login_required

receptionist_bp = Blueprint('receptionist', __name__)

@receptionist_bp.route("/appointment")
@login_required

def appointment():

    role_id = session.get('role-id')
    user_id = session.get('user_id')

    appointments = get_appointments(role_id, user_id)
    staff_list = get_appointment_staff_list()
    stats = get_receptionist_appointment_stats()

    return render_template("appointment/receptionist_appointment.html",
                    appointments=appointments,
                    staff_list = staff_list,
                    stats = stats,
                    role_id=role_id)


@receptionist_bp.route("/appointment/update-status", methods=["POST"])
@login_required
def update_stauts():
    data = request.get_json()

    appointment_id = data.get("appointment_id")

    status = data.get("appointment_status")

    allowed_status = [
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED"
    ]

    if status not in allowed_status:

        return jsonify({
            "success":False,
            "message":"Invalid status"
        }), 400
    
    success = update_appointment_status(appointment_id, status)

    if success:

        return jsonify({
            "success": True,
            "message" : "Appointment update"
        })
    
    return jsonify({
        "success":False,
        "message": "Update Failed"
    }), 500

@receptionist_bp.route("/appointment/<int:appointment_id>")
@login_required
def appointment_update(appointment_id):

    appointment = get_appointment_details(
        appointment_id
    )

    if not appointment:
        return jsonify({
            "success": False,
            "message": "Appointment not found"
        }), 404

    appointment["appointment_date"] = (
        appointment["appointment_date"].strftime("%d %b %Y")
        if appointment.get("appointment_date")
        else ""
    )

    appointment["start_time"] = (
        appointment["start_time"].strftime("%I:%M %p")
        if appointment.get("start_time")
        else ""
    )

    appointment["end_time"] = (
        appointment["end_time"].strftime("%I:%M %p")
        if appointment.get("end_time")
        else ""
    )

    return jsonify({
        "success": True,
        "appointment": appointment
    })

#==========Staff Part =======#

@receptionist_bp.route("/staff")
@login_required

def receptionist_staff ():

    page = request.args.get(
        "page",
        1,
        type=int
    )

    search_name =  (request.args.get("search_name") or "" )

    search_staff_id = (request.args.get("search_staff_id") or "" )

    if search_staff_id == "None":
     search_staff_id = ""

    stats = get_staff()

    staff_data = get_staff_list(
        page=page,
        per_page=10,
        search_name=search_name,
        search_staff_id=search_staff_id
    )

    return render_template(
        "staff/receptionist_staff.html",

        staff_list = staff_data["staff"],
        stats=stats,

        current_page=staff_data["current_page"],
        total_pages=staff_data["total_pages"],
        total_records=staff_data["total_records"],

        search_name=search_name,
        search_staff_id=search_staff_id
    )

# Customer part
@receptionist_bp.route("/customer")
@login_required
def customer():

    customers = customer_details()
    card = customer_card()

    return render_template(
        "customer/receptionist_customer.html",
        customers=customers,
        card= card
    )

# Service Part 
@receptionist_bp.route("/service")
@login_required
def service():
    
    cards = service_card()
    service_details = get_all_service()

    return render_template(
        "service/receptionist_service.html",
        cards = cards,
        service_details = service_details
    )

@receptionist_bp.route(
    "/service/update-status",
    methods=["POST"]
)
@login_required
def update_service_status_route():

    data = request.get_json()

    service_id = data.get(
        "service_id"
    )

    is_active = data.get(
        "is_active"
    )

    updated = update_service_status(
        service_id,
        is_active
    )

    if updated:
        return jsonify({
            "success": True,
            "message":
            "Service status updated"
        })

    return jsonify({
        "success": False
    }), 500

@receptionist_bp.route(
    "/service/update",
    methods=["POST"]
)
@login_required
def update_service_route():

    data = request.get_json()

    success = update_service_details(
        service_id=data.get(
            "service_id"
        ),

        service_name=data.get(
            "service_name"
        ),

        duration_minutes=data.get(
            "duration_minutes"
        ),

        price=data.get(
            "price"
        ),

        description=data.get(
            "description"
        ),

        is_active=data.get(
            "is_active"
        )
    )

    return jsonify({
        "success": success
    })