import React from "react";

interface HeaderProps {
  studentName: string;
  canLogout: boolean;
  onLogout: () => void;
}

export default function Header({ studentName, canLogout, onLogout }: HeaderProps) {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">SBAS - Sistema de Asistencia</h1>
          <p className="text-indigo-200">Bienvenido, {studentName}</p>
        </div>
        <div className="flex items-center gap-4">
          {canLogout ? (
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
            >
              Cerrar Sesión
            </button>
          ) : (
            <span className="text-indigo-200 text-sm">
              🔒 Sesión bloqueada
            </span>
          )}
        </div>
      </div>
    </header>
  );
}