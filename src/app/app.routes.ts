import { Routes } from '@angular/router'; 
// Importamos el tipo Routes para definir las rutas de la app

import { LoginComponent } from './features/auth/paginas/login/login.component'; 
// Importamos el componente de login

import { RegistroComponent } from './features/auth/paginas/registro/registro.component'; 
// Importamos el componente de registro

import { AuthGuard } from './core/guards/auth.guard'; 
// Importamos nuestro guard de autenticación

// Definimos el arreglo de rutas principales
export const routes: Routes = [

  {
    path: 'login', 
    // Ruta pública para iniciar sesión

    component: LoginComponent
    // Componente que se mostrará en esta ruta
  },

  {
    path: 'registro', 
    // Ruta pública para crear cuenta

    component: RegistroComponent
    // Componente asociado a registro
  },

  {
    path: 'panel', 
    // Ruta protegida (solo usuarios autenticados)

    canActivate: [AuthGuard], 
    // Indicamos que esta ruta requiere pasar por el guard

    loadComponent: () =>
      import('./features/panel/panel.component')
        .then(m => m.PanelComponent)
    // Lazy load del panel principal del sistemaa
  },

  {
    path: '**', 
    // Ruta comodín para cualquier URL no existente

    redirectTo: 'login'
    // Redirige automáticamente al login
  }
];
