import React, { useEffect, useState } from "react";
import BeaconEmitter from "./BeaconEmitter";

type Attendance = {
  id: number;
  student_id: string;
  timestamp: string;
  detection_method: string;
};

export default function ClaseDashboard({ date, onBack }: { date: string, onBack: () => void }) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [beaconActive, setBeaconActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    console.log("[ClaseDashboard] Consultando asistencias para la clase:", date);
    const fetchAttendance = async () => {
      const res = await fetch(`/api/attendance?class_date=${encodeURIComponent(date)}`);
      const data = await res.json();
      setAttendance(data);
    };
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [date]);

  // NUEVO: Consultar estado del beacon
  useEffect(() => {
    const fetchBeaconStatus = async () => {
      const res = await fetch("/api/beacon/status");
      const data = await res.json();
      setBeaconActive(data.active && data.class_date === date);
    };
    fetchBeaconStatus();
    const interval = setInterval(fetchBeaconStatus, 3000);
    return () => clearInterval(interval);
  }, [date]);

  // NUEVO: Función para iniciar clase (emitir beacon)
  const handleStartClass = async () => {
    setStatus(null);
    try {
      console.log("[ClaseDashboard] Iniciando clase con fecha:", date);
      const res = await fetch("/api/beacon/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_date: date }),
      });
      if (!res.ok) {
        setStatus("❌ Error al iniciar el beacon.");
        return;
      }
      setBeaconActive(true);
      setStatus("✅ Clase iniciada correctamente.");
    } catch (err) {
      setStatus("❌ Error al iniciar el beacon.");
    }
  };

  const handleResetAttendance = async () => {
    if (!window.confirm("¿Estás segura de que quieres eliminar todos los registros de esta clase?")) return;
    console.log("[ClaseDashboard] Reseteando registros para la clase:", date);
    await fetch(`/api/attendance/reset?class_date=${encodeURIComponent(date)}`, {
      method: "DELETE",
    });
    // Refresca la tabla
    const res = await fetch(`/api/attendance?class_date=${encodeURIComponent(date)}`);
    const data = await res.json();
    setAttendance(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-indigo-600 hover:underline">&larr; Volver a inicio</button>
        <div className="flex gap-2">
          <button
            onClick={handleStartClass}
            disabled={beaconActive}
            className={`px-4 py-2 rounded font-bold shadow transition text-white ${
              beaconActive
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {beaconActive ? "Clase en curso" : "Iniciar clase"}
          </button>
          <button
            onClick={handleResetAttendance}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
          >
            Resetear registros
          </button>
        </div>
      </div>
      {status && <div className="mb-2 text-center">{status}</div>}
      <h1 className="text-2xl font-extrabold mb-4 text-indigo-700">Bienvenida a tu clase de {date}</h1>
      <BeaconEmitter />
      <div className="overflow-x-auto rounded-lg shadow mt-6">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-indigo-100">
              <th className="px-4 py-2 text-left font-bold text-indigo-700">ID</th>
              <th className="px-4 py-2 text-left font-bold text-indigo-700">Estudiante</th>
              <th className="px-4 py-2 text-left font-bold text-indigo-700">Fecha/Hora</th>
              <th className="px-4 py-2 text-left font-bold text-indigo-700">Método</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No hay asistencias registradas aún.
                </td>
              </tr>
            ) : (
              attendance.map((a) => (
                <tr key={a.id} className="hover:bg-indigo-50 transition">
                  <td className="px-4 py-2 border-b">{a.id}</td>
                  <td className="px-4 py-2 border-b">{a.student_id}</td>
                  <td className="px-4 py-2 border-b">
                    {new Date(a.timestamp).toLocaleDateString()}{" "}
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <span
                      className={
                        a.detection_method === "BLE"
                          ? "bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold"
                          : "bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold"
                      }
                    >
                      {a.detection_method}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}