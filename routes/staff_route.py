# This route contain a parts which is only related to staff

from models.appointment_module import get_appointments
from models.appointment_module import get_appointment_details
from models.appointment_module import mark_appointment_complete
from flask import Blueprint, session, redirect , render_template
from flask import jsonify

from utils.decorators import login_required

staff_bp = Blueprint('staff', __name__)

@staff_bp.route("/appointments")
@login_required
def appointments():

    role_id = session.get('role_id')
    user_id = session.get('user_id')

    appointments = get_appointments(role_id, user_id)

    return render_template("appointment/appointments.html", 
                           appointments=appointments,
                           role_id = role_id)
    

@staff_bp.route("/appointment/<int:appointment_id>")
@login_required

def appointment_details(appointment_id):

    appointment = get_appointment_details(appointment_id)

    if not appointment:
        redirect("/appointments")

    return render_template(
        "appointment/appointment_details.html",
        appointment=appointment
    )    

@staff_bp.route("/appointment/<int:appointment_id>/details")
@login_required

def appointment_details_api(appointment_id):

    appointment = get_appointment_details(appointment_id)

    if not appointment:
        return jsonify({
            "success": False,
            "message": "Appointment not found"
        }), 404
    
    # converting time and date to string
    appointment["appointment_date"] = str(
        appointment["appointment_date"]
    )

    appointment["start_time"] = str(
        appointment["start_time"]
    )

    appointment["end_time"] = str(
        appointment["end_time"]
    )

    return jsonify({
        "success": True,
        "appointment":appointment
    })


@staff_bp.route("/appointments<int:appointment_id>/complete",
                methods=["POST"])
@login_required

def complete_appointment(appointment_id):

    print("Appointment ID:", appointment_id)

    success = mark_appointment_complete(appointment_id)

    print("Update Success:", success)

    if not success:
        return jsonify({
            "success": False,
            "message": "Failed to update"
        }), 550
    
    return jsonify({
        "success": True,
        "message": "appointment complete"
    })