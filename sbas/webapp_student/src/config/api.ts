export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://truthful-balance-production.up.railway.app'
      : 'http://localhost:5000'),
  ENDPOINTS: {
    BEACON: {
      STATUS: '/api/beacon/status-legacy',  // Endpoint de compatibilidad temporal
      START: '/api/beacon/start',
      STOP: '/api/beacon/stop'
    },
    ATTENDANCE: {
      LIST: '/api/attendance',
      REGISTER: '/api/attendance/register-legacy',  // Endpoint de compatibilidad temporal
      CHECK: '/api/attendance/check-legacy'  // Endpoint de compatibilidad temporal
    },
    STUDENTS: {
      REGISTER: '/api/students/register'
    }
  }
};

export const POLLING_INTERVALS = {
  BEACON_STATUS: 5000,
  ATTENDANCE_LIST: 5000
};

export const LOCAL_STORAGE_KEYS = {
  REGISTERED_STUDENTS: 'registeredStudents',
  CURRENT_SESSION: 'currentSession'
};