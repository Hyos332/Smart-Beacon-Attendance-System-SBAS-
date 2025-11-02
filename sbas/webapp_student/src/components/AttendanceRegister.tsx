import React, { useEffect, useState, useRef } from "react";
import { API_CONFIG, POLLING_INTERVALS, LOCAL_STORAGE_KEYS } from "../config/api";
import { BeaconStatus, AttendanceCheckResponse, AttendanceRegisterResponse, RegisteredStudent } from "../types/attendance";
import { handleApiError, logInfo, logError } from "../utils/errorHandler";
import { useToast } from "../hooks/useToast";

export default function AttendanceRegister({ 
  studentName, 
  onAttendanceRegistered 
}: { 
  studentName: string, 
  onAttendanceRegistered: () => void 
}) {
  const [beaconActive, setBeaconActive] = useState<boolean>(false);
  const [hasRegistered, setHasRegistered] = useState<boolean>(false);
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Usar refs para evitar bucles infinitos y notificaciones repetidas
  const hasInitialized = useRef<boolean>(false);
  const hasNotifiedAttendance = useRef<boolean>(false);
  const hasNotifiedClassStart = useRef<boolean>(false);
  const hasNotifiedClassEnd = useRef<boolean>(false);
  const previousBeaconState = useRef<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  useEffect(() => {
    const checkExistingAttendance = async (): Promise<void> => {
      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ATTENDANCE.CHECK}?student_id=${encodeURIComponent(studentName)}`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data: AttendanceCheckResponse = await res.json();
          if (data.hasAttendance && !hasRegistered) {
            setHasRegistered(true);
            setActiveClass(data.activeClass);
            
            // Solo notificar y llamar callback UNA VEZ
            if (!hasNotifiedAttendance.current) {
              showInfo("Ya tienes asistencia registrada para esta clase", 3000);
              onAttendanceRegistered();
              hasNotifiedAttendance.current = true;
              logInfo("Existing attendance found and notified", { studentName });
            }
          } else {
            setActiveClass(data.activeClass);
          }
          setConnectionStatus('connected');
          
          if (!hasInitialized.current) {
            logInfo("Attendance check completed", { studentName, hasAttendance: data.hasAttendance });
          }
        } else {
          setConnectionStatus('disconnected');
          if (!hasInitialized.current) {
            showError("Error al verificar asistencia existente");
          }
        }
      } catch (error) {
        const errorMsg = handleApiError(error, "Check Attendance");
        logError("Failed to check existing attendance", error);
        setConnectionStatus('disconnected');
        if (!hasInitialized.current) {
          showError(`Error de conexión: ${errorMsg}`);
        }
      }
    };

    const fetchBeaconStatus = async (): Promise<void> => {
      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BEACON.STATUS}`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data: BeaconStatus = await res.json();
          
          // Solo notificar cambios REALES de estado y solo UNA VEZ por cambio
          if (hasInitialized.current && previousBeaconState.current !== null) {
            const wasActive = previousBeaconState.current;
            const isNowActive = data.active;
            
            // Clase se inició (de false a true) y no se ha notificado
            if (!wasActive && isNowActive && !hasNotifiedClassStart.current && data.class_date) {
              showSuccess(`¡Clase iniciada! Puedes registrar tu asistencia para ${data.class_date}`, 4000);
              hasNotifiedClassStart.current = true;
              hasNotifiedClassEnd.current = false; // Reset para permitir notificación de fin
            }
            // Clase terminó (de true a false) y no se ha notificado
            else if (wasActive && !isNowActive && !hasNotifiedClassEnd.current) {
              showWarning("La clase ha finalizado. No se pueden registrar más asistencias", 4000);
              hasNotifiedClassEnd.current = true;
              hasNotifiedClassStart.current = false; // Reset para permitir notificación de inicio
            }
          }
          
          // Actualizar estados
          previousBeaconState.current = data.active;
          setBeaconActive(data.active);
          setActiveClass(data.class_date);
          setConnectionStatus('connected');
          
          if (!hasInitialized.current) {
            logInfo("Beacon status updated", { active: data.active, class_date: data.class_date });
          }
        } else {
          setConnectionStatus('disconnected');
          setBeaconActive(false);
        }
      } catch (error) {
        if (!hasInitialized.current) {
          logError("Failed to fetch beacon status", error);
        }
        setConnectionStatus('disconnected');
        setBeaconActive(false);
      }
    };

    // Ejecutar solo una vez al inicio
    if (!hasInitialized.current) {
      checkExistingAttendance();
      fetchBeaconStatus();
      hasInitialized.current = true;
    }
    
    // Configurar polling solo para beacon status
    intervalRef.current = setInterval(() => {
      if (hasInitialized.current) {
        fetchBeaconStatus();
      }
    }, POLLING_INTERVALS.BEACON_STATUS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [studentName]); // Solo dependencia de studentName

  const handleRegister = async (): Promise<void> => {
    if (!beaconActive) {
      showWarning("La clase aún no ha iniciado. Espera a que la profesora inicie la clase");
      return;
    }

    if (hasRegistered) {
      showInfo("Ya registraste tu asistencia para esta clase");
      return;
    }

    if (connectionStatus === 'disconnected') {
      showError("Sin conexión al servidor. Verifica tu conexión a internet");
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        student_id: studentName,
        method: "BLE" as const
      };

      logInfo("Sending attendance registration", requestData);
      showInfo("Registrando asistencia...", 2000);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ATTENDANCE.REGISTER}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        const data: AttendanceRegisterResponse = await res.json();
        setHasRegistered(true);
        
        // Guardar en localStorage
        const registeredStudents = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_STUDENTS) || '[]'
        );
        const newRecord: RegisteredStudent = { 
          studentName, 
          classDate: data.class_date, 
          timestamp: Date.now() 
        };
        registeredStudents.push(newRecord);
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.REGISTERED_STUDENTS, 
          JSON.stringify(registeredStudents)
        );
        
        // Solo notificar y llamar callback una vez
        if (!hasNotifiedAttendance.current) {
          onAttendanceRegistered();
          hasNotifiedAttendance.current = true;
          showSuccess(`¡Asistencia registrada exitosamente para la clase del ${data.class_date}!`, 5000);
          logInfo("Attendance registered successfully", { studentName, class_date: data.class_date });
        }
        
      } else if (res.status === 409) {
        setHasRegistered(true);
        if (!hasNotifiedAttendance.current) {
          onAttendanceRegistered();
          hasNotifiedAttendance.current = true;
          showWarning("Ya registraste tu asistencia para esta clase");
        }
      } else {
        const errorData = await res.json();
        const errorMsg = errorData.error || "Error al registrar asistencia";
        logError("Registration failed", errorData);
        showError(errorMsg);
      }
    } catch (error) {
      const errorMsg = handleApiError(error, "Register Attendance");
      showError(`Error de conexión: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Conectado
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center text-red-600 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Sin conexión
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center text-yellow-600 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Verificando...
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    if (hasRegistered) {
      return (
        <div className="text-center text-green-600 font-semibold text-sm bg-green-50 border border-green-200 rounded-lg p-3">
          🔒 Asistencia registrada - Sesión bloqueada por seguridad
        </div>
      );
    }

    if (!beaconActive) {
      return (
        <div className="text-center text-yellow-600 font-semibold bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          ⏳ Esperando que la profesora inicie la clase...
        </div>
      );
    }

    return (
      <div className="text-center text-blue-600 font-semibold bg-blue-50 border border-blue-200 rounded-lg p-3">
        ✅ Clase activa - Puedes registrar tu asistencia
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2 text-indigo-700">
          Registro de Asistencia
        </h1>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span><strong>Estudiante:</strong> {studentName}</span>
          {getConnectionIndicator()}
        </div>
      </div>
      
      {activeClass && (
        <div className="mb-4 text-center text-sm bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <span className="font-medium text-indigo-800">Clase activa:</span>
          <div className="font-bold text-indigo-900">{activeClass}</div>
        </div>
      )}
      
      <button
        onClick={handleRegister}
        disabled={!beaconActive || hasRegistered || isLoading || connectionStatus === 'disconnected'}
        className={`w-full px-4 py-3 rounded-lg transition flex items-center justify-center font-medium ${
          beaconActive && !hasRegistered && !isLoading && connectionStatus === 'connected'
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Registrando asistencia...
          </>
        ) : hasRegistered ? (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Asistencia Registrada
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Registrar Asistencia
          </>
        )}
      </button>
      
      <div className="mt-4">
        {getStatusMessage()}
      </div>
    </div>
  );
}