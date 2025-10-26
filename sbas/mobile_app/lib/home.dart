import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _mensaje;
  bool _loading = false;

  Future<void> registrarAsistencia() async {
    setState(() {
      _loading = true;
      _mensaje = null;
    });

    final prefs = await SharedPreferences.getInstance();
    final studentId = prefs.getString('studentId');
    if (studentId == null) {
      setState(() {
        _mensaje = "No se encontró el ID del estudiante.";
        _loading = false;
      });
      return;
    }

    // Simula un UUID de beacon (en móvil usarías el real)
    final beaconUuid = "123e4567-e89b-12d3-a456-426614174000";

    final response = await http.post(
      Uri.parse('http://localhost:3000/api/attendance'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'studentId': studentId, // <-- debe ser el UUID del estudiante
        'beaconUuid': beaconUuid, // <-- debe ser el UUID del beacon
      }),
    );

    if (response.statusCode == 200) {
      setState(() {
        _mensaje = "¡Asistencia registrada correctamente!";
        _loading = false;
      });
    } else {
      setState(() {
        _mensaje = "Error al registrar asistencia.";
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('SBAS - Asistencia')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('¡Bienvenido! Aquí podrás buscar beacons y registrar tu asistencia.'),
            SizedBox(height: 32),
            ElevatedButton(
              onPressed: _loading ? null : registrarAsistencia,
              child: _loading ? CircularProgressIndicator() : Text('Registrar Asistencia'),
            ),
            if (_mensaje != null) ...[
              SizedBox(height: 16),
              Text(_mensaje!, style: TextStyle(color: _mensaje!.contains("Error") ? Colors.red : Colors.green)),
            ]
          ],
        ),
      ),
    );
  }
}