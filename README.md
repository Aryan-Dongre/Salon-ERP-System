# Salon-ERP-System
A production-ready Enterprise Resource Planning (ERP) system developed for salon and beauty business management. The platform centralizes customer operations, appointment scheduling, staff management, service administration, payment processing, and business workflows through a role-based architecture.
The project was built using Flask, PostgreSQL, Bootstrap, JavaScript, and Gmail SMTP while following a modular and scalable application structure.
<hr>
<h2>Project Overview</h2>
Salon ERP System is designed to streamline day-to-day salon operations by providing dedicated dashboards and functionalities for different user roles including Admin, Manager, Receptionist, Staff, and Customers.
The system enables customers to book appointments online, make secure payments, manage profiles, and track appointment history. Administrative users can efficiently manage services, appointments, staff, customers, attendance, inventory, and business operations from a centralized dashboard.
<hr>
<h2>Key Features</h2>
<h3>Authentication & Security</h3>
Secure Login System <br>
Session-Based Authentication <br>
Password Hashing using bcrypt <br>
Forgot Password Functionality <br>
Secure Password Reset Tokens<br>
Role-Based Access Control (RBAC) <br>
Protected Routes & Authorization 

<h3>Customer Portal</h3>
Customer Registration & Login <br>
Browse Available Services <br>
Online Appointment Booking <br>
Razorpay Payment Integration <br>
Pay at Salon Option <br>
My Profile Management <br>
Appointment History <br>
Payment Confirmation Workflow

<h3>Admin Dashboard</h3>
Business Analytics Dashboard <br>
Staff Management <br>
Customer Management <br>
Appointment Management <br>
Service Management <br>
Payment Tracking 

<h3>Manager Dashboard</h3>
Staff Monitoring <br>
Appointment Oversight <br>
Customer Management <br>
Service Management <br>
Business Operations Monitoring

<h3>Receptionist Dashboard</h3>
Customer Handling <br>
Appointment Scheduling <br>
Service Management <br>
Appointment Tracking 

<h3>Staff Dashboard</h3>
Daily Appointment Management <br>
Appointment Status Tracking <br>
Customer Service Workflow 

<h3>Payment System</h3>
Demo payment <br>
Payment Status Tracking <br>
Pay at Salon Workflow

<h3>Email System</h3>
Gmail SMTP Integration <br>
Password Reset Emails <br>
Automated Email Notifications

<h2>Tech Stack</h2>

<h3>Backend</h3>
Flask <br>
Python
<h3>Database</h3>
PostgreSQL
<h3>Frontend</h3>
HTML5 <br>
CSS3 <br>
Bootstrap 5 <br>
JavaScript <br>
Jinja2
<h3>hird-Party Services</h3>
Gmail SMTP Service

<h2>System Architecture</h2>
The application follows a modular Flask architecture: <br>
ERP/ │<br> ├── models/<br> ├── routes/<br> ├── templates/<br> ├── static/<br> ├── utils/<br> ├── python_database/<br> │ <br> ├── app.py <br> ├── config.py <br> ├── extensions.py <br> └── requirements.txt
<br>
The project is organized using Flask Blueprints and follows separation of concerns between routes, business logic, database operations, templates, and utilities.

<h2>User Roles</h2>
 <h3>Admin</h3>
 Full system access <br>
Staff management <br>
Customer management <br>
Appointment management <br>
Service management <br>

<h3>Manager</h3>
Staff supervision <br>
Appointment management <br>
Customer management <br>
Service management 

<h3>Receptionist</h3>
Customer handling <br>
Appointment scheduling <br>
Service management

<h3>Staff</h3> 
Appointment handling <br>
Service delivery workflow

<h3>Customer</h3>
Registration &  <br>
Service browsing <br>
Appointment booking <br>
Payment processing <br>
Appointment tracking
<hr>
<h2>Database Design</h2>
Main database tables include: 
<br>
roles <br>
users <br>
staff <br>
customers <br>
services <br>
bookings <br>
booking_services<br>
appointments <br>
payments <br>
notifications <br>
attendance <br>
inventory <br>
inventory_transactions <br>
password_resets  <br>
The database was designed using relational modeling principles to support role-based operations and real-world salon workflows.

<h2>Installation</h2>
<h3>Clone Repository</h3>
git clone https://github.com/Aryan-Dongre/Salon-ERP-System.git
<h3>Navigate to Project</h3>
cd Salon-ERP-System
<h3>Create Virtual Environment</h3>
python -m venv venv
<h3>Activate Virtual Environment</h3>
Windows powershell:  venv\Scripts\activate
<h3>Install Dependencies</h3>
pip install -r requirements.txt
<h3>Configure Environment Variables</h3>
Create a .env file using the provided .env.example template.
<h4>Setup PostgreSQL Database</h4>
1.Create a PostgreSQL database. <br>
2.Import the SQL schema from: database/Salon_ERP.sql

<h3>Run Application</h3>
python app.py

<h2>Learning Outcomes</h2>
Enterprise Resource Planning (ERP) Architecture <br>
Role-Based Access Control Systems <br>
Authentication & Authorization <br>
Session Management <br>
Secure Password Reset Flows  <br>
PostgreSQL Database Design <br>
Email Service Integration <br>
Business Workflow Automation <br>
Production-Oriented Flask Development <br>
Multi-Role Application Architecture
