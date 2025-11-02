export interface Attendance {
  id: number;
  student_id: string;
  timestamp: string;
  detection_method: 'BLE' | 'WIFI' | 'MANUAL';
  class_date: string;
}

export interface BeaconStatus {
  active: boolean;
  class_date: string | null;
}

export interface AttendanceCheckResponse {
  hasAttendance: boolean;
  activeClass: string | null;
}

export interface AttendanceRegisterResponse {
  success: boolean;
  class_date: string;
}

export interface RegisteredStudent {
  studentName: string;
  classDate: string;
  timestamp: number;
}