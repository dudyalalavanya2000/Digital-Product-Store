
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, engine
from .routes.admin import router as admin_router
from .routes.auth import router as auth_router
from .routes.cart import router as cart_router
from .routes.orders import router as orders_router
from .routes.payments import router as payments_router
from .routes.products import router as products_router
from .routes.reports import router as reports_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Digital Product Store API",
    version="1.0.0",
)


# =========================
# CORS Configuration
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# API Routers
# =========================

app.include_router(products_router)
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(cart_router)
app.include_router(payments_router)
app.include_router(reports_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "message": "Digital Product Store API is running"
    }
