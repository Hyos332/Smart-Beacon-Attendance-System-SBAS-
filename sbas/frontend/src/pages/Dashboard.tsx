import React, { useEffect, useState } from "react";

type Attendance = {
  id: string;
  studentId: string;
  beaconId: string;
  timestamp: string;
  Student?: {
    name: string;
    email: string;
  };
};

export default function Dashboard() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/attendance/all")
      .then((res) => res.json())
      .then((data) => {
        setAttendances(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Asistencia</h1>
      {loading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Estudiante</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Fecha/Hora</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((a) => (
              <tr key={a.id}>
                <td className="border px-4 py-2">{a.Student?.name || a.studentId}</td>
                <td className="border px-4 py-2">{a.Student?.email || "-"}</td>
                <td className="border px-4 py-2">{new Date(a.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}