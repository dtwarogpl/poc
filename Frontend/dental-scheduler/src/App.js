import React, { useState } from 'react';
import DoctorDashboard from './components/DoctorDashboard';
import AppointmentBooking from './components/AppointmentBooking';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container">
      <div className="header">
        <h1>DentiSync</h1>
        <p>Nowoczesny system rezerwacji wizyt stomatologicznych</p>
        
        <div className="header-buttons">
          <button 
            className={`header-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Panel Lekarza
          </button>
          <button 
            className={`header-button ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            Zarezerwuj Wizytę
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? <DoctorDashboard /> : <AppointmentBooking />}
    </div>
  );
}

export default App;