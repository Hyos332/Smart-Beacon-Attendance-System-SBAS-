import React, { useState, useEffect } from "react";
import AttendanceRegister from "./components/AttendanceRegister";
import Header from "./components/Header";

export default function App() {
  const [studentName, setStudentName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canLogout, setCanLogout] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa y si el estudiante puede cerrar sesión
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setStudentName(session.studentName);
      setIsLoggedIn(true);
      
      // Verificar si este estudiante ya registró asistencia
      checkIfCanLogout(session.studentName);
    }
  }, []);

  const checkIfCanLogout = (student: string) => {
    const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
    const hasRegistered = registeredStudents.some((record: any) => 
      record.studentName === student
    );
    setCanLogout(!hasRegistered);
  };

  const handleLogin = (student: string) => {
    setStudentName(student);
    setIsLoggedIn(true);
    setCanLogout(true);
    
    // Guardar sesión
    localStorage.setItem('currentSession', JSON.stringify({
      studentName: student,
      loginTime: Date.now()
    }));
  };

  const handleLogout = () => {
    // Limpiar sesión
    localStorage.removeItem('currentSession');
    setStudentName("");
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
        onAttendanceRegistered={handleAttendanceRegistered}
      />
    </div>
  );
}

// Componente de login simplificado (solo nombre)
function LoginForm({ onLogin }: { onLogin: (student: string) => void }) {
  const [student, setStudent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student.trim()) {
      onLogin(student.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Iniciar Sesión
        </h1>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Estudiante:
          </label>
          <input
            type="text"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          Ingresar
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          La fecha de la clase se detectará automáticamente
        </div>
      </form>
    </div>
  );
}
