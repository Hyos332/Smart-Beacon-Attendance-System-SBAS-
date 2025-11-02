export class BluetoothService {
  private static BEACON_UUID = "aula-101-0000-0000-000000000000";
  
  static async isBluetoothSupported(): Promise<boolean> {
    if (!navigator.bluetooth) {
      console.warn("Web Bluetooth API no soportada");
      return false;
    }
    return true;
  }
  
  static async detectBeacon(): Promise<boolean> {
    try {
      if (!await this.isBluetoothSupported()) {
        return false;
      }
      
      console.log("🔵 Iniciando detección de beacon...");
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.BEACON_UUID]
      });
      
      if (device) {
        console.log("🔵 Beacon detectado:", device.name || device.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error detectando beacon:", error);
      return false;
    }
  }
  
  static async requestBluetoothPermission(): Promise<boolean> {
    try {
      if (!await this.isBluetoothSupported()) {
        return false;
      }
      
      await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      
      return true;
    } catch (error) {
      console.warn("Usuario canceló permisos Bluetooth:", error);
      return false;
    }
  }
}