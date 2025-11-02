import React, { useEffect, useState } from "react";

export default function AttendanceRegister({ 
  studentName, 
  onAttendanceRegistered 
}: { 
  studentName: string, 
  onAttendanceRegistered: () => void 
}) {
  const [status, setStatus] = useState<null | string>(null);
  const [beaconActive, setBeaconActive] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [activeClass, setActiveClass] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance/check?student_id=${studentName}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasAttendance) {
            setHasRegistered(true);
            setStatus("✅ Ya tienes asistencia registrada para esta clase.");
            onAttendanceRegistered();
          }
          setActiveClass(data.activeClass);
        }
      } catch (error) {
        console.error("Error checking existing attendance:", error);
      }
    };

    const fetchBeaconStatus = async () => {
      try {
        const res = await fetch("/api/beacon/status");
        const data = await res.json();
        setBeaconActive(data.active);
        setActiveClass(data.class_date);
      } catch (error) {
        console.error("Error fetching beacon status:", error);
      }
    };

    checkExistingAttendance();
    fetchBeaconStatus();
    const interval = setInterval(fetchBeaconStatus, 3000);
    return () => clearInterval(interval);
  }, [studentName, onAttendanceRegistered]);

  const handleRegister = async () => {
    if (!beaconActive) {
      setStatus("❌ La clase aún no ha iniciado. Espera a que la profesora inicie la clase.");
      return;
    }

    if (hasRegistered) {
      setStatus("⚠️ Ya registraste tu asistencia para esta clase.");
      return;
    }

    try {
      console.log("[FRONTEND] Enviando registro:", {
        student_id: studentName,
        method: "BLE"
      });

      const res = await fetch("http://localhost:5000/api/attendance/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentName,
          method: "BLE"
        }),
      });

      console.log("[FRONTEND] Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        setStatus(`✅ Asistencia registrada correctamente para la clase del ${data.class_date}.`);
        setHasRegistered(true);
        onAttendanceRegistered();
        
        // Marcar en localStorage que este estudiante registró asistencia
        const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
        registeredStudents.push({ 
          studentName, 
          classDate: data.class_date, 
          timestamp: Date.now() 
        });
        localStorage.setItem('registeredStudents', JSON.stringify(registeredStudents));
        
      } else if (res.status === 409) {
        setStatus("⚠️ Ya registraste tu asistencia para esta clase.");
        setHasRegistered(true);
        onAttendanceRegistered();
      } else {
        const errorData = await res.json();
        console.error("[FRONTEND] Error response:", errorData);
        setStatus(`❌ ${errorData.error || "Error al registrar asistencia."}`);
      }
    } catch (error) {
      console.error("[FRONTEND] Network error:", error);
      setStatus("❌ Error de conexión. Intenta nuevamente.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">
        Registro de Asistencia
      </h1>
      
      <div className="mb-4 text-center">
        <span className="font-semibold">Estudiante:</span> {studentName}
      </div>
      
      {activeClass && (
        <div className="mb-4 text-center text-sm text-gray-600">
          <span className="font-medium">Clase activa:</span> {activeClass}
        </div>
      )}
      
      <button
        onClick={handleRegister}
        className={`w-full px-4 py-2 rounded transition ${
          beaconActive && !hasRegistered
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!beaconActive || hasRegistered}
      >
        {hasRegistered ? "Asistencia Registrada" : "Registrar Asistencia"}
      </button>
      
      {status && (
        <div className="mt-4 text-center text-sm">{status}</div>
      )}
      
      {!beaconActive && !hasRegistered && (
        <div className="mt-4 text-center text-yellow-600 font-semibold">
          ⏳ Esperando que la profesora inicie la clase...
        </div>
      )}
      
      {hasRegistered && (
        <div className="mt-4 text-center text-green-600 font-semibold text-sm">
          🔒 Sesión bloqueada por seguridad - No puedes cerrar sesión después de registrar asistencia
        </div>
      )}
    </div>
  );
}