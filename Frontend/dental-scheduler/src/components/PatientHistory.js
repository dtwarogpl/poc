import React, { useState, useEffect } from 'react';
import { fetchPatientByPhone, fetchPatientAppointments } from '../api';

const PatientHistory = () => {
  const [patientPhone, setPatientPhone] = useState('');
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPatient = async (e) => {
    e.preventDefault();
    
    if (!patientPhone) {
      setError('Proszę podać numer telefonu pacjenta');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPatient(null);
    setAppointments([]);
    
    try {
      const patientData = await fetchPatientByPhone(patientPhone);
      setPatient(patientData);
      
      const appointmentsData = await fetchPatientAppointments(patientData.patientId);
      setAppointments(appointmentsData);
    } catch (err) {
      setError('Nie znaleziono pacjenta o podanym numerze telefonu lub wystąpił błąd');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Historia Pacjenta</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Wyszukaj historię wizyt pacjenta na podstawie numeru telefonu.
        </p>
        
        <form onSubmit={searchPatient} className="search-form">
          <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="tel" 
              value={patientPhone} 
              onChange={(e) => setPatientPhone(e.target.value)} 
              placeholder="Numer telefonu pacjenta"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Szukam...' : 'Szukaj'}
            </button>
          </div>
        </form>
        
        {loading && <div className="loading-indicator">Wyszukiwanie pacjenta</div>}
        {error && <div className="status-message error">{error}</div>}
      </div>
      
      {patient && (
        <div className="card">
          <h3>Dane Pacjenta</h3>
          <div className="patient-info">
            <p><strong>Imię i Nazwisko:</strong> {patient.name}</p>
            <p><strong>Telefon:</strong> {patient.phone}</p>
            {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
            {patient.dateOfBirth && <p><strong>Data urodzenia:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>}
            {patient.address && <p><strong>Adres:</strong> {patient.address}</p>}
          </div>
        </div>
      )}
      
      {patient && appointments.length > 0 && (
        <div className="card">
          <h3>Historia Wizyt</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Lekarz</th>
                  <th>Notatka</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <td>{new Date(appointment.appointmentDateTime).toLocaleDateString()} {new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{appointment.doctorName}</td>
                    <td>{appointment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {patient && appointments.length === 0 && (
        <div className="card">
          <h3>Historia Wizyt</h3>
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
            <p>Pacjent nie ma jeszcze historii wizyt</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;