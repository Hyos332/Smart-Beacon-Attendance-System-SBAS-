import React, { useState, useEffect } from "react";
import AttendanceRegister from "./components/AttendanceRegister";
import Header from "./components/Header";
import { LOCAL_STORAGE_KEYS } from "./config/api";
import { RegisteredStudent } from "./types/attendance";
import { logInfo, logError } from "./utils/errorHandler";
import { ToastProvider, useToast } from "./hooks/useToast";

interface SessionData {
  studentName: string;
  loginTime: number;
}

// Componente principal envuelto en ToastProvider
export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

// Contenido principal de la app (ahora puede usar useToast)
function AppContent() {
  const [studentName, setStudentName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [canLogout, setCanLogout] = useState<boolean>(true);
  const [hasShownWelcome, setHasShownWelcome] = useState<boolean>(false);
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  useEffect(() => {
    // Verificar si hay una sesión activa y si el estudiante puede cerrar sesión
    const savedSession = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_SESSION);
    if (savedSession) {
      try {
        const session: SessionData = JSON.parse(savedSession);
        setStudentName(session.studentName);
        setIsLoggedIn(true);
        
        // Verificar si este estudiante ya registró asistencia
        const registeredStudents: RegisteredStudent[] = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_STUDENTS) || '[]'
        );
        
        const hasRegistered = registeredStudents.some((record: RegisteredStudent) => 
          record.studentName === session.studentName
        );
        
        setCanLogout(!hasRegistered);
        
        if (!hasShownWelcome) {
          showInfo(`Bienvenido de vuelta, ${session.studentName}`, 3000);
          if (hasRegistered) {
            showWarning("Tu sesión está bloqueada por seguridad después de registrar asistencia", 4000);
          }
          setHasShownWelcome(true);
        }
        
        logInfo("Session restored", { studentName: session.studentName, canLogout: !hasRegistered });
      } catch (error) {
        logError("Failed to restore session", error);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_SESSION);
        showError("Error al restaurar la sesión. Por favor inicia sesión nuevamente.");
      }
    }
  }, [hasShownWelcome, showError, showInfo, showWarning]); // SOLO se ejecuta una vez al montar el componente

  const handleLogin = (student: string): void => {
    if (!student.trim()) {
      logError("Login attempted with empty student name");
      showError("Por favor ingresa un nombre válido");
      return;
    }

    const normalizedStudent = student.trim();
    setStudentName(normalizedStudent);
    setIsLoggedIn(true);
    setCanLogout(true);
    setHasShownWelcome(false); // Reset para permitir mensajes de bienvenida
    
    // Guardar sesión
    const sessionData: SessionData = {
      studentName: normalizedStudent,
      loginTime: Date.now()
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionData));
    
    logInfo("Student logged in", { studentName: normalizedStudent });
    showSuccess(`¡Bienvenido, ${normalizedStudent}!`, 3000);
  };

  const handleLogout = (): void => {
    if (!canLogout) {
      logError("Logout attempt blocked - student has registered attendance");
      showError("No puedes cerrar sesión después de registrar asistencia");
      return;
    }

    // Limpiar sesión
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_SESSION);
    setStudentName("");
    setIsLoggedIn(false);
    setCanLogout(true);
    setHasShownWelcome(false);
    
    logInfo("Student logged out successfully");
    showSuccess("Sesión cerrada correctamente", 2000);
  };

  const handleAttendanceRegistered = (): void => {
    setCanLogout(false);
    logInfo("Attendance registered - logout disabled for security");
    showSuccess("¡Asistencia registrada exitosamente!", 4000);
    
    // Usar setTimeout para evitar conflictos entre toasts
    setTimeout(() => {
      showInfo("Tu sesión ahora está bloqueada por seguridad", 3000);
    }, 1000);
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

// Componente de login mejorado con toasts
interface LoginFormProps {
  onLogin: (student: string) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [student, setStudent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { showError } = useToast();

  const validateStudentName = (name: string): boolean => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      const errorMsg = "El nombre debe tener al menos 2 caracteres";
      setError(errorMsg);
      showError(errorMsg);
      return false;
    }
    if (trimmedName.length > 50) {
      const errorMsg = "El nombre es demasiado largo (máximo 50 caracteres)";
      setError(errorMsg);
      showError(errorMsg);
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/.test(trimmedName)) {
      const errorMsg = "El nombre solo puede contener letras, espacios y puntos";
      setError(errorMsg);
      showError(errorMsg);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    
    if (!validateStudentName(student)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular una pequeña validación/delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(student.trim());
      logInfo("Login form submitted", { studentName: student.trim() });
    } catch (error) {
      logError("Login failed", error);
      const errorMsg = "Error al iniciar sesión. Intenta nuevamente.";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Iniciar Sesión - SBAS
        </h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Estudiante:
          </label>
          <input
            type="text"
            value={student}
            onChange={(e) => {
              setStudent(e.target.value);
              setError(""); // Limpiar error al escribir
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ej: Juan Pérez"
            required
            disabled={isLoading}
            maxLength={50}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !student.trim()}
          className={`w-full py-2 px-4 rounded-md transition flex items-center justify-center ${
            isLoading || !student.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </>
          ) : (
            "Ingresar"
          )}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          La fecha de la clase se detectará automáticamente
        </div>
      </form>
    </div>
  );
}
