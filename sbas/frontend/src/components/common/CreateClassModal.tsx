import React, { useMemo, useState } from "react";

interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; date: string }) => void;
}

const getToday = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const CreateClassModal: React.FC<CreateClassModalProps> = ({ open, onClose, onCreate }) => {
  const defaultDate = useMemo(() => getToday(), []);
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>(defaultDate);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const canSubmit = name.trim().length >= 3 && /\d{4}-\d{2}-\d{2}/.test(date);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      onCreate({ name: name.trim(), date });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Nueva Clase</h3>
        <p className="text-sm text-gray-600 mt-1">Completa los datos para crear la clase.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la clase</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="p. ej. Matemáticas - Grupo A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Se prellena con la fecha de hoy, puedes editarla.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${(!canSubmit || submitting) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {submitting ? (
              <span className="inline-flex items-center">
                <span className="h-4 w-4 mr-2 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                Creando…
              </span>
            ) : 'Crear y abrir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;


