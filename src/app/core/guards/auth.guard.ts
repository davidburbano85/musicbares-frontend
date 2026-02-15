// Injectable permite que Angular pueda inyectar este guard como servicio
import { Injectable } from '@angular/core';

// CanActivate permite bloquear o permitir acceso a rutas
import { CanActivate, Router } from '@angular/router';

// Importamos el servicio de autenticación
// Usa la ruta que me pediste recordar
import { AuthService } from '../../core/servicios/auth.service';

// Decorador que registra el guard como servicio global
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  // Inyectamos el servicio de autenticación
  // y el router para poder redirigir
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Método que Angular ejecuta antes de entrar a una ruta protegida
  canActivate(): boolean {

    // Preguntamos al servicio si el usuario está logueado
    const estaLogueado = this.authService.estaAutenticado();

    // Si está logueado permitimos el acceso
    if (estaLogueado) {
      return true;
    }

    // Si NO está logueado lo enviamos al login
    this.router.navigate(['/login']);

    // Bloqueamos el acceso a la ruta
    return false;
  }
}

