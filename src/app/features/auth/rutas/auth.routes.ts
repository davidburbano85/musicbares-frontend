import { Routes } from '@angular/router';
import { LoginComponent } from '../paginas/login/login.component';

// Rutas propias de la feature Auth
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',          // URL que verá el usuario
    component: LoginComponent // Componente que se renderiza
  }
];
