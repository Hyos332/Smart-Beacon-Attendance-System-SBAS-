import React, { useState, useEffect } from "react";
import StudentRegister from "./components/StudentRegister";
import AttendanceRegister from "./components/AttendanceRegister";

function App() {
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("student_name");
    if (name) setStudentName(name);
  }, []);

  if (!studentName) {
    return <StudentRegister onRegistered={setStudentName} />;
  }

  return <AttendanceRegister studentName={studentName} />;
}

export default App;
