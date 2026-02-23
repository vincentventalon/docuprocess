"""Fernet (AES-128-CBC + HMAC-SHA256) encryption for sensitive credentials"""

from cryptography.fernet import Fernet
from app.core.config import settings

_fernet = None


def _get_fernet() -> Fernet:
    """Lazy singleton for the Fernet instance"""
    global _fernet
    if _fernet is None:
        if not settings.STORAGE_ENCRYPTION_KEY:
            raise RuntimeError("STORAGE_ENCRYPTION_KEY is not configured")
        _fernet = Fernet(settings.STORAGE_ENCRYPTION_KEY.encode())
    return _fernet


def encrypt_value(plaintext: str) -> str:
    """Encrypt a plaintext string, return base64-encoded ciphertext"""
    return _get_fernet().encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a base64-encoded ciphertext, return plaintext"""
    return _get_fernet().decrypt(ciphertext.encode()).decode()
