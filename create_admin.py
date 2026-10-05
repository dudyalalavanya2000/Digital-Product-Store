from pwdlib import PasswordHash

from backend.app.database import SessionLocal
from backend.app.models import User


password_hash = PasswordHash.recommended()


db = SessionLocal()

try:
    email = "admin@example.com"

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        existing_user.role = "admin"
        existing_user.is_active = True

        db.commit()
        db.refresh(existing_user)

        print("Existing user updated to admin")
        print(f"Admin ID: {existing_user.id}")
        print(f"Admin Email: {existing_user.email}")
        print(f"Admin Role: {existing_user.role}")

    else:
        admin = User(
            name="Admin User",
            email=email,
            password_hash=password_hash.hash("Admin123"),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin user created successfully")
        print(f"Admin ID: {admin.id}")
        print(f"Admin Email: {admin.email}")
        print(f"Admin Role: {admin.role}")

finally:
    db.close()