import React, { useEffect, useState } from "react";

export default function AttendanceRegister({ studentName, classDate }: { studentName: string, classDate: string }) {
  const [status, setStatus] = useState<null | string>(null);
  const [beaconActive, setBeaconActive] = useState(false);

  useEffect(() => {
    const fetchBeaconStatus = async () => {
      const res = await fetch("/api/beacon/status");
      const data = await res.json();
      setBeaconActive(data.active && data.class_date === classDate);
    };
    fetchBeaconStatus();
    const interval = setInterval(fetchBeaconStatus, 3000);
    return () => clearInterval(interval);
  }, [classDate]);

  const handleRegister = async () => {
    if (!beaconActive) {
      setStatus("La clase aún no ha iniciado. Espera a que la profesora inicie la clase.");
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
    } else if (res.status === 409) {
      setStatus("⚠️ Ya registraste tu asistencia para esta clase.");
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
        className={`w-full px-4 py-2 rounded transition ${beaconActive ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        disabled={!beaconActive}
      >
        Registrar Asistencia
      </button>
      {status && <div className="mt-4 text-center">{status}</div>}
      {!beaconActive && (
        <div className="mt-4 text-center text-yellow-600 font-semibold">
          La clase aún no ha iniciado. Espera a que la profesora inicie la clase.
        </div>
      )}
    </div>
  );
}