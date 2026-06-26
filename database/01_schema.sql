/*
 Salon ERP System
 Database Schema
-----------------------------------------------------------
 Description:
 This file creates the complete database structure for
 the Salon ERP System.

 Contents:
 - Tables
 - Primary Keys
 - Foreign Keys
 - Constraints
 - Default Values

 Note:
 This file DOES NOT contain any data insertion.
*/

CREATE TABLE roles(
   role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   role_name VARCHAR(50) UNIQUE NOT NULL,
   description TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE users (
       user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	   role_id INT NOT NULL,
	   user_code VARCHAR(50) UNIQUE NOT NULL,
	   password_hash TEXT NOT NULL,
	   is_active Boolean DEFAULT TRUE,
	   last_login TIMESTAMP,
	   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	   CONSTRAINT fk_role
	               FOREIGN KEY(role_id)
				   REFERENCES roles(role_id)
				   ON DELETE RESTRICT
);

CREATE TABLE staff (
          staff_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		  user_id INT UNIQUE NOT NULL,
		  first_name VARCHAR(100) NOT NULL,
		  last_name VARCHAR(100),
		  email VARCHAR(255) UNIQUE NOT NULL,
		  phone VARCHAR(15) UNIQUE NOT NULL,
	      gender VARCHAR(20),
	      joining_date DATE NOT NULL,
	      salary NUMERIC(10,2),
	      specialization TEXT,

		  employment_status VARCHAR(20)
		        DEFAULT 'ACTIVE'
				CHECK (employment_status IN
				('ACTIVE', 'INACTIVE', 'ON_LEAVE')),

		  is_available BOOLEAN DEFAULT TRUE,

		  shift_start TIME,
          shift_end TIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

		  CONSTRAINT fk_staff_user
		  FOREIGN KEY (user_id)
		  REFERENCES users(user_id)
		  ON DELETE RESTRICT
);

CREATE TABLE customers (
    customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    profile_image TEXT,

    login_provider VARCHAR(20)
        DEFAULT 'GOOGLE'
        CHECK (login_provider IN
        ('GOOGLE', 'EMAIL')),

    customer_status VARCHAR(20)
        DEFAULT 'REGISTERED'
        CHECK (customer_status IN
        ('REGISTERED', 'CLIENT')),

    last_visit_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE customers
ADD COLUMN user_id INT UNIQUE;

ALTER TABLE customers
ADD CONSTRAINT fk_customer_user
FOREIGN KEY(user_id)
REFERENCES users(user_id)
ON DELETE RESTRICT;

ALTER TABLE customers
ALTER COLUMN phone DROP NOT NULL;

CREATE TABLE service_categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(100)
        UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    service_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INT NOT NULL,
    service_name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL
        CHECK (duration_minutes > 0),
    price NUMERIC(10,2)
        NOT NULL
        CHECK (price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_category
        FOREIGN KEY (category_id)
        REFERENCES service_categories(category_id)
        ON DELETE RESTRICT
);

CREATE TABLE staff_services (
    staff_service_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    staff_id INT NOT NULL,

    service_id INT NOT NULL,

    experience_level VARCHAR(20)
        DEFAULT 'BEGINNER'
        CHECK (experience_level IN
        ('BEGINNER',
         'INTERMEDIATE',
         'ADVANCED',
         'EXPERT')),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_service
        FOREIGN KEY (service_id)
        REFERENCES services(service_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_staff_service
        UNIQUE (staff_id, service_id)
);


CREATE TABLE bookings (
    booking_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    customer_id INT NOT NULL,

    booking_date DATE NOT NULL,

    booking_time TIME NOT NULL,

    booking_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK (booking_status IN
        ('PENDING',
         'CONFIRMED',
         'CANCELLED',
         'FAILED')),

    notes TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
);

CREATE TABLE booking_services (
    booking_service_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    booking_id INT NOT NULL,

    service_id INT NOT NULL,

    quantity INT DEFAULT 1
        CHECK (quantity > 0),

    price_snapshot NUMERIC(10,2)
        NOT NULL
        CHECK (price_snapshot >= 0),

    CONSTRAINT fk_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_service
        FOREIGN KEY (service_id)
        REFERENCES services(service_id)
        ON DELETE RESTRICT
);

CREATE TABLE appointments (
    appointment_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL,
    staff_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_status VARCHAR(20)
        DEFAULT 'SCHEDULED'
        CHECK (appointment_status IN
        ('SCHEDULED',
         'IN_PROGRESS',
         'COMPLETED',
         'CANCELLED')),
    assigned_by VARCHAR(20)
        DEFAULT 'SYSTEM'
        CHECK (assigned_by IN
        ('SYSTEM',
         'MANUAL_OVERRIDE')),
    priority_score NUMERIC(5,2),
    completed_at TIMESTAMP,
    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointment_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE RESTRICT
);

ALTER TABLE appointments
ADD COLUMN booking_service_id INT;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointment_booking_service
FOREIGN KEY (booking_service_id)
REFERENCES booking_services(booking_service_id)
ON DELETE RESTRICT;

CREATE TABLE payments (
    payment_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,
    appointment_id INT UNIQUE NOT NULL,
    amount NUMERIC(10,2)
        NOT NULL
        CHECK (amount >= 0),
    payment_method VARCHAR(20)
        CHECK (payment_method IN
        ('CASH',
         'UPI',
         'CARD',
         'ONLINE')),
    payment_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK (payment_status IN
        ('PENDING',
         'SUCCESS',
         'FAILED',
         'REFUNDED')),
    transaction_reference VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
        ON DELETE RESTRICT
);

CREATE TABLE attendance (
    attendance_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    staff_id INT NOT NULL,

    check_in TIMESTAMP,

    check_out TIMESTAMP,

    attendance_status VARCHAR(20)
        CHECK (attendance_status IN
        ('PRESENT',
         'ABSENT',
         'HALF_DAY',
         'LEAVE')),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE CASCADE
);

CREATE TABLE inventory (
    inventory_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    product_name VARCHAR(150)
        UNIQUE NOT NULL,

    quantity INT DEFAULT 0
        CHECK (quantity >= 0),

    unit VARCHAR(20),

    minimum_stock INT DEFAULT 0,

    cost_price NUMERIC(10,2),

    supplier_name VARCHAR(150),

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transactions (
    inventory_transaction_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    inventory_id INT NOT NULL,

    staff_id INT,

    quantity_changed INT NOT NULL,

    transaction_type VARCHAR(20)
        CHECK (transaction_type IN
        ('IN',
         'OUT',
         'ADJUSTMENT')),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory
        FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE SET NULL
);

CREATE TABLE notifications (
    notification_id INT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    customer_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(20)
        CHECK (notification_type IN
        ('EMAIL',
         'SMS',
         'SYSTEM')),

    is_sent BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

CREATE TABLE password_resets(
        reset_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		user_id INTEGER NOT NULL,
		reset_token VARCHAR(255) NOT NULL UNIQUE,
		expires_at TIMESTAMP NOT NULL,
		is_used BOOLEAN DEFAULT FALSE,
		created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

		CONSTRAINT fk_password_reset_user
		FOREIGN KEY(user_id)
		REFERENCES users(user_id)
		ON DELETE CASCADE
        );

