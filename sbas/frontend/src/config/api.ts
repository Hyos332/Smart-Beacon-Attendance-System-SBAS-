export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://truthful-balance-production.up.railway.app'
      : 'http://localhost:5000'),
  ENDPOINTS: {
    BEACON: {
      STATUS: '/api/beacon/status',
      START: '/api/beacon/start',
      STOP: '/api/beacon/stop'
    },
    ATTENDANCE: {
      LIST: '/api/attendance',
      REGISTER: '/api/attendance/register',
      DELETE: '/api/attendance/delete',
      DELETE_MULTIPLE: '/api/attendance/delete-multiple',
      CLEAR: '/api/attendance/clear',
      CHECK: '/api/attendance/check'
    }
  }
};

export const POLLING_INTERVALS = {
  BEACON_STATUS: 5000,  
  ATTENDANCE_LIST: 5000
};