import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'registro_estudiante.dart';
import 'home.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  Future<bool> isRegistered() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('studentId') != null;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      routes: {
        '/home': (context) => HomeScreen(),
      },
      home: FutureBuilder<bool>(
        future: isRegistered(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return Scaffold(body: Center(child: CircularProgressIndicator()));
          return snapshot.data! ? HomeScreen() : RegistroEstudiante();
        },
      ),
    );
  }
}