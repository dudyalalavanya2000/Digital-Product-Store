# Digital Product Store

A full-stack digital product e-commerce application built using **FastAPI, React, SQLAlchemy, SQLite, JWT Authentication, and Stripe**.

The application allows users to register, log in, browse digital products, manage their cart, place orders, and complete payments through Stripe. Admin users can manage products, orders, users, and view business reports.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Secure password hashing
* Role-based access control
* Admin and user roles
* Protected API endpoints
* User profile management
* Duplicate email validation
* Invalid login handling

### 📦 Product Management

* Create products
* Update products
* Delete/soft-delete products
* View product details
* Product listing
* Product search
* Pagination
* Product availability validation

### 🛒 Cart & Orders

* Add products to cart
* Remove products from cart
* View cart
* Cart validation
* Create orders
* Order history
* Order status management
* Empty-cart validation

### 💳 Stripe Payment Integration

* Stripe Checkout integration
* Secure payment processing
* Stripe webhook integration
* Payment status synchronization
* Order status synchronization
* Handling of expired checkout sessions
* Payment success and cancellation flows

### 👨‍💼 Admin Functionality

Admins can:

* Manage products
* Manage orders
* View users
* View sales information
* View revenue
* Monitor product performance
* Access administrative reports

### 📊 Reports

The application provides reports for:

* Total revenue
* Revenue analysis
* Most-purchased products
* User orders
* Users who have never purchased
* Order statistics

---

## 🛠️ Technology Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Pydantic
* JWT Authentication
* Stripe API

### Frontend

* React
* JavaScript
* HTML/CSS

### Payment

* Stripe Checkout
* Stripe Webhooks

---

## 📁 Project Structure

```text
digital-product-store/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 🔑 Authentication Flow

1. User registers an account.
2. User logs in using email and password.
3. Backend validates credentials.
4. JWT access token is generated.
5. Frontend stores the authentication token.
6. Protected APIs use the JWT token.
7. Role-based authorization controls admin functionality.

---

## 💳 Payment Flow

1. User adds products to the cart.
2. User creates an order.
3. Backend validates the cart and order.
4. Stripe Checkout Session is created.
5. User completes payment through Stripe.
6. Stripe sends a webhook event to the backend.
7. Payment status is updated.
8. Order status is synchronized.
9. Successful and cancelled payment flows are handled appropriately.

---

## 🗄️ Database

The application uses **SQLite** with SQLAlchemy ORM.

The database manages:

* Users
* Products
* Cart items
* Orders
* Order items
* Payments

Relationships and validations are implemented to maintain data integrity.

---

## ⚙️ Environment Variables

Create a `.env` file using `.env.example`.

```env
DATABASE_URL=sqlite:///./digital_product_store.db

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Stripe credentials should be configured using environment variables and should not be committed to GitHub.

---

## ▶️ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## ▶️ Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

The frontend will run using the Vite development server.

---

## 🧪 API Testing

The project includes API tests covering important application workflows.

### Tests Passed

* User registration
* Duplicate email validation
* Invalid login
* User profile
* Product listing
* Product creation
* Authorization
* Order creation
* Empty-cart checkout validation

**Total: 9 API tests passed successfully.**

---

## 🔒 Security

The application implements:

* JWT authentication
* Password hashing
* Role-based authorization
* Protected endpoints
* Environment-based secret management
* Stripe webhook verification
* Input validation
* Database integrity validation

Sensitive credentials such as JWT secrets and Stripe keys are stored in environment variables.

---

## 📌 Project Status

### Completed

* Authentication & Authorization
* Product Management
* Cart Management
* Order Management
* Stripe Checkout
* Stripe Webhooks
* Payment Synchronization
* Admin Functionality
* Reports
* API Testing
* Frontend Integration

The **Digital Product Store full-stack development task is completed successfully.**
