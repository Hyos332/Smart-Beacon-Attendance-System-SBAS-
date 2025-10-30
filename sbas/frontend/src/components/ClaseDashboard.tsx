import React, { useEffect } from "react";
import BeaconEmitter from "./BeaconEmitter";
// ...puedes reutilizar tu tabla de asistencias aquí...

export default function ClaseDashboard({ date, onBack }: { date: string, onBack: () => void }) {
  const [attendance, setAttendance] = React.useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await fetch(`/api/attendance?class_date=${encodeURIComponent(date)}`);
      const data = await res.json();
      setAttendance(data);
    };
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">&larr; Volver a inicio</button>
      <h1 className="text-2xl font-extrabold mb-4 text-indigo-700">Bienvenida a tu clase de {date}</h1>
      <BeaconEmitter />
      {/* Aquí tu tabla de asistencias */}
    </div>
  );
}