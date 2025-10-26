import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'registro_estudiante.dart';

void main() {
  runApp(MaterialApp(
    home: RegistroEstudiante(),
    // Puedes agregar rutas aquí si tienes más pantallas
  ));
}

class RegistroEstudiante extends StatelessWidget {
  const RegistroEstudiante({super.key});

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
                controller: TextEditingController(),
                decoration: const InputDecoration(
                  labelText: "ID de estudiante",
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text("Presiona para buscar beacon"),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Simulación para Windows/Web
                if (kIsWeb || Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
                  Future.delayed(const Duration(seconds: 2), () {
                    print("Simulación de beacon detectado");
                  });
                  return;
                }

                // BLE real para Android/iOS
                flutterReactiveBle.scanForDevices(
                  withServices: [Uuid.parse("12345678-1234-5678-1234-56789abcdef0")],
                  scanMode: ScanMode.lowLatency,
                ).listen((device) {
                  print("Beacon detectado: ${device.name}");
                }, onError: (err) {
                  print("Error al escanear: ${err}");
                });
              },
              child: const Text("Buscar Beacon"),
            ),
          ],
        ),
      ),
    );
  }
}
