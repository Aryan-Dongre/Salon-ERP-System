/*customer*/
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

/*booking*/
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

/*booking service*/
INSERT INTO booking_services (
    booking_id,
    service_id,
    quantity,
    price_snapshot
)
VALUES
(1, 1, 1, 500),
(1, 2, 1, 1500);

/*appointment*/
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

/*payment*/
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
