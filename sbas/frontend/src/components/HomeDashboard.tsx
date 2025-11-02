import React from "react";

export default function HomeDashboard({
  onStartClass,
  classes,
  onDeleteClass,
  onSelectClass,
}: {
  onStartClass: () => void;
  classes: { date: string }[];
  onDeleteClass: (idx: number) => void;
  onSelectClass: (date: string) => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-10 pt-10 pb-4">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 text-left">Bienvenida, Loyda Alas</h1>
        <p className="text-gray-600 text-lg text-left">
          Gestiona la asistencia de tus clases usando tecnología beacon y Wi-Fi.
        </p>
      </header>

      {/* Clases */}
      <main className="max-w-5xl mx-auto mt-6 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-700 text-left">Tus clases</h2>
          <button
            onClick={onStartClass}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg transition-transform hover:scale-105 font-semibold"
          >
            + Nueva Clase
          </button>
        </div>
        <div className="flex flex-row flex-wrap gap-6">
          {classes.length === 0 && (
            <div className="text-gray-400 text-lg">
              Aún no has creado ninguna clase. Haz clic en "Nueva Clase" para empezar.
            </div>
          )}
          {classes.map((clase, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between items-center bg-white rounded-2xl p-6 shadow border border-indigo-100 transition-transform hover:scale-105 hover:shadow-xl w-56 h-56 cursor-pointer group"
              onClick={() => onSelectClass(clase.date)}
              tabIndex={0}
              title="Ver registro de esta clase"
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDeleteClass(idx);
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
                title="Eliminar clase"
              >
                {/* Basurita SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
              <span className="font-semibold text-indigo-700 text-lg mb-2 text-center group-hover:underline">
                Asistencia clase<br />{clase.date}
              </span>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-base font-semibold transition mt-auto"
                onClick={e => e.stopPropagation()}
              >
                Exportar Excel
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}