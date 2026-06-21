CREATE TABLE roles(
   role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   role_name VARCHAR(50) UNIQUE NOT NULL,
   description TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

INSERT INTO roles(role_name, description)
VALUES 
('ADMIN', 'Full system access'),
('MANAGER', 'Salon management access'),
('RECEPTIONIST', 'Booking and customer management'),
('STAFF', 'Service provider');

INSERT INTO roles(role_name, description)
VALUES
('CUSTOMER', 'Website customer access');

select * from roles;

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
/* Adding user_id into customer table */
ALTER TABLE customers
ADD COLUMN user_id INT UNIQUE;

ALTER TABLE customers
ADD CONSTRAINT fk_customer_user
FOREIGN KEY(user_id)
REFERENCES users(user_id)
ON DELETE RESTRICT;

ALTER TABLE customers
ALTER COLUMN phone DROP NOT NULL;

select * from customers;


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

select * from service_categories;

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


ALTER TABLE appointments
DROP CONSTRAINT appointments_booking_id_key;

SELECT conname
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass;


INSERT INTO appointments (
    booking_id,
    booking_service_id,
    staff_id,
    appointment_date,
    start_time,
    end_time,
    priority_score
)
VALUES
(
    1,
    1,
    1,
    '2026-06-01',
    '11:00',
    '11:30',
    92.5
),
(
    1,
    2,
    3,
    '2026-06-01',
    '11:30',
    '12:30',
    92.5
);

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


CREATE TABLE password_rests(
        reset_id PRIMARY KEY,
		user_id INTEGRE NOT NULL,
		reset_token VARCHAR(255) NOT NULL UNIQUE,
		expires_at TIMESTAMP NOT NULL,
		is_used BOOLEAN DEFAULT FALSE,
		created_At TIMESTAMP DEFAULT CURRENT_TIMESTAP,

		CONSTRAINT fk_password_reset_user
		FOREIGN KEY(user_id)
		REFERENCES users(user_id)
		ON DELETE CASCADE
        )

/*Data insertion part*/

INSERT INTO users
(role_id, user_code, password_hash)
VALUES
(1, 'admin@1001', 'hashed_password_1'),
(2, 'manager@1001', 'hashed_password_2'),
(3, 'receptionist@1001', 'hashed_password_3'),
(4, 'staff@1001', 'hashed_password_4');

INSERT INTO users (
    role_id,
    user_code,
    password_hash
)
VALUES
(
    4,
    'staff@1002',
    'hashed_password_5'
);

INSERT INTO staff (
    user_id,
    first_name,
    last_name,
    email,
    phone,
    gender,
    joining_date,
    salary,
    specialization,
    shift_start,
    shift_end
)
VALUES
(
    6,
    'Priya',
    'Patel',
    'priya@example.com',
    '9876543211',
    'Female',
    '2025-02-15',
    42000.00,
    'Skin Specialist',
    '10:00',
    '19:00'
);

SELECT * FROM users;

INSERT INTO staff (
    user_id,
    first_name,
    last_name,
    email,
    phone,
    gender,
    joining_date,
    salary,
    specialization,
    shift_start,
    shift_end
)
VALUES
(
    4,
    'Rahul',
    'Sharma',
    'rahul@example.com',
    '9876543210',
    'Male',
    '2025-01-10',
    35000.00,
    'Hair Specialist',
    '09:00',
    '18:00'
);
select * from staff;

INSERT INTO customers (
    full_name,
    email,
    phone
)
VALUES
(
    'Aryan Dongre',
    'aryan@gmail.com',
    '9999999999'
);

select * from customers;

INSERT INTO service_categories
(category_name)
VALUES
('Hair'),
('Skin'),
('Groom'),
('Bridal');

INSERT INTO service_categories (
    category_name
)
VALUES
('Nails'),
('Massage');

select * from service_categories;

INSERT INTO services (
    category_id,
    service_name,
    duration_minutes,
    price
)
VALUES
(1, 'Hair Cut', 30, 500),
(1, 'Hair Spa', 60, 1500),
(2, 'Facial', 90, 2500);

/* Services */
INSERT INTO services
(category_id, service_name, duration_minutes, price)
VALUES
(1,'Hair Coloring',120,3000),
(1,'Hair Smoothening',180,6000),
(1,'Hair Keratin',240,8000);

INSERT INTO services
(category_id, service_name, duration_minutes, price)
VALUES
(2,'Cleanup',45,1200),
(2,'Detan',60,1800),
(2,'Hydra Facial',90,3500);

INSERT INTO services
(category_id, service_name, duration_minutes, price)
VALUES
(3,'Beard Styling',30,400),
(3,'Premium Groom Package',90,2500);

INSERT INTO services
(category_id, service_name, duration_minutes, price)
VALUES
(4,'Bridal Makeup',240,15000),
(4,'Engagement Makeup',180,8000);

INSERT INTO services (
    category_id,
    service_name,
    duration_minutes,
    price
)
VALUES
(6,'Head Massage',30,700),
(6,'Body Massage',90,3000),
(6,'Aroma Therapy',60,2500);

/* Insert into staff service*/

INSERT INTO staff_services
(staff_id, service_id, experience_level)
VALUES

(1,1,'EXPERT'),
(1,2,'EXPERT'),
(1,4,'ADVANCED'),
(1,5,'ADVANCED'),
(1,6,'ADVANCED'),

(1,10,'EXPERT'),
(1,11,'ADVANCED');

INSERT INTO staff_services
(staff_id, service_id, experience_level)
VALUES

(3,3,'EXPERT'),
(3,7,'ADVANCED'),
(3,8,'ADVANCED'),
(3,9,'EXPERT'),

(3,12,'EXPERT'),
(3,13,'ADVANCED');

INSERT INTO staff_services
(staff_id, service_id, experience_level)
VALUES

(4,14,'EXPERT'),
(4,15,'ADVANCED'),
(4,16,'ADVANCED'),

(4,17,'ADVANCED'),
(4,18,'EXPERT'),
(4,19,'ADVANCED');

SELECT
    st.first_name,
    sv.service_name,
    ss.experience_level
FROM staff_services ss
JOIN staff st
    ON ss.staff_id = st.staff_id
JOIN services sv
    ON ss.service_id = sv.service_id
ORDER BY st.first_name;

SELECT * FROM staff_services;
select * from services;
SELECT * FROM service_categories;

/* Insert into booking */
INSERT INTO bookings (
    customer_id,
    booking_date,
    booking_time,
    notes
)
VALUES
(
    1,
    '2026-06-01',
    '11:00',
    'Haircut appointment'
);
SELECT * FROM bookings;

INSERT INTO booking_services (
    booking_id,
    service_id,
    quantity,
    price_snapshot
)
VALUES
(1, 1, 1, 500),
(1, 2, 1, 1500);

SELECT * FROM booking_services;

INSERT INTO appointments (
    booking_id,
    staff_id,
    appointment_date,
    start_time,
    end_time,
    priority_score
)
VALUES
(
    1,
    1,
    '2026-06-01',
    '11:00',
    '12:30',
    92.5
);

INSERT INTO payments (
    appointment_id,
    amount,
    payment_method,
    payment_status,
    transaction_reference
)
VALUES
(
    1,
    2000,
    'UPI',
    'SUCCESS',
    'TXN123456'
);


select
  a.appointment_id,
  c.full_name AS customer_name,
  s.first_name AS staff_name,
  a.bboking_service_
  sv.service_name,
  a.appointment_date,
  p.payment_status
From appointments a
JOIN bookings b
    ON a.booking_id = b.booking_id
JOIN customers c
     ON b.customer_id = c.customer_id
JOIN staff s
     ON a.staff_id =s.staff_id
JOIN booking_services bs
    ON b.booking_id = bs.booking_id	  
JOIN services sv
     ON bs.service_id = sv.service_id
JOIN payments p
    ON a.appointment_id = p.appointment_id;	 
	 
select * from users
order by 'us';	

update users
set password_hash = '$2b$12$EWIhAN8kfUm1B1j.whjeqeVa.Ixm4m0QJqQ8M7uuEbdiryHqHfWb.'
where user_id = 1;

select user_id , user_code, password_hash
from users
where user_code = 'admin@1001'

select * from staff;

update users
set password_hash = '$2b$12$Y5wpi01X0Y2jBKh2UvjgGeGcGgGnBdsWNkMJqusQm8sDZuaoZGtoe'
where user_id =2;


update users
set password_hash = '$2b$12$IouXw5IPDvYZfLx/P2CE2OiiePcZdRyAO5EETJB4x8fAKcRmZeEY6'
where user_id =3;

update users
set password_hash = '$2b$12$QLNIEd0s0MOUMx.YWlusFOfoOpKfBmRJlD2kNEWIlvD37DyZl/Lrq'
where user_id = 4;


SELECT
    s.staff_id,
    s.first_name,
    s.user_id,
    u.role_id,
    r.role_name
FROM staff s
JOIN users u
    ON s.user_id = u.user_id
JOIN roles r
    ON u.role_id = r.role_id
WHERE r.role_name = 'STAFF';

SELECT
    ss.staff_id,
    ss.service_id,
    st.first_name,
    st.employment_status,
    st.is_available
FROM staff_services ss
JOIN staff st
ON ss.staff_id = st.staff_id;

SELECT
    service_id,
    service_name
FROM services;

SELECT * FROM bookings
ORDER BY booking_id DESC;

SELECT * FROM booking_services
ORDER BY booking_service_id DESC;

SELECT * FROM appointments
ORDER BY appointment_id DESC;

SELECT * FROM payments
ORDER BY payment_id DESC;
