// Modo de operación: "simulate" (default) o "real"
const BEACON_MODE = process.env.BEACON_MODE || "simulate";

let beaconActive = false;

// Simulación de beacon virtual
function startBeaconSim() {
  beaconActive = true;
  console.log("Beacon virtual simulado: activo");
}

// Emisión real BLE (requiere hardware, permisos y dependencias)
function startBeaconReal() {
  try {
    // Importación dinámica para evitar errores si no está instalado
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bleno = require("bleno");
    const BEACON_UUID = "aula-101-0000-0000-000000000000";

    bleno.on("stateChange", (state: string) => {
      if (state === "poweredOn") {
        bleno.startAdvertising("AULA_101", [BEACON_UUID], (err: any) => {
          if (err) {
            console.error("Error starting beacon:", err);
          } else {
            beaconActive = true;
            console.log("Beacon BLE real iniciado con UUID:", BEACON_UUID);
          }
        });
      } else {
        bleno.stopAdvertising();
        beaconActive = false;
      }
    });
  } catch (err) {
    console.error("No se pudo iniciar el beacon BLE real:", err);
    beaconActive = false;
  }
}

export function startBeacon() {
  if (BEACON_MODE === "real") {
    startBeaconReal();
  } else {
    startBeaconSim();
  }
}

export function isBeaconActive() {
  return beaconActive;
}