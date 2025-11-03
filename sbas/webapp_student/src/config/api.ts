export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://diligent-analysis-production-44fb.up.railway.app'
      : 'http://localhost:5000'),
  ENDPOINTS: {
    ATTENDANCE: {
      REGISTER: '/api/attendance/register',
      CHECK: '/api/attendance/check',
      LIST: '/api/attendance'
    },
    BEACON: {
      STATUS: '/api/beacon/status',
      START: '/api/beacon/start',
      STOP: '/api/beacon/stop'
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