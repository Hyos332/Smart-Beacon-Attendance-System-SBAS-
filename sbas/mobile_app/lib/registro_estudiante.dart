// Ejemplo básico de pantalla de registro en Flutter
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class RegistroEstudiante extends StatefulWidget {
  @override
  _RegistroEstudianteState createState() => _RegistroEstudianteState();
}

class _RegistroEstudianteState extends State<RegistroEstudiante> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  String? _error;

  Future<void> _registrar() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    if (name.length < 5) {
      setState(() => _error = "El nombre completo es requerido (mínimo 5 caracteres).");
      return;
    }
    if (!email.contains("@")) {
      setState(() => _error = "El email es requerido y debe ser válido.");
      return;
    }
    final response = await http.post(
      Uri.parse('http://localhost:3000/api/student/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email}),
    );
    if (response.statusCode == 200) {
      final student = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('studentId', student['id'].toString());
      // Puedes guardar también el nombre/email si lo necesitas
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      setState(() => _error = "Error al registrar estudiante.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Registro de Estudiante')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: InputDecoration(labelText: 'Nombre completo'),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            if (_error != null) ...[
              SizedBox(height: 8),
              Text(_error!, style: TextStyle(color: Colors.red)),
            ],
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _registrar,
              child: Text('Registrarse'),
            ),
          ],
        ),
      ),
    );
  }
}