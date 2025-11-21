# CanteenX

A modern, efficient canteen management system designed to streamline the ordering process, reduce wait times, and enhance the dining experience for university students and staff along with Material management for Vendors.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Motivation](#motivation)
3.  [Key Features](#key-features)
4.  [Tech Stack](#tech-stack)
5.  [Getting Started (For Developers)](#getting-started-for-developers)
    *   [Prerequisites](#prerequisites)
    *   [Environment Setup](#environment-setup)
    *   [Running the Application](#running-the-application)
6.  [Features Explained](#features-explained)
    *   [User Roles](#user-roles)
    *   [Core Workflow: The Order Lifecycle](#core-workflow-the-order-lifecycle)
7.  [Contributors](#contributors)
8.  [License](#license)

---

## Project Overview

CanteenX is a full-stack application featuring a powerful **FastAPI and GraphQL backend** that serves as the backbone for a modern university canteen system. It provides a seamless digital interface for students to browse menus, place orders, and make payments, while offering a robust management toolkit for canteen vendors and university administrators.

The system is designed to be scalable, secure, and maintainable, built on a normalized database schema and a clean, layered architecture (Controllers, Services, Repositories).

## Motivation

The primary goal of the CanteenX project is to **eliminate long queues and reduce waiting times** at university canteens. In a busy campus environment, students time is valuable. This system empowers them to:

-   **Order from anywhere:** Place an order from the library, a classroom, or their dorm.
-   **Schedule pickups:** Decide when they want their food to be ready.
-   **Pay digitally:** Avoid the hassle of cash transactions.
-   **Simply pick up and go:** Arrive at the canteen only when their order is ready, grab their food, and enjoy their meal without the wait.

This leads to a more efficient canteen operation and a significantly improved experience for everyone on campus.

## Key Features

-   **Dual Authentication System:** Secure login via standard email/password or seamless integration with a university's **CAS (Central Authentication Service)**.
-   **Role-Based Access Control (RBAC):** Distinct permissions and capabilities for Students, Canteen Vendors, and Admins.
-   **Dynamic Canteen & Menu Management:** Canteen vendors can manage their profiles, hours, and menu items, including complex customizations (sizes, additions, removals).
-   **Persistent Shopping Cart:** A fully normalized and secure cart system for each user.
-   **Real-Time Order Tracking:** A comprehensive ordering system with status updates (Pending, Preparing, Ready for Pickup, Completed, Cancelled).
-   **Integrated Payment System:**
    -   **UPI/Card Payments** via Razorpay integration.
    -   **Internal Wallet System** with credit/debit functionality.
-   **User Feedback System:** A complaint management module for users to report issues with their orders.
-   **Personalization:** Users can mark their favorite canteens for quick access.
-   **Containerized & Scalable:** The entire application is containerized with Docker for easy deployment and scalability.

## Tech Stack

The backend is built with a modern, robust stack:

-   **Backend Framework:** **FastAPI**
-   **Frontend Framework:** **React**
-   **API Layer:** **GraphQL** (with **Strawberry**)
-   **Database:** **PostgreSQL**
-   **ORM:** **SQLAlchemy** (with a fully normalized schema)
-   **Data Validation:** **Pydantic** (for DTOs and API schemas)
-   **Containerization:** **Docker** & **Docker Compose**
-   **Authentication:**
    -   **JWT** (JSON Web Tokens) for standard auth
    -   **CAS Client** for university SSO
    -   **Passlib (bcrypt)** for secure password hashing
-   **Payment Gateway:** **Razorpay**

## Getting Started (For Developers)

### Prerequisites

You must have the following installed on your local machine:
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Setup

The application is configured using environment variables.

1.  In the root `CanteenX/` folder, create a file named `.env`.
2.  Copy the contents of the example below into your new `.env` file and replace the placeholder values with your actual configuration details.

#### `.env.example`

```dotenv
# Application Configuration
ENV=development

# Database Configuration (for Docker Compose)
DATABASE_URL=postgresql://user:password@db:5432/canteen_db
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=canteen_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CAS (Central Authentication Service) Configuration
# Example for IIIT Hyderabad
CAS_SERVER_URL=https://login-new.iiit.ac.in/cas/
BASE_URL=http://localhost
SUBPATH=
SERVICE_URL=http://localhost:8000/api/cas/callback
REDIRECT_URL=http://localhost:8080/auth/cas/callback # Your frontend callback URL

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

### Running the Application

Once your `.env` file is configured, running the entire stack is as simple as a single command from the root `CanteenX/` directory:

```bash
docker compose up --build
```
This command will:
1.  Build the Docker images for the FastAPI backend, frontend and the PostgreSQL database along with nginx setup.
2.  Start the containers.
3.  Run the database seeding script to populate your database with mock data.

The backend server will be running and available at `http://localhost:8000`.

#### Accessing the GraphQL API

The GraphQL playground, where you can explore the schema and run queries/mutations, is available at:

**[http://localhost:8000/api/graphql](http://localhost:8000/api/graphql)**

## Features Explained

### User Roles

-   **Student:** The primary user. Can browse canteens, manage their cart, place and track orders, make payments, and file complaints.
-   **Canteen Vendor:** Manages a specific canteen. Can update canteen details, add/update menu items, and update the status of incoming orders.
-   **Admin:** Has superuser privileges. Can manage all canteens, users, and has access to all system data.

### Core Workflow: The Order Lifecycle

1.  **Browse & Discover:** A student browses through the list of available canteens and their menus.
2.  **Add to Cart:** The student adds items to their cart, selecting customizations like size or additions.
3.  **Place Order:** The student proceeds to checkout, creating an order from their cart items. The server calculates the final price to ensure data integrity.
4.  **Make Payment:** The student chooses a payment method (e.g., UPI via Razorpay or their internal Wallet).
5.  **Track Status:** The student can track the order's status in real-time as the canteen vendor updates it from "Pending" -> "Preparing" -> "Ready for Pickup".
6.  **Pickup:** The student receives a notification that their order is ready and picks it up from the canteen, skipping the entire queue.

## Contributors

-   [Dileep Kumar Adari](https://github.com/Dileepadari)
-   [Revanth Reddy](https://github.com/)
-   [Keshava Kishora Nanda](https://github.com/)
-   [Naga Sai Ritvik](https://gtihub.com/)
-   [Shailender Goyal](https://github.com/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.