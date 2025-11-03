export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    ATTENDANCE: {
      LIST: '/api/attendance',
      REGISTER: '/api/attendance/register',
      DELETE: '/api/attendance',
      CLEAR: '/api/attendance/clear',
      DELETE_MULTIPLE: '/api/attendance/delete-multiple'
    },
    BEACON: {
      STATUS: '/api/beacon/status',
      START: '/api/beacon/start',
      STOP: '/api/beacon/stop'
    },
    HEALTH: '/health'
  }
};

export const POLLING_INTERVALS = {
  BEACON_STATUS: 2000,
  ATTENDANCE_LIST: 3000
};