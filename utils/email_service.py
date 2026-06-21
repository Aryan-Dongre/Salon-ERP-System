from flask_mail import Message
from flask import render_template, current_app
from extensions import mail

class EmailService:
    @staticmethod
    def send_email(subject, recipients, template_name, **context):

        try:
            msg =Message(
                subject=subject,
                recipients=recipients
            )

            msg.html = render_template(
                f"emails/{template_name}",
                **context
            )

            mail.send(msg)

            return True
        
        except Exception as e:
            current_app.logger.error(
                f"Email sending failed: {str(e)}"
            )

            return False
        
        