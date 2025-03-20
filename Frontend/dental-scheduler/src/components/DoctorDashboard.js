import React, { useState, useEffect } from 'react';
import { fetchDentists, fetchAppointmentsByDoctorAndDate } from '../api';
import AppointmentList from './AppointmentList';

const DoctorDashboard = () => {
  const [dentists, setDentists] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pobieranie dentystów przy montowaniu komponentu
  useEffect(() => {
    const loadDentists = async () => {
      try {
        const data = await fetchDentists();
        setDentists(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0]);
        }
      } catch (err) {
        setError('Nie udało się załadować listy lekarzy. Spróbuj ponownie później.');
        console.error(err);
      }
    };

    loadDentists();
  }, []);

  // Pobieranie wizyt gdy zmieni się lekarz lub data
  useEffect(() => {
    const loadAppointments = async () => {
      if (!selectedDoctor) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAppointmentsByDoctorAndDate(selectedDoctor, selectedDate);
        setAppointments(data);
      } catch (err) {
        setError('Nie udało się załadować wizyt. Spróbuj ponownie później.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [selectedDoctor, selectedDate]);

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div>
      <div className="card">
        <h2>Panel Lekarza</h2>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label htmlFor="doctor">Wybierz Lekarza:</label>
            <select 
              id="doctor" 
              value={selectedDoctor} 
              onChange={handleDoctorChange}
            >
              {dentists.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label htmlFor="date">Wybierz Datę:</label>
            <input 
              id="date" 
              type="date" 
              value={selectedDate} 
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {loading && <div className="loading-indicator">Ładowanie wizyt</div>}
      {error && <div className="status-message error">{error}</div>}
      {!loading && !error && <AppointmentList appointments={appointments} />}
    </div>
  );
};

export default DoctorDashboard;