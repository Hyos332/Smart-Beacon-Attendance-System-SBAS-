import React, { useState } from "react";
import { logInfo, logError } from "../utils/errorHandler";

interface HeaderProps {
  studentName: string;
  canLogout: boolean;
  onLogout: () => void;
}

export default function Header({ studentName, canLogout, onLogout }: HeaderProps) {
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const handleLogoutClick = (): void => {
    if (!canLogout) {
      setShowLogoutModal(true);
      logError("Logout blocked - showing security modal");
      return;
    }
    
    // Mostrar confirmación antes de cerrar sesión
    if (window.confirm("¿Estás seguro que quieres cerrar sesión?")) {
      onLogout();
      logInfo("User confirmed logout");
    } else {
      logInfo("User cancelled logout");
    }
  };

  const closeModal = (): void => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo y título */}
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">SBAS</h1>
                <p className="text-indigo-200 text-sm">Sistema de Asistencia</p>
              </div>
            </div>

            {/* Info del usuario y acciones */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-indigo-200 text-sm">Bienvenido</p>
                <p className="font-semibold">{studentName}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {canLogout ? (
                  <button
                    onClick={handleLogoutClick}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium"
                    title="Cerrar Sesión"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLogoutClick}
                    className="bg-gray-400 text-gray-200 px-4 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2 font-medium"
                    title="Sesión bloqueada por seguridad"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                    <span className="hidden sm:inline">🔒 Bloqueado</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mostrar nombre en móvil */}
          <div className="sm:hidden mt-2 text-center">
            <p className="text-indigo-200 text-sm">
              Bienvenido, <span className="font-semibold text-white">{studentName}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Modal de seguridad */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Sesión Bloqueada
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              No puedes cerrar sesión después de registrar tu asistencia. 
              Esta medida previene el fraude de asistencia y garantiza la 
              integridad del sistema.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <svg 
                  className="w-5 h-5 text-amber-600 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-amber-800 text-sm font-medium">
                  Tu asistencia ya fue registrada de forma segura
                </p>
              </div>
            </div>
            
            <button
              onClick={closeModal}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}