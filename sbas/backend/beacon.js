const BEACON_MODE = process.env.BEACON_MODE || "simulate";
const BEACON_UUID = "aula-101-0000-0000-000000000000";

let beaconActive = false;

function startBeacon() {
  beaconActive = true;
  console.log("✅ Beacon virtual simulado: ACTIVO");
  console.log(`📡 Simulando UUID: ${BEACON_UUID}`);
  console.log(`🔧 Modo actual: ${BEACON_MODE}`);
}

function stopBeacon() {
  beaconActive = false;
  console.log("🔴 Beacon virtual simulado: DETENIDO");
}

function isBeaconActive() {
  return beaconActive;
}

function getBeaconInfo() {
  return {
    active: beaconActive,
    mode: "simulate",
    uuid: BEACON_UUID,
    bleAvailable: false
  };
}

module.exports = {
  startBeacon,
  stopBeacon,
  isBeaconActive,
  getBeaconInfo
};