import { bootstrapApplication } from '@angular/platform-browser';
// Función que arranca la aplicación Angular

import { AppComponent } from './app/app.component';
// Componente raíz de la aplicación

import { provideRouter } from '@angular/router';
// Proveedor que activa el sistema de rutas

import { routes } from './app/app.routes';
// Importamos nuestras rutas configuradas

import { provideHttpClient } from '@angular/common/http';
// 👈 ESTE es el proveedor del HttpClient global

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // Activa el sistema de navegación Angular

    provideHttpClient()
    // 👈 Registra HttpClient en toda la app
    // Sin esto los servicios HTTP fallan con NullInjectorError
  ]
});
