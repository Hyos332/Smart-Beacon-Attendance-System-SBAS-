import React, { useState, useEffect } from "react";
import HomeDashboard from "./components/HomeDashboard";
import ClaseDashboard from "./components/ClaseDashboard";
import { ToastProvider } from "./hooks/useToast";

function App() {
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<{ date: string, name: string }[]>([]);

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

  const handleStartClass = (name: string, dateStr: string) => {
    setActiveClass(dateStr);
    setClasses(prev => {
      const exists = prev.some(c => c.date === dateStr);
      if (!exists) {
        return [...prev, { date: dateStr, name }];
      }
      return prev.map(c => c.date === dateStr ? { ...c, name } : c);
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
    const current = classes.find(c => c.date === activeClass);
    const currentName = current?.name || '';
    return (
      <ToastProvider>
        <ClaseDashboard date={activeClass} className={currentName} onBack={handleBack} />
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
