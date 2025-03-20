using DentalScheduler.Data;
using DentalScheduler.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Register the stores as singletons
builder.Services.AddSingleton<AppointmentStore>();
builder.Services.AddSingleton<PatientStore>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
// Apply CORS before any other middleware
app.UseCors();

// List all dentists
app.MapGet("/api/dentists", () => 
{
    return Results.Ok(AppointmentStore.Dentists);
})
.WithName("GetDentists")
.WithOpenApi();

// Get available appointment dates
app.MapGet("/api/appointments/available/{doctorName}", (string doctorName, AppointmentStore store) =>
{
    if (!AppointmentStore.Dentists.Contains(doctorName))
    {
        return Results.NotFound($"Doctor {doctorName} not found");
    }

    var availableDates = store.GetFirstThreeAvailableDaysWithSlots(doctorName);
    
    var result = availableDates.Select(date => new 
    {
        Date = date.ToString("yyyy-MM-dd"),
        AvailableSlots = store.GetAvailableSlotsForDay(doctorName, date)
                            .Select(dt => dt.ToString("HH:mm"))
    });
    
    return Results.Ok(result);
})
.WithName("GetAvailableAppointmentDates")
.WithOpenApi();

// Check appointment date availability
app.MapGet("/api/appointments/check/{doctorName}/{dateTime}", (string doctorName, DateTime dateTime, AppointmentStore store) =>
{
    if (!AppointmentStore.Dentists.Contains(doctorName))
    {
        return Results.NotFound($"Doctor {doctorName} not found");
    }
    
    bool isAvailable = store.IsTimeSlotAvailable(doctorName, dateTime);
    return Results.Ok(isAvailable);
})
.WithName("CheckAppointmentDateAvailability")
.WithOpenApi();

// Check alternative dates
app.MapGet("/api/appointments/alternatives/{doctorName}/{dateTime}", (string doctorName, DateTime dateTime, AppointmentStore store) =>
{
    if (!AppointmentStore.Dentists.Contains(doctorName))
    {
        return Results.NotFound($"Doctor {doctorName} not found");
    }
    
    var alternativeSlots = store.GetAlternativeSlots(doctorName, dateTime)
                                .Select(dt => new 
                                {
                                    Date = dt.ToString("yyyy-MM-dd"),
                                    Time = dt.ToString("HH:mm")
                                });
    
    return Results.Ok(alternativeSlots);
})
.WithName("CheckAlternativeDates")
.WithOpenApi();

// Save appointment
app.MapPost("/api/appointments", (Appointment appointment, AppointmentStore store) =>
{
    if (!AppointmentStore.Dentists.Contains(appointment.DoctorName))
    {
        return Results.BadRequest($"Doctor {appointment.DoctorName} not found");
    }
    
    if (string.IsNullOrWhiteSpace(appointment.PatientName) || 
        string.IsNullOrWhiteSpace(appointment.PatientPhone))
    {
        return Results.BadRequest("Patient name and phone are required");
    }
    
    try
    {
        var savedAppointment = store.AddAppointment(appointment);
        return Results.Created($"/api/appointments/{savedAppointment.AppointmentId}", savedAppointment);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("SaveAppointment")
.WithOpenApi();

// Get appointments for doctor on a specific date
app.MapGet("/api/appointments/{doctorName}/{date}", (string doctorName, DateTime date, AppointmentStore store) =>
{
    if (!AppointmentStore.Dentists.Contains(doctorName))
    {
        return Results.NotFound($"Doctor {doctorName} not found");
    }
    
    var appointments = store.GetByDoctor(doctorName)
                            .Where(a => a.AppointmentDateTime.Date == date.Date)
                            .OrderBy(a => a.AppointmentDateTime);
    
    return Results.Ok(appointments);
})
.WithName("GetAppointmentsByDoctorAndDate")
.WithOpenApi();

// Patient endpoints
app.MapGet("/api/patients", (PatientStore store) =>
{
    var patients = store.GetAllPatients();
    return Results.Ok(patients);
})
.WithName("GetAllPatients")
.WithOpenApi();

app.MapGet("/api/patients/{id}", (Guid id, PatientStore store) =>
{
    var patient = store.GetPatientById(id);
    if (patient == null)
    {
        return Results.NotFound($"Patient with ID {id} not found");
    }
    return Results.Ok(patient);
})
.WithName("GetPatientById")
.WithOpenApi();

app.MapGet("/api/patients/phone/{phone}", (string phone, PatientStore store) =>
{
    var patient = store.GetPatientByPhone(phone);
    if (patient == null)
    {
        return Results.NotFound($"Patient with phone {phone} not found");
    }
    return Results.Ok(patient);
})
.WithName("GetPatientByPhone")
.WithOpenApi();

app.MapPost("/api/patients", (Patient patient, PatientStore store) =>
{
    if (string.IsNullOrWhiteSpace(patient.Name) || string.IsNullOrWhiteSpace(patient.Phone))
    {
        return Results.BadRequest("Patient name and phone are required");
    }
    
    // Check if patient with this phone already exists
    var existingPatient = store.GetPatientByPhone(patient.Phone);
    if (existingPatient != null)
    {
        return Results.BadRequest($"Patient with phone {patient.Phone} already exists");
    }
    
    var savedPatient = store.AddPatient(patient);
    return Results.Created($"/api/patients/{savedPatient.PatientId}", savedPatient);
})
.WithName("CreatePatient")
.WithOpenApi();

app.MapPut("/api/patients/{id}", (Guid id, Patient patient, PatientStore store) =>
{
    if (id != patient.PatientId)
    {
        return Results.BadRequest("ID in URL does not match ID in request body");
    }
    
    var existingPatient = store.GetPatientById(id);
    if (existingPatient == null)
    {
        return Results.NotFound($"Patient with ID {id} not found");
    }
    
    if (store.UpdatePatient(patient))
    {
        return Results.NoContent();
    }
    
    return Results.Problem("Failed to update patient");
})
.WithName("UpdatePatient")
.WithOpenApi();

app.MapGet("/api/patients/{id}/appointments", (Guid id, PatientStore patientStore, AppointmentStore appointmentStore) =>
{
    var patient = patientStore.GetPatientById(id);
    if (patient == null)
    {
        return Results.NotFound($"Patient with ID {id} not found");
    }
    
    var appointments = patient.AppointmentIds
        .Select(appointmentId => appointmentStore.GetById(appointmentId))
        .Where(a => a != null)
        .OrderByDescending(a => a!.AppointmentDateTime);
    
    return Results.Ok(appointments);
})
.WithName("GetPatientAppointments")
.WithOpenApi();

app.Run();