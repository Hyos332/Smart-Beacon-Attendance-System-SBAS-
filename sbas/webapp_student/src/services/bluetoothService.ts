// Extender la interfaz Navigator para incluir bluetooth
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
      getAvailability(): Promise<boolean>;
    };
  }

  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[];
    acceptAllDevices?: boolean;
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATT;
  }

  interface BluetoothRemoteGATT {
    connected: boolean;
    device: BluetoothDevice;
    connect(): Promise<BluetoothRemoteGATT>;
    disconnect(): void;
  }

  interface BluetoothLEScanFilter {
    services?: BluetoothServiceUUID[];
    name?: string;
    namePrefix?: string;
  }

  type BluetoothServiceUUID = number | string;
}

export class BluetoothService {
  private static BEACON_UUID = process.env.REACT_APP_BEACON_UUID || "aula-101-0000-0000-000000000000";
  private static NAME_PREFIX = process.env.REACT_APP_BEACON_NAME_PREFIX || undefined;
  
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

      const filters: BluetoothLEScanFilter[] = [];
      if (this.NAME_PREFIX) {
        filters.push({ namePrefix: this.NAME_PREFIX });
      }

      const device = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: filters.length === 0,
        filters: filters.length ? filters : undefined,
        optionalServices: [this.BEACON_UUID as unknown as BluetoothServiceUUID]
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
      
      await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true
      });
      
      return true;
    } catch (error) {
      console.warn("Usuario canceló permisos Bluetooth:", error);
      return false;
    }
  }
}