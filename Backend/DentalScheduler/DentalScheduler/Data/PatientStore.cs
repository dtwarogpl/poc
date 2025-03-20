using DentalScheduler.Models;
using System.Collections.Concurrent;

namespace DentalScheduler.Data;

public class PatientStore
{
    private readonly ConcurrentDictionary<Guid, Patient> _patients = new();

    public IEnumerable<Patient> GetAllPatients()
    {
        return _patients.Values;
    }

    public Patient? GetPatientById(Guid patientId)
    {
        _patients.TryGetValue(patientId, out var patient);
        return patient;
    }

    public Patient? GetPatientByPhone(string phone)
    {
        return _patients.Values.FirstOrDefault(p => p.Phone == phone);
    }

    public Patient AddPatient(Patient patient)
    {
        _patients[patient.PatientId] = patient;
        return patient;
    }

    public bool UpdatePatient(Patient patient)
    {
        return _patients.TryUpdate(patient.PatientId, patient, GetPatientById(patient.PatientId)!);
    }

    public bool DeletePatient(Guid patientId)
    {
        return _patients.TryRemove(patientId, out _);
    }

    public void AddAppointmentToPatient(Guid patientId, Guid appointmentId)
    {
        if (_patients.TryGetValue(patientId, out var patient))
        {
            patient.AppointmentIds.Add(appointmentId);
            _patients[patientId] = patient;
        }
    }
}