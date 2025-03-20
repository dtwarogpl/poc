import React from 'react';

const AppointmentList = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="card">
        <h3>Brak zaplanowanych wizyt na ten dzień</h3>
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p style={{ marginTop: '15px' }}>Dzień wolny od wizyt. Wybierz inną datę lub lekarza.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Zaplanowane Wizyty</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Godzina</th>
              <th>Imię i Nazwisko Pacjenta</th>
              <th>Telefon</th>
              <th>Notatka</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.appointmentId}>
                <td>{new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{appointment.patientName}</td>
                <td>{appointment.patientPhone}</td>
                <td>{appointment.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;