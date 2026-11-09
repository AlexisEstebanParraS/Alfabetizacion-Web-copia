import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { cargarPreferencias } from './services/preferencias';

// Primero se aplica el tamaño de letra guardado, así la primera pantalla ya aparece como la eligió el usuario
cargarPreferencias();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
