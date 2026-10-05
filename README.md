# 🛍️ Digital Product Store

A full-stack digital product e-commerce application built using **FastAPI, React, SQLAlchemy, SQLite, JWT Authentication, and Stripe Checkout**.

The application allows users to register, log in, browse digital products, manage their cart, place orders, and complete payments using Stripe.

Administrators can manage products, view customer orders, and monitor store sales statistics.

---

## 🚀 Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using `pwdlib`
- Current user profile
- Active/inactive user validation
- Role-based authorization
- Admin and customer roles
- Duplicate email validation
- Invalid login validation

### 📦 Product Management

- Create products
- View products
- View individual product details
- Update products
- Soft-delete products
- Product search
- Product pagination
- Active product filtering
- Admin-only product management

### 🛒 Shopping Cart

- Add product to cart
- View cart
- Update quantity
- Remove cart item
- Clear cart
- Calculate cart total
- Validate product availability
- Validate cart quantity

### 🧾 Orders

- Create order from a product
- Create order from cart
- View customer's orders
- View individual order details
- Order pagination
- Order status tracking
- Pending and paid order handling
- Empty cart validation
- User ownership validation

### 💳 Stripe Payments

- Stripe Checkout integration
- Stripe test payments
- Checkout session creation
- Payment status tracking
- Stripe webhook integration
- Successful payment handling
- Expired checkout handling
- Order status synchronization
- Payment status synchronization

### 👨‍💼 Admin Dashboard

- Total Products
- Total Orders
- Paid Orders
- Total Revenue
- Product management
- Order management
- Sales overview

### 📊 Reports

The backend provides reporting endpoints for:

- Revenue reports
- Most purchased products
- User order reports
- Users who have never purchased

### 🧪 Testing

The project includes automated Pytest tests covering:

- User registration
- Duplicate email validation
- Invalid login
- Current user profile
- Product listing
- Admin product creation
- Authorization
- Order creation
- Empty cart checkout

Current result:

```text
9 passed