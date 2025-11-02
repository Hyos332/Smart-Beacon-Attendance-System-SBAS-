import React, { useEffect, useState } from "react";

type Attendance = {
  id: number;
  student_id: string;
  timestamp: string;
  detection_method: string;
};

export default function ClaseDashboard({ date, onBack }: { date: string, onBack: () => void }) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [beaconActive, setBeaconActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [date]);

  useEffect(() => {
    fetchBeaconStatus();
    const interval = setInterval(fetchBeaconStatus, 2000);
    return () => clearInterval(interval);
  }, [date]);

  const fetchAttendance = async () => {
    try {
      // USAR class_date en lugar de date
      const res = await fetch(`http://localhost:5000/api/attendance?class_date=${date}`);
      if (res.ok) {
        const data: Attendance[] = await res.json();
        console.log(`[FRONTEND] Loaded ${data.length} records for class ${date}:`, data);
        
        // Filtrar registros únicos por student_id
        const uniqueAttendanceMap = new Map<string, Attendance>();
        
        data.forEach((record: Attendance) => {
          const existing = uniqueAttendanceMap.get(record.student_id);
          if (!existing || new Date(record.timestamp) > new Date(existing.timestamp)) {
            uniqueAttendanceMap.set(record.student_id, record);
          }
        });
        
        const uniqueAttendance = Array.from(uniqueAttendanceMap.values())
          .sort((a: Attendance, b: Attendance) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        
        setAttendance(uniqueAttendance);
        setError(null);
      } else {
        throw new Error('Error al cargar asistencia');
      }
    } catch (error) {
      setError('Error de conexión al servidor');
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBeaconStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/beacon/status');
      if (res.ok) {
        const data = await res.json();
        setBeaconActive(data.active);
        setStatus(data.active ? 'Clase activa - Registrando asistencia' : 'Clase inactiva');
      }
    } catch (error) {
      console.error('Error fetching beacon status:', error);
    }
  };

  const handleStartClass = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/beacon/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_date: date }),
      });
      if (res.ok) {
        setBeaconActive(true);
        setStatus('Clase iniciada - Los estudiantes pueden registrar asistencia');
      }
    } catch (error) {
      console.error('Error starting class:', error);
    }
  };

  const handleStopClass = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/beacon/stop', {
        method: 'POST',
      });
      if (res.ok) {
        setBeaconActive(false);
        setStatus('Clase finalizada');
      }
    } catch (error) {
      console.error('Error stopping class:', error);
    }
  };

  // FUNCIONES DE LIMPIEZA ACTUALIZADAS
  const handleDeleteSelected = async () => {
    if (selectedRecords.size === 0) return;
    
    if (!window.confirm(`¿Estás segura de que quieres eliminar ${selectedRecords.size} registro(s) de asistencia?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const ids = Array.from(selectedRecords);
      const res = await fetch('http://localhost:5000/api/attendance/delete-multiple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        setSelectedRecords(new Set());
        fetchAttendance();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar registros');
      }
    } catch (error) {
      console.error('Error deleting records:', error);
      // Arreglar el error de TypeScript
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (attendance.length === 0) return;
    
    if (!window.confirm(`¿Estás segura de que quieres eliminar TODOS los ${attendance.length} registros de esta clase?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // USAR class_date en lugar de date
      const res = await fetch(`http://localhost:5000/api/attendance/clear?date=${date}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        setAttendance([]);
        setSelectedRecords(new Set());
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al limpiar registros');
      }
    } catch (error) {
      console.error('Error clearing all records:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (id: number, studentName: string) => {
    if (!window.confirm(`¿Eliminar el registro de asistencia de "${studentName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        fetchAttendance();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar registro');
      }
    } catch (error) {
      console.error('Error deleting single record:', error);
      // Arreglar el error de TypeScript
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectRecord = (id: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredAttendance.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredAttendance.map(record => record.id)));
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'ble':
        return (
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
        );
      case 'wifi':
        return (
          <div className="bg-green-100 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
    }
  };

  const filteredAttendance = attendance.filter(record =>
    record.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Estudiante', 'Hora de Registro', 'Método de Detección'];
    const csvContent = [
      headers.join(','),
      ...attendance.map(record => [
        record.student_id,
        formatTime(record.timestamp),
        record.detection_method.toUpperCase()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencia_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                title="Volver al inicio"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="bg-indigo-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Clase del {new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </h1>
                <p className="text-gray-600">
                  {formatDate(date)}
                </p>
              </div>
            </div>

            {/* Controles de clase */}
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg border ${
                beaconActive 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    beaconActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <span className="font-medium block">
                      {beaconActive ? 'Clase Activa' : 'Clase Inactiva'}
                    </span>
                    <span className="text-xs opacity-75">
                      Modo: {process.env.BEACON_MODE === 'real' ? 'BLE Real' : 'Simulado'}
                    </span>
                  </div>
                </div>
              </div>

              {beaconActive ? (
                <button
                  onClick={handleStopClass}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span>Finalizar Clase</span>
                </button>
              ) : (
                <button
                  onClick={handleStartClass}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span>Iniciar Clase</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes Únicos</p>
                <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vía Bluetooth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.filter(a => a.detection_method.toLowerCase() === 'ble').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vía WiFi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.filter(a => a.detection_method.toLowerCase() === 'wifi').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Entrada</p>
                <p className="text-lg font-bold text-gray-900">
                  {attendance.length > 0 ? formatTime(attendance[0].timestamp) : '--:--'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Asistencia */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-xl font-bold text-gray-900">Lista de Asistencia</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Buscador */}
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Botones de acción */}
                {attendance.length > 0 && (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
                    >
                      {selectedRecords.size === filteredAttendance.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </button>

                    {selectedRecords.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors text-sm flex items-center space-x-2"
                      >
                        {isDeleting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        )}
                        <span>Eliminar ({selectedRecords.size})</span>
                      </button>
                    )}

                    <button
                      onClick={handleDeleteAll}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors text-sm flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      <span>Limpiar Todo</span>
                    </button>

                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Exportar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando asistencia...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de conexión</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAttendance}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron estudiantes' : 'Aún no hay asistencia registrada'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con un término de búsqueda diferente' 
                  : beaconActive 
                    ? 'Los estudiantes podrán registrar su asistencia cuando estén cerca'
                    : 'Inicia la clase para que los estudiantes puedan registrar su asistencia'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRecords.size === filteredAttendance.length && filteredAttendance.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendance.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedRecords.has(record.id) ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRecords.has(record.id)}
                          onChange={() => handleSelectRecord(record.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {record.student_id.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.student_id}</div>
                            <div className="text-sm text-gray-500">Registro #{index + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatTime(record.timestamp)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMethodIcon(record.detection_method)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {record.detection_method.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSingle(record.id, record.student_id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 disabled:text-red-300 transition-colors"
                          title="Eliminar registro"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}