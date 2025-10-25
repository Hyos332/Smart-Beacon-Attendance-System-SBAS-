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
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/attendance/all")
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((a: any) => ({
          ...a,
          Student: typeof a.Student === "string" ? JSON.parse(a.Student) : a.Student,
        }));
        setAttendances(parsed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtrado por nombre o email
  const filtered = attendances.filter((a) => {
    const name = a.Student?.name?.toLowerCase() || "";
    const email = a.Student?.email?.toLowerCase() || "";
    const s = search.toLowerCase();
    return name.includes(s) || email.includes(s);
  });

  // Paginación
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function exportToCSV() {
    const headers = ["Estudiante", "Email", "Fecha/Hora"];
    const rows = filtered.map((a) => [
      a.Student?.name || a.studentId,
      a.Student?.email || "-",
      new Date(a.timestamp).toLocaleString(),
    ]);
    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) =>
              `"${String(cell).replace(/"/g, '""')}"`
            )
            .join(",")
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "asistencias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Asistencia</h1>
      <input
        type="text"
        placeholder="Buscar estudiante o email..."
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // Reinicia a la primera página al buscar
        }}
      />
      <button
        className="ml-4 mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={exportToCSV}
      >
        Exportar a Excel
      </button>
      {loading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : (
        <>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Estudiante</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) => (
                <tr key={a.id}>
                  <td className="border px-4 py-2">{a.Student?.name || a.studentId}</td>
                  <td className="border px-4 py-2">{a.Student?.email || "-"}</td>
                  <td className="border px-4 py-2">{new Date(a.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Controles de paginación */}
          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}                       