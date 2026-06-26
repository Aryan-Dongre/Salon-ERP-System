INSERT INTO roles(role_name, description)
VALUES 
('ADMIN', 'Full system access'),
('MANAGER', 'Salon management access'),
('RECEPTIONIST', 'Booking and customer management'),
('STAFF', 'Service provider'),
('CUSTOMER', 'Website customer access');

INSERT INTO users
(role_id, user_code, password_hash)
VALUES
(1, 'admin@1001', 'hashed_password_1'),
(2, 'manager@1001', 'hashed_password_2'),
(3, 'receptionist@1001', 'hashed_password_3'),
(4, 'staff@1001', 'hashed_password_4');

/*User*/
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
    5,
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

update users
set password_hash = '$2b$12$EWIhAN8kfUm1B1j.whjeqeVa.Ixm4m0QJqQ8M7uuEbdiryHqHfWb.'
where user_id = 1;

update users
set password_hash = '$2b$12$Y5wpi01X0Y2jBKh2UvjgGeGcGgGnBdsWNkMJqusQm8sDZuaoZGtoe'
where user_id =2;

update users
set password_hash = '$2b$12$IouXw5IPDvYZfLx/P2CE2OiiePcZdRyAO5EETJB4x8fAKcRmZeEY6'
where user_id =3;

update users
set password_hash = '$2b$12$QLNIEd0s0MOUMx.YWlusFOfoOpKfBmRJlD2kNEWIlvD37DyZl/Lrq'
where user_id = 4;

/*Staff*/
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

/*Service category*/
INSERT INTO service_categories
(category_name)
VALUES
('Hair'),
('Skin'),
('Groom'),
('Bridal'),
('Nails'),
('Massage');

/*Services*/
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

/*Insert into staff service*/
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

