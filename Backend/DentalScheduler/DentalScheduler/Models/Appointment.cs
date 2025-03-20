namespace DentalScheduler.Models;

public class Appointment
{
    public Guid AppointmentId { get; set; } = Guid.NewGuid();
    public string DoctorName { get; set; } = string.Empty;
    public DateTime AppointmentDateTime { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientPhone { get; set; } = string.Empty;
}