import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders teacher dashboard welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Bienvenida,/i);
  const nameElement = screen.getByText(/Loyda Alas/i);
  expect(welcomeElement).toBeInTheDocument();
  expect(nameElement).toBeInTheDocument();
});

test('renders system status indicator', () => {
  render(<App />);
  const statusElement = screen.getByText(/Sistema Activo/i);
  expect(statusElement).toBeInTheDocument();
});

test('renders class management section', () => {
  render(<App />);
  const managementElement = screen.getByText(/Gestión de Clases/i);
  expect(managementElement).toBeInTheDocument();
});

test('renders new class button', () => {
  render(<App />);
  const newClassButton = screen.getByText(/Nueva Clase/i);
  expect(newClassButton).toBeInTheDocument();
});
