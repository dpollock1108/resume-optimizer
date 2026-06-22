import os
from datetime import datetime, timezone
from typing import Any, Optional

from google.cloud import firestore

from auth import AuthenticatedUser


_client: Optional[firestore.Client] = None


def _database() -> firestore.Client:
    global _client
    if _client is None:
        _client = firestore.Client()
    return _client


def _user_document(user: AuthenticatedUser):
    return _database().collection("users").document(user.id)


def _migrate_legacy_user(user: AuthenticatedUser) -> None:
    migration_email = os.getenv("LEGACY_MIGRATION_EMAIL", "").strip().lower()
    legacy_user_id = os.getenv("LEGACY_MIGRATION_USER_ID", "local-user").strip()
    if not migration_email or user.email.lower() != migration_email or user.id == legacy_user_id:
        return

    source = _database().collection("users").document(legacy_user_id)
    if not source.get().exists:
        return

    destination = _user_document(user)
    for collection_name in ("profiles", "applications"):
        documents = list(source.collection(collection_name).stream())
        for offset in range(0, len(documents), 200):
            batch = _database().batch()
            for document in documents[offset : offset + 200]:
                batch.set(
                    destination.collection(collection_name).document(document.id),
                    document.to_dict(),
                )
                batch.delete(document.reference)
            batch.commit()
    source.delete()


def ensure_user(user: AuthenticatedUser) -> None:
    if os.getenv("APP_ENV") == "production":
        _migrate_legacy_user(user)
    _user_document(user).set(
        {
            "email": user.email,
            "last_seen_at": datetime.now(timezone.utc),
        },
        merge=True,
    )


def list_documents(user: AuthenticatedUser, collection: str) -> list[dict[str, Any]]:
    documents = _user_document(user).collection(collection).stream()
    return [{"id": document.id, **document.to_dict()} for document in documents]


def create_document(
    user: AuthenticatedUser,
    collection: str,
    document_id: str,
    data: dict[str, Any],
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    payload = {**data, "created_at": now, "updated_at": now}
    _user_document(user).collection(collection).document(document_id).set(payload)
    return {"id": document_id, **payload}


def update_document(
    user: AuthenticatedUser,
    collection: str,
    document_id: str,
    data: dict[str, Any],
) -> Optional[dict[str, Any]]:
    reference = _user_document(user).collection(collection).document(document_id)
    snapshot = reference.get()
    if not snapshot.exists:
        return None
    payload = {**data, "updated_at": datetime.now(timezone.utc)}
    reference.update(payload)
    return {"id": snapshot.id, **snapshot.to_dict(), **payload}


def delete_document(user: AuthenticatedUser, collection: str, document_id: str) -> bool:
    reference = _user_document(user).collection(collection).document(document_id)
    snapshot = reference.get()
    if not snapshot.exists:
        return False
    reference.delete()
    return True
