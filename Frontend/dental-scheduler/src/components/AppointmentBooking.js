import React, { useState, useEffect } from 'react';
import { fetchDentists, fetchAvailableDates, saveAppointment } from '../api';

const AppointmentBooking = () => {
  const [dentists, setDentists] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  // Pobieranie dostępnych terminów gdy zmieni się lekarz
  useEffect(() => {
    const loadAvailableDates = async () => {
      if (!selectedDoctor) return;
      
      setLoading(true);
      setError(null);
      setSelectedDate(null);
      setSelectedTime(null);
      
      try {
        const data = await fetchAvailableDates(selectedDoctor);
        setAvailableDates(data);
      } catch (err) {
        setError('Nie udało się załadować dostępnych terminów. Spróbuj ponownie później.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableDates();
  }, [selectedDoctor]);

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !patientName || !patientPhone) {
      setError('Proszę wypełnić wszystkie pola');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Utworzenie daty i czasu wizyty poprzez połączenie wybranej daty i godziny
      const [year, month, day] = selectedDate.split('-');
      const [hour] = selectedTime.split(':');
      const appointmentDateTime = new Date(year, month - 1, day, hour);
      
      await saveAppointment({
        doctorName: selectedDoctor,
        appointmentDateTime,
        patientName,
        patientPhone,
        notes
      });
      
      setSuccess('Wizyta została pomyślnie zarezerwowana!');
      
      // Reset formularza
      setSelectedDate(null);
      setSelectedTime(null);
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      
      // Odświeżenie dostępnych terminów
      const data = await fetchAvailableDates(selectedDoctor);
      setAvailableDates(data);
    } catch (err) {
      setError('Nie udało się zarezerwować wizyty. Spróbuj ponownie później.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Zarezerwuj Wizytę Online</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Wybierz lekarza, dogodny termin i zarezerwuj wizytę w kilku prostych krokach.
        </p>
        <div>
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
      </div>

      {loading && <div className="loading-indicator">Ładowanie dostępnych terminów</div>}
      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      {availableDates.length > 0 && (
        <div className="card">
          <h3>Dostępne Terminy</h3>
          <div className="date-selector">
            {availableDates.map((dateInfo) => (
              <div 
                key={dateInfo.date}
                className={`date-card ${selectedDate === dateInfo.date ? 'selected' : ''}`}
                onClick={() => handleDateSelect(dateInfo.date)}
              >
                <div className="date-header">
                  {new Date(dateInfo.date).toLocaleDateString('pl-PL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="slots-container">
                  {dateInfo.availableSlots.length === 0 ? (
                    <p>Brak dostępnych terminów</p>
                  ) : (
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: 'middle' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>Dostępne terminy: {dateInfo.availableSlots.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="card">
          <h3>Wybierz Godzinę</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
            Dostępne godziny dla {new Date(selectedDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}:
          </p>
          <div className="slots-container">
            {availableDates
              .find(dateInfo => dateInfo.date === selectedDate)
              ?.availableSlots.map((time) => (
                <div 
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="card">
          <h3>Dane Pacjenta</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
            Prosimy o podanie danych kontaktowych do potwierdzenia wizyty.
          </p>
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-group">
              <label htmlFor="patientName">Imię i Nazwisko:</label>
              <input 
                id="patientName" 
                type="text" 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                required
                placeholder="np. Jan Kowalski"
              />
            </div>
            <div className="form-group">
              <label htmlFor="patientPhone">Telefon:</label>
              <input 
                id="patientPhone" 
                type="tel" 
                value={patientPhone} 
                onChange={(e) => setPatientPhone(e.target.value)} 
                required
                placeholder="np. 123-456-789"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notatka dla lekarza:</label>
              <textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Opisz swój problem lub przyczynę wizyty"
                rows="3"
              />
            </div>
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <button type="submit" disabled={loading}>
                {loading ? 'Rezerwacja...' : 'Zarezerwuj Wizytę'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;