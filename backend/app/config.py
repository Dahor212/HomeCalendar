import os
import json
import base64
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ec import generate_private_key, SECP256R1
from cryptography.hazmat.primitives import serialization

VAPID_FILE = Path(os.getenv("VAPID_FILE", "./vapid_keys.json"))


def generate_vapid_keys() -> dict:
    private_key = generate_private_key(SECP256R1())

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()

    public_bytes = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint,
    )
    public_b64 = base64.urlsafe_b64encode(public_bytes).rstrip(b"=").decode()

    return {"private_key": private_pem, "public_key": public_b64}


def load_vapid_keys() -> dict:
    if VAPID_FILE.exists():
        return json.loads(VAPID_FILE.read_text())
    keys = generate_vapid_keys()
    VAPID_FILE.write_text(json.dumps(keys, indent=2))
    return keys


VAPID_KEYS = load_vapid_keys()
VAPID_PRIVATE_KEY = VAPID_KEYS["private_key"]
VAPID_PUBLIC_KEY = VAPID_KEYS["public_key"]
VAPID_CLAIMS = {"sub": "mailto:admin@homecalendar.local"}
