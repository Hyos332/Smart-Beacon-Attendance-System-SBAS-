import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SBAS BLE Scanner',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const BleScannerPage(),
    );
  }
}

class BleScannerPage extends StatefulWidget {
  const BleScannerPage({super.key});

  @override
  State<BleScannerPage> createState() => _BleScannerPageState();
}

class _BleScannerPageState extends State<BleScannerPage> {
  final flutterReactiveBle = FlutterReactiveBle();
  final String targetUuid = "12345678-1234-5678-1234-56789abcdef0";
  DiscoveredDevice? foundDevice;
  bool scanning = false;
  final TextEditingController studentIdController = TextEditingController();

  void startScan() {
    setState(() {
      scanning = true;
      foundDevice = null;
    });

    // Simulación para Windows/Web
    if (kIsWeb || Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      Future.delayed(const Duration(seconds: 2), () {
        setState(() {
          foundDevice = DiscoveredDevice(
            id: "SIMULATED_ID",
            name: "Simulated Beacon",
            serviceUuids: [targetUuid],
            manufacturerData: const [],
            rssi: -50,
            serviceData: const {},
            txPowerLevel: null,
            connectable: false,
            type: DeviceType.unknown,
          );
          scanning = false;
        });
      });
      return;
    }

    // BLE real para Android/iOS
    flutterReactiveBle.scanForDevices(
      withServices: [Uuid.parse(targetUuid)],
      scanMode: ScanMode.lowLatency,
    ).listen((device) {
      setState(() {
        foundDevice = device;
        scanning = false;
      });
    }, onError: (err) {
      setState(() {
        scanning = false;
      });
    });
  }

  Future<void> sendAttendance() async {
    final studentId = studentIdController.text.trim();
    const beaconId = "b70e7558-3dcc-4695-a663-70881a53ede3";
    final timestamp = DateTime.now().toUtc().toIso8601String();

    if (studentId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Por favor, ingresa tu ID de estudiante")),
      );
      return;
    }

    final url = Uri.parse("http://localhost:3000/api/attendance");
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "studentId": studentId,
        "beaconId": beaconId,
        "timestamp": timestamp,
      }),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("¡Asistencia enviada!")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error al enviar asistencia: ${response.body}")),
      );
    }
  }

  @override
  void dispose() {
    flutterReactiveBle.deinitialize();
    studentIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SBAS BLE Scanner')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: TextField(
                controller: studentIdController,
                decoration: const InputDecoration(
                  labelText: "ID de estudiante",
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 20),
            if (foundDevice != null)
              Column(
                children: [
                  const Text("¡Beacon detectado!"),
                  Text("Nombre: ${foundDevice!.name}"),
                  Text("ID: ${foundDevice!.id}"),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: sendAttendance,
                    child: const Text("Enviar Asistencia"),
                  ),
                ],
              )
            else
              Text(scanning ? "Buscando beacon..." : "Presiona para buscar beacon"),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: scanning ? null : startScan,
              child: const Text("Buscar Beacon"),
            ),
          ],
        ),
      ),
    );
  }
}
