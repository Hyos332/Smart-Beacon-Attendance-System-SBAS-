import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders student login header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Iniciar Sesión - SBAS/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders student name input field', () => {
  render(<App />);
  const nameLabel = screen.getByText(/Nombre de Estudiante:/i);
  expect(nameLabel).toBeInTheDocument();
});

test('renders login button', () => {
  render(<App />);
  const loginButton = screen.getByText(/Ingresar/i);
  expect(loginButton).toBeInTheDocument();
});

test('renders automatic date detection message', () => {
  render(<App />);
  const dateMessage = screen.getByText(/La fecha de la clase se detectará automáticamente/i);
  expect(dateMessage).toBeInTheDocument();
});
