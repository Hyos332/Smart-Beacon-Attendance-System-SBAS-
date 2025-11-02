import React, { useEffect, useState } from "react";

export default function AttendanceRegister({ 
  studentName, 
  classDate, 
  onAttendanceRegistered 
}: { 
  studentName: string, 
  classDate: string,
  onAttendanceRegistered: () => void 
}) {
  const [status, setStatus] = useState<null | string>(null);
  const [beaconActive, setBeaconActive] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    // Verificar si ya se registró asistencia al cargar el componente
    const checkExistingAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance/check?student_id=${studentName}&class_date=${classDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasAttendance) {
            setHasRegistered(true);
            setStatus("✅ Ya tienes asistencia registrada para esta clase.");
            onAttendanceRegistered();
          }
        }
      } catch (error) {
        console.error("Error checking existing attendance:", error);
      }
    };

    const fetchBeaconStatus = async () => {
      const res = await fetch("/api/beacon/status");
      const data = await res.json();
      setBeaconActive(data.active && data.class_date === classDate);
    };

    checkExistingAttendance();
    fetchBeaconStatus();
    const interval = setInterval(fetchBeaconStatus, 3000);
    return () => clearInterval(interval);
  }, [classDate, studentName, onAttendanceRegistered]);

  const handleRegister = async () => {
    if (!beaconActive) {
      setStatus("La clase aún no ha iniciado. Espera a que la profesora inicie la clase.");
      return;
    }

    if (hasRegistered) {
      setStatus("⚠️ Ya registraste tu asistencia para esta clase.");
      return;
    }

    const res = await fetch("/api/attendance/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentName,
        method: "BLE",
        class_date: classDate,
      }),
    });

    if (res.ok) {
      setStatus("✅ Asistencia registrada correctamente.");
      setHasRegistered(true);
      onAttendanceRegistered(); // Notificar al componente padre
      
      // Marcar en localStorage que este estudiante registró asistencia
      const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
      registeredStudents.push({ studentName, classDate, timestamp: Date.now() });
      localStorage.setItem('registeredStudents', JSON.stringify(registeredStudents));
      
    } else if (res.status === 409) {
      setStatus("⚠️ Ya registraste tu asistencia para esta clase.");
      setHasRegistered(true);
      onAttendanceRegistered();
    } else {
      setStatus("❌ Error al registrar asistencia.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">Registro de Asistencia</h1>
      <div className="mb-4 text-center">
        <span className="font-semibold">Estudiante:</span> {studentName}
      </div>
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
      {status && <div className="mt-4 text-center">{status}</div>}
      {!beaconActive && !hasRegistered && (
        <div className="mt-4 text-center text-yellow-600 font-semibold">
          La clase aún no ha iniciado. Espera a que la profesora inicie la clase.
        </div>
      )}
      {hasRegistered && (
        <div className="mt-4 text-center text-green-600 font-semibold">
          🔒 Sesión bloqueada por seguridad - No puedes cerrar sesión después de registrar asistencia
        </div>
      )}
    </div>
  );
}