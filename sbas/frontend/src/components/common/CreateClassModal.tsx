import React, { useEffect, useMemo, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    }
    setIsVisible(false);
  }, [open]);

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
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
      <div className={`absolute inset-0 bg-black/30 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`} onClick={onClose} />
      <div className={`relative w-full max-w-lg mx-4 transform transition-all duration-200 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'}`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nueva Clase</h3>
                <p className="text-sm text-gray-600">Completa los datos para crear la clase.</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la clase</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9 6 9-6-9-4-9 4z" /></svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="p. ej. Matemáticas - Grupo A"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3h8v4M5 11h14M7 15h10m-9 4h8" /></svg>
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Se prellena con la fecha de hoy, puedes editarla.</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
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
      </div>

    </div>
  );
};

export default CreateClassModal;


