import React, { useState, useEffect } from "react";
import StudentRegister from "./components/StudentRegister";
import AttendanceRegister from "./components/AttendanceRegister";

function App() {
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("student_name");
    if (name) setStudentName(name);
  }, []);

  // Calcula la fecha de hoy en formato YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const classDate = `${yyyy}-${mm}-${dd}`;

  if (!studentName) {
    return <StudentRegister onRegistered={setStudentName} />;
  }

  return <AttendanceRegister studentName={studentName} classDate={classDate} />;
}

export default App;
