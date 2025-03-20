using System.Collections.Concurrent;
using DentalScheduler.Models;

namespace DentalScheduler.Data;

public class AppointmentStore
{
    private readonly ConcurrentDictionary<Guid, Appointment> _appointments = new();
    private readonly PatientStore? _patientStore;

    // Lista dentystów dla POC
    public static readonly string[] Dentists = { "Dr. Kowalski", "Dr. Nowak", "Dr. Wiśniewski" };
    
    // Inicjalizacja przykładowymi danymi
    public AppointmentStore(PatientStore? patientStore = null)
    {
        _patientStore = patientStore;
        
        // Dodanie kilku przykładowych wizyt
        var today = DateTime.Today;
        
        AddAppointment(new Appointment
        {
            DoctorName = "Dr. Kowalski",
            AppointmentDateTime = today.AddDays(1).AddHours(9), // Jutro o 9:00
            PatientName = "Jan Kowalski",
            PatientPhone = "555-123-4567",
            Notes = "Regular check-up"
        });
        
        AddAppointment(new Appointment
        {
            DoctorName = "Dr. Nowak",
            AppointmentDateTime = today.AddDays(1).AddHours(10), // Jutro o 10:00
            PatientName = "Anna Nowak",
            PatientPhone = "555-987-6543",
            Notes = "Tooth pain in lower left molar"
        });
    }
    
    public IEnumerable<Appointment> GetAll()
    {
        return _appointments.Values;
    }
    
    public IEnumerable<Appointment> GetByDoctor(string doctorName)
    {
        return _appointments.Values.Where(a => a.DoctorName == doctorName);
    }
    
    public bool IsTimeSlotAvailable(string doctorName, DateTime dateTime)
    {
        // Normalize to start of hour
        dateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, dateTime.Hour, 0, 0);
        
        // Check business rules
        if (dateTime.DayOfWeek == DayOfWeek.Saturday || dateTime.DayOfWeek == DayOfWeek.Sunday)
        {
            return false; // No appointments on weekends
        }
        
        if (dateTime.Hour < 8 || dateTime.Hour >= 16)
        {
            return false; // Only appointments between 8 AM and 4 PM
        }
        
        // Check if there's already an appointment at this time
        return !_appointments.Values.Any(a => 
            a.DoctorName == doctorName && 
            a.AppointmentDateTime.Year == dateTime.Year &&
            a.AppointmentDateTime.Month == dateTime.Month &&
            a.AppointmentDateTime.Day == dateTime.Day &&
            a.AppointmentDateTime.Hour == dateTime.Hour);
    }
    
    public Appointment? GetById(Guid id)
    {
        _appointments.TryGetValue(id, out var appointment);
        return appointment;
    }
    
    public Appointment AddAppointment(Appointment appointment)
    {
        // Normalize to start of hour
        appointment.AppointmentDateTime = new DateTime(
            appointment.AppointmentDateTime.Year, 
            appointment.AppointmentDateTime.Month, 
            appointment.AppointmentDateTime.Day, 
            appointment.AppointmentDateTime.Hour, 
            0, 0);
            
        if (!IsTimeSlotAvailable(appointment.DoctorName, appointment.AppointmentDateTime))
        {
            throw new InvalidOperationException("This time slot is not available.");
        }
        
        // Link to existing patient if phone number matches
        if (_patientStore != null)
        {
            var existingPatient = _patientStore.GetPatientByPhone(appointment.PatientPhone);
            
            if (existingPatient != null)
            {
                // Use existing patient's ID
                appointment.PatientId = existingPatient.PatientId;
                
                // Add appointment ID to patient's appointment list
                _patientStore.AddAppointmentToPatient(existingPatient.PatientId, appointment.AppointmentId);
            }
            else
            {
                // Create a new patient
                var newPatient = new Patient
                {
                    Name = appointment.PatientName,
                    Phone = appointment.PatientPhone
                };
                
                var savedPatient = _patientStore.AddPatient(newPatient);
                appointment.PatientId = savedPatient.PatientId;
                
                // Add appointment ID to patient's appointment list
                _patientStore.AddAppointmentToPatient(savedPatient.PatientId, appointment.AppointmentId);
            }
        }
        
        _appointments[appointment.AppointmentId] = appointment;
        return appointment;
    }
    
    public IEnumerable<DateTime> GetAvailableSlotsForDay(string doctorName, DateTime date)
    {
        var availableSlots = new List<DateTime>();
        
        // Only consider weekdays
        if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
        {
            // Check each hour from 8 AM to 4 PM
            for (int hour = 8; hour < 16; hour++)
            {
                var slotTime = new DateTime(date.Year, date.Month, date.Day, hour, 0, 0);
                if (IsTimeSlotAvailable(doctorName, slotTime))
                {
                    availableSlots.Add(slotTime);
                }
            }
        }
        
        return availableSlots;
    }
    
    public IEnumerable<DateTime> GetFirstThreeAvailableDaysWithSlots(string doctorName)
    {
        var result = new List<DateTime>();
        var currentDate = DateTime.Today;
        
        // Look ahead for up to 30 days to find available slots
        for (int i = 0; i < 30 && result.Count < 3; i++)
        {
            // Skip weekends
            if (currentDate.DayOfWeek != DayOfWeek.Saturday && currentDate.DayOfWeek != DayOfWeek.Sunday)
            {
                var availableSlots = GetAvailableSlotsForDay(doctorName, currentDate);
                if (availableSlots.Any())
                {
                    result.Add(currentDate);
                }
            }
            
            currentDate = currentDate.AddDays(1);
        }
        
        return result;
    }
    
    public IEnumerable<DateTime> GetAlternativeSlots(string doctorName, DateTime dateTime, int windowDays = 3)
    {
        var startDate = dateTime.AddDays(-windowDays).Date;
        var endDate = dateTime.AddDays(windowDays).Date;
        var currentDate = startDate;
        
        var alternativeSlots = new List<DateTime>();
        
        while (currentDate <= endDate)
        {
            var daySlots = GetAvailableSlotsForDay(doctorName, currentDate);
            alternativeSlots.AddRange(daySlots);
            currentDate = currentDate.AddDays(1);
        }
        
        return alternativeSlots;
    }
}