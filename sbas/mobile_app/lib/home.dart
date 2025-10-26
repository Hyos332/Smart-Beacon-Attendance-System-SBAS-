import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('SBAS - Asistencia')),
      body: Center(
        child: Text('¡Bienvenido! Aquí podrás buscar beacons y registrar tu asistencia.'),
      ),
    );
  }
}