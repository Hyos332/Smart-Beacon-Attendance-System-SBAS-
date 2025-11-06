import React, { useState, useEffect } from "react";
import HomeDashboard from "./components/HomeDashboard";
import ClaseDashboard from "./components/ClaseDashboard";
import { ToastProvider } from "./hooks/useToast";

function App() {
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<{ date: string }[]>([]);

  // Cargar clases desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("prof_classes");
    if (stored) {
      try {
        const parsedClasses = JSON.parse(stored);
        setClasses(parsedClasses);
        
        // Restaurar clase activa si existe
        const activeStored = localStorage.getItem("active_class");
        if (activeStored) {
          setActiveClass(activeStored);
        }
      } catch (error) {
        console.error('Error loading stored classes:', error);
        setClasses([]);
      }
    }
  }, []);

  // Guardar clases en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("prof_classes", JSON.stringify(classes));
  }, [classes]);

  // Guardar clase activa
  useEffect(() => {
    if (activeClass) {
      localStorage.setItem("active_class", activeClass);
    } else {
      localStorage.removeItem("active_class");
    }
  }, [activeClass]);

  const handleStartClass = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setActiveClass(dateStr);
    
    // Solo agregar si no existe ya
    setClasses(prev => {
      const exists = prev.some(c => c.date === dateStr);
      if (!exists) {
        return [...prev, { date: dateStr }];
      }
      return prev;
    });
  };

  const handleDeleteClass = (idx: number) => {
    setClasses(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSelectClass = (date: string) => {
    setActiveClass(date);
  };

  const handleBack = () => setActiveClass(null);

  if (activeClass) {
    return (
      <ToastProvider>
        <ClaseDashboard date={activeClass} onBack={handleBack} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <HomeDashboard
        onStartClass={handleStartClass}
        classes={classes}
        onDeleteClass={handleDeleteClass}
        onSelectClass={handleSelectClass}
      />
    </ToastProvider>
  );
}

export default App;
