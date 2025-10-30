import React, { useEffect, useState } from "react";
import BeaconEmitter from "./BeaconEmitter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      attendance.map(a => ({
        ID: a.id,
        Estudiante: a.student_id,
        "Fecha/Hora": new Date(a.timestamp).toLocaleString(),
        Método: a.detection_method,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "asistencias.xlsx");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700 drop-shadow">
        Dashboard de Asistencia
      </h1>
      <BeaconEmitter />
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-700">
          Total asistencias: <span className="text-indigo-600 font-bold">{attendance.length}</span>
        </span>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
        >
          Exportar a Excel
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
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