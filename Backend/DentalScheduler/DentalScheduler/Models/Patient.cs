namespace DentalScheduler.Models;

public class Patient
{
    public Guid PatientId { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; } = string.Empty;
    public List<Guid> AppointmentIds { get; set; } = new List<Guid>();
}