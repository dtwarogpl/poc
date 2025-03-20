const API_URL = 'https://fabresapi.twarog.eu/api';

export const fetchDentists = async () => {
  const response = await fetch(`${API_URL}/dentists`);
  if (!response.ok) {
    throw new Error('Failed to fetch dentists');
  }
  return response.json();
};

export const fetchAvailableDates = async (doctorName) => {
  const response = await fetch(`${API_URL}/appointments/available/${doctorName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch available dates');
  }
  return response.json();
};

export const checkAppointmentAvailability = async (doctorName, dateTime) => {
  const formattedDateTime = new Date(dateTime).toISOString();
  const response = await fetch(`${API_URL}/appointments/check/${doctorName}/${formattedDateTime}`);
  if (!response.ok) {
    throw new Error('Failed to check appointment availability');
  }
  return response.json();
};

export const fetchAlternativeDates = async (doctorName, dateTime) => {
  const formattedDateTime = new Date(dateTime).toISOString();
  const response = await fetch(`${API_URL}/appointments/alternatives/${doctorName}/${formattedDateTime}`);
  if (!response.ok) {
    throw new Error('Failed to fetch alternative dates');
  }
  return response.json();
};

export const saveAppointment = async (appointmentData) => {
  const response = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData || 'Failed to save appointment');
  }
  
  return response.json();
};

export const fetchAppointmentsByDoctorAndDate = async (doctorName, date) => {
  const formattedDate = new Date(date).toISOString();
  const response = await fetch(`${API_URL}/appointments/${doctorName}/${formattedDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return response.json();
};