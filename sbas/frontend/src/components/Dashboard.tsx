import React, { useEffect, useState } from "react";
import BeaconEmitter from "../components/BeaconEmitter";

type Attendance = {
  id: number;
  student_id: string;
  timestamp: string;
  detection_method: string;
};

export default function Dashboard() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      setAttendance(data);
    };
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Asistencia</h1>
      <BeaconEmitter />
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Estudiante</th>
            <th className="border px-2 py-1">Fecha/Hora</th>
            <th className="border px-2 py-1">Método</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((a) => (
            <tr key={a.id}>
              <td className="border px-2 py-1">{a.id}</td>
              <td className="border px-2 py-1">{a.student_id}</td>
              <td className="border px-2 py-1">{new Date(a.timestamp).toLocaleString()}</td>
              <td className="border px-2 py-1">{a.detection_method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}