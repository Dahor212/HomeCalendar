import os
import json
import base64
from cryptography.hazmat.primitives.asymmetric.ec import generate_private_key, SECP256R1
from cryptography.hazmat.primitives import serialization

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "changeme-in-production-use-long-random-string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# VAPID — lazy-loaded from DB on first use (see get_vapid_keys)
_vapid_cache: dict | None = None


def generate_vapid_keys() -> dict:
    private_key = generate_private_key(SECP256R1())
    private_pem = private_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ).decode()
    public_bytes = private_key.public_key().public_bytes(
        serialization.Encoding.X962,
        serialization.PublicFormat.UncompressedPoint,
    )
    public_b64 = base64.urlsafe_b64encode(public_bytes).rstrip(b"=").decode()
    return {"private_key": private_pem, "public_key": public_b64}


def get_vapid_keys(db) -> dict:
    """Load VAPID keys from DB, generating them on first call."""
    global _vapid_cache
    if _vapid_cache:
        return _vapid_cache

    from .models import AppConfig  # local import to avoid circular deps
    row = db.query(AppConfig).filter(AppConfig.key == "vapid_keys").first()
    if row:
        _vapid_cache = json.loads(row.value)
        return _vapid_cache

    keys = generate_vapid_keys()
    entry = AppConfig(key="vapid_keys", value=json.dumps(keys))
    db.add(entry)
    db.commit()
    _vapid_cache = keys
    return keys


VAPID_CLAIMS = {"sub": "mailto:admin@homecalendar.local"}
