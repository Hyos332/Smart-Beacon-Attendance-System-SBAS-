import React, { useState } from "react";

export default function StudentRegister({ onRegistered }: { onRegistered: (name: string) => void }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name) {
      setStatus("Por favor ingresa tu nombre.");
      return;
    }
    const res = await fetch("/api/students/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      localStorage.setItem("student_name", name);
      onRegistered(name);
    } else {
      setStatus("❌ Error al registrar.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl border border-indigo-100">
      <div className="flex flex-col items-center">
        <div className="bg-indigo-100 rounded-full p-4 mb-4 shadow">
          <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold mb-2 text-indigo-700 text-center drop-shadow">Registro de Estudiante</h1>
        <input
          type="text"
          placeholder="Ejemplo: juan.perez"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow transition mb-2"
        >
          Registrarse
        </button>
        {status && (
          <div className={`mt-4 text-center text-lg font-semibold ${status.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}