import secrets
import hashlib

from itsdangerous import URLSafeTimedSerializer
from flask import current_app


def generate_password_reset_token():

    # Random secure token
    raw_token = secrets.token_urlsafe(32)

    serializer = URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"]
    )

    signed_token = serializer.dumps(
        raw_token,
        salt=current_app.config[
            "SECURITY_PASSWORD_SALT"
        ]
    )

    hashed_token = hashlib.sha256(
        raw_token.encode()
    ).hexdigest()

    return signed_token, hashed_token


def verify_signed_token(
    signed_token,
    max_age=1800
):

    serializer = URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"]
    )

    try:

        raw_token = serializer.loads(
            signed_token,
            salt=current_app.config[
                "SECURITY_PASSWORD_SALT"
            ],
            max_age=max_age
        )

        return raw_token

    except Exception:

        return None


def hash_token(raw_token):

    return hashlib.sha256(
        raw_token.encode()
    ).hexdigest()