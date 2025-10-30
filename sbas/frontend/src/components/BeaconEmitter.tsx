import React, { useState } from "react";

export default function BeaconEmitter() {
  const [active, setActive] = useState(false);

  const startBeacon = async () => {
    const res = await fetch("/api/beacon/start", { method: "POST" });
    if (res.ok) setActive(true);
  };

  // Consulta el estado del beacon (opcional)
  // useEffect(() => { ... }, []);

  return (
    <div className="mb-4">
      <button
        className={`px-4 py-2 rounded ${active ? "bg-green-500" : "bg-blue-500"} text-white`}
        onClick={startBeacon}
        disabled={active}
      >
        {active ? "Clase en curso (beacon activo)" : "Iniciar Clase"}
      </button>
    </div>
  );
}