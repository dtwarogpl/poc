# Dental Appointment Scheduling Service POC

This is a proof of concept implementation for a dental appointment scheduling service.

## Project Structure

- `Backend/` - .NET 9 ASP.NET Core Web API with minimal API endpoints
- `Frontend/` - React-based frontend application

## Backend (.NET 9, C#)

The backend implements the following features:
- In-memory appointment storage using a singleton service
- API endpoints for managing dental appointments
- Business rules for appointment scheduling

### Running the Backend

```bash
cd Backend/DentalScheduler/DentalScheduler
dotnet run
```

The backend will start on http://localhost:5000 and https://localhost:5001

## Frontend (React)

The frontend implements:
- Doctor Dashboard for viewing scheduled appointments
- Appointment booking interface
- Interactive date and time slot selection

### Running the Frontend

```bash
cd Frontend/dental-scheduler
npm install
npm start
```

The frontend will start on http://localhost:3000

## API Endpoints

- `GET /api/dentists` - List all dentists
- `GET /api/appointments/available/{doctorName}` - Get available appointment dates
- `GET /api/appointments/check/{doctorName}/{dateTime}` - Check appointment availability
- `GET /api/appointments/alternatives/{doctorName}/{dateTime}` - Get alternative dates
- `POST /api/appointments` - Save a new appointment
- `GET /api/appointments/{doctorName}/{date}` - Get appointments for doctor on specific date

## Business Rules

- All dentists are available from 8:00 to 16:00 (8 AM to 4 PM)
- Appointments can only be scheduled at the start of each hour (8:00, 9:00, etc.)
- Each appointment lasts exactly one hour
- No appointments on weekends