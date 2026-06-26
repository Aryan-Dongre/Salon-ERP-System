# Salon ERP Database

This folder contains all SQL scripts required to set up the Salon ERP database.

## Files

### 01_schema.sql

Creates the complete database structure including:

- Tables
- Primary Keys
- Foreign Keys
- Constraints
- Default Values

This file does not insert any data.

### 02_seed_data.sql

Inserts the required system data for the application.

Includes:

- Roles
- System Users
- Staff Members
- Service Categories
- Services
- Staff-Service Assignments

This data is required for the ERP to function correctly.

### 03_demo_data.sql

Contains optional demonstration data for testing.

Includes:

- Sample Customer
- Booking
- Booking Services
- Appointment
- Payment

This file is optional and intended for development or demonstration purposes.

### Salon_ERP.sql

Original complete SQL backup containing the schema and all project data.

## Installation Order

Execute the SQL files in the following order:

1. `01_schema.sql`
2. `02_seed_data.sql`
3. `03_demo_data.sql` *(Optional)*

The database is then ready to be connected with the Flask application.