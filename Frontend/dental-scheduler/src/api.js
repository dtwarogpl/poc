const API_URL = 'http://localhost:5000/api';

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

// Patient related API calls
export const fetchPatients = async () => {
  const response = await fetch(`${API_URL}/patients`);
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  return response.json();
};

export const fetchPatientById = async (patientId) => {
  const response = await fetch(`${API_URL}/patients/${patientId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch patient');
  }
  return response.json();
};

export const fetchPatientByPhone = async (phone) => {
  const response = await fetch(`${API_URL}/patients/phone/${phone}`);
  if (!response.ok) {
    throw new Error('Failed to fetch patient by phone');
  }
  return response.json();
};

export const createPatient = async (patientData) => {
  const response = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData || 'Failed to create patient');
  }
  
  return response.json();
};

export const updatePatient = async (patientId, patientData) => {
  const response = await fetch(`${API_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData || 'Failed to update patient');
  }
  
  return response.ok;
};

export const fetchPatientAppointments = async (patientId) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/appointments`);
  if (!response.ok) {
    throw new Error('Failed to fetch patient appointments');
  }
  return response.json();
};

export const fetchPatientNoteByPhone = async (phone) => {
  const response = await fetch(`${API_URL}/patients/note/${phone}`);
  if (!response.ok) {
    throw new Error('Failed to fetch patient note');
  }
  return response.json();
};