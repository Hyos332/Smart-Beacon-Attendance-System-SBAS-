import React, { useState, useEffect } from "react";
import AttendanceRegister from "./components/AttendanceRegister";
import Header from "./components/Header";

export default function App() {
  const [studentName, setStudentName] = useState("");
  const [classDate, setClassDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canLogout, setCanLogout] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa y si el estudiante puede cerrar sesión
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setStudentName(session.studentName);
      setClassDate(session.classDate);
      setIsLoggedIn(true);
      
      // Verificar si este estudiante ya registró asistencia
      checkIfCanLogout(session.studentName, session.classDate);
    }
  }, []);

  const checkIfCanLogout = (student: string, date: string) => {
    const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
    const hasRegistered = registeredStudents.some((record: any) => 
      record.studentName === student && record.classDate === date
    );
    setCanLogout(!hasRegistered);
  };

  const handleLogin = (student: string, date: string) => {
    setStudentName(student);
    setClassDate(date);
    setIsLoggedIn(true);
    setCanLogout(true);
    
    // Guardar sesión
    localStorage.setItem('currentSession', JSON.stringify({
      studentName: student,
      classDate: date,
      loginTime: Date.now()
    }));
  };

  const handleLogout = () => {
    // Limpiar sesión
    localStorage.removeItem('currentSession');
    setStudentName("");
    setClassDate("");
    setIsLoggedIn(false);
    setCanLogout(true);
  };

  const handleAttendanceRegistered = () => {
    setCanLogout(false);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        studentName={studentName}
        canLogout={canLogout}
        onLogout={handleLogout}
      />
      <AttendanceRegister
        studentName={studentName}
        classDate={classDate}
        onAttendanceRegistered={handleAttendanceRegistered}
      />
    </div>
  );
}

// Componente de login simple
function LoginForm({ onLogin }: { onLogin: (student: string, date: string) => void }) {
  const [student, setStudent] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student && date) {
      onLogin(student, date);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">Iniciar Sesión</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre de Estudiante:</label>
          <input
            type="text"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha de Clase:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
