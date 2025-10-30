import React, { useState, useEffect } from "react";
import HomeDashboard from "./components/HomeDashboard";
import ClaseDashboard from "./components/ClaseDashboard";

function App() {
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<{ date: string }[]>([]);

  // Cargar clases desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("prof_classes");
    if (stored) {
      setClasses(JSON.parse(stored));
    }
  }, []);

  // Guardar clases en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("prof_classes", JSON.stringify(classes));
  }, [classes]);

  const handleStartClass = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    setActiveClass(dateStr);
    setClasses(prev => [...prev, { date: dateStr }]);
  };

  const handleDeleteClass = (idx: number) => {
    setClasses(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSelectClass = (date: string) => {
    setActiveClass(date);
  };

  const handleBack = () => setActiveClass(null);

  if (activeClass) {
    return <ClaseDashboard date={activeClass} onBack={handleBack} />;
  }

  return (
    <HomeDashboard
      onStartClass={handleStartClass}
      classes={classes}
      onDeleteClass={handleDeleteClass}
      onSelectClass={handleSelectClass}
    />
  );
}

export default App;
