# This route contain a parts which is only related to admin 

from models.appointment_module import get_appointments
from models.appointment_module import get_appointment_stats
from models.appointment_module import get_staff_list

from models.staff_module import get_all_staff
from models.staff_module import get_card_details
from models.staff_module import update_specialization
from models.staff_module import update_staff_status
from models.staff_module import remove_staff
from models.staff_module import update_details
from models.staff_module import add_staff as create_staff

from models.customer_model import customer_details
from models.customer_model import customer_card

from models.service_model import service_card
from models.service_model import get_all_service
from models.service_model import update_service_status
from models.service_model import update_service_details

from flask import Blueprint, session, redirect , render_template, request
from flask import jsonify
from utils.decorators import login_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route("/appointment")
@login_required

def appointment():

    role_id = session.get('role_id')
    user_id = session.get('user_id')

    appointments = get_appointments(role_id, user_id)

    stats = get_appointment_stats()

    staff_list = get_staff_list()
    print(staff_list)

    return render_template("appointment/admin_appointments.html", 
                           appointments=appointments,
                           stats = stats,
                           staff_list=staff_list,
                           role_id=role_id)

# ======================================Staff=============================

@admin_bp.route("/staff")
@login_required
def staff():

    staff_list = get_all_staff()
    stats = get_card_details()

    return render_template(
                 "staff/admin_staff.html",
                 staff_list = staff_list,
                  stats = stats )

@admin_bp.route("/staff/update-specialization", methods=["POST"])
@login_required

def change_specilization():

    data = request.get_json()

    staff_id = data.get("staff_id")

    specialization = data.get("specialization")

    success = update_specialization(staff_id, specialization )

    if success :
        return jsonify({
            "success": True,
            "message": "Specialization updated"
        })
    
    return jsonify({
        "success": False,
        "message":"Something went wrong"

    }), 500

@admin_bp.route("/staff/update-status", methods=["POST"])
@login_required
def update_status():

    data  = request.get_json()

    staff_id = data.get("staff_id")

    status = data.get("status")

    success = update_staff_status(staff_id, status)

    return jsonify({
        "success": success
    })

@admin_bp.route("/staff/remove", methods=["POST"])
@login_required
def delete_staff():

    data = request.get_json()

    staff_id = data.get("staff_id")

    success = remove_staff(staff_id)

    return jsonify({
        "success": success
    })

@admin_bp.route("/staff/update", methods=["POST"])
@login_required

def update_staff():

    data = request.get_json()

    full_name = data.get("full_name", "").strip()

    name_parts = full_name.split(" ",1)

    first_name = name_parts[0]

    last_name = ( name_parts[1]
                 if len(name_parts)>1
                 else ""
                 )
    
    success = update_details(

        staff_id = data.get("staff_id"),
        first_name = first_name,
        last_name = last_name,
        email = data.get("email"),
        phone = data.get("phone"),
        salary = data.get("salary"),
        gender = data.get("gender"),
        specialization = data.get("specialization"),
        employment_status = data.get("employment_status")
    )

    return jsonify({
        "success": success
    })
    
@admin_bp.route("/staff/add", methods=["POST"])
@login_required

def add_staff_route():

    try :

        data = request.get_json()

        result = create_staff(data)

        if result["success"]:

            return jsonify({
                "success" : True,
                "message" : result["message"]
            }), 201
        
        return jsonify({
            "success": False,
            "message" :  result["message"]
        }), 400
    
    except Exception as e:

        print(
            "ADD STAFF ROUTE ERROR:",
            e
        )

        return jsonify({
            "success": False,
            "message": "Something went wrong"
        }), 500

# Customer part 
@admin_bp.route("/customer")
def customer():

    customers = customer_details()
    card = customer_card()

    return render_template(
        "customer/admin_customer.html",
        customers=customers,
        card= card
    )

# ============================Service Part======================== 
@admin_bp.route("/service")
@login_required
def service():
    
    cards = service_card()
    service_details = get_all_service()

    return render_template(
        "service/admin_service.html",
        cards = cards,
        service_details = service_details
    )

@admin_bp.route(
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

@admin_bp.route(
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

