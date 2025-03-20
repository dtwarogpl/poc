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

// Register the appointment store as a singleton
builder.Services.AddSingleton<AppointmentStore>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
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

app.Run();