from flask import Flask, Response
from config import Config

from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp
from routes.staff_route import staff_bp
from routes.admin_route import admin_bp
from routes.manager_route import manager_bp
from routes.receptionist_route import receptionist_bp
from routes.user_route import user_bp
from routes.password_reset_route import password_reset_bp

from extensions import mail

app = Flask(__name__)
app.config.from_object(Config)

mail.init_app(app)


@app.after_request
def add_header(response):

    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response

# Register Blueprint

app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(staff_bp)
app.register_blueprint(admin_bp, url_prefix = "/admin")
app.register_blueprint(manager_bp, url_prefix = "/manager")
app.register_blueprint(receptionist_bp, url_prefix = "/receptionist")
app.register_blueprint(user_bp)
app.register_blueprint(password_reset_bp)


if __name__ == '__main__':
     app.run(debug=True)
   