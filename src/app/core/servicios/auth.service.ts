import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Respuesta que devuelve Supabase al iniciar sesión
 */
export interface RespuestaLogin {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * URL de autenticación Supabase
   */
  private urlAuth = 'https://kthypysefudciehungyg.supabase.co/auth/v1/token?grant_type=password';

  /**
   * Inyectamos HttpClient para llamadas HTTP
   */
  constructor(private http: HttpClient) { }

  /**
   * Envía credenciales a Supabase y recibe JWT
   */
  iniciarSesion(correo: string, clave: string): Observable<RespuestaLogin> {

    const body = {
      email: correo,
      password: clave
    };

    const headers = {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHlweXNlZnVkY2llaHVuZ3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIzMjEsImV4cCI6MjA4NTgxODMyMX0.ZbjjHEL0Ej91Qd8cTqxxcAqKUJJSGpIKtxZf7Odq07Y'
    };

    return this.http.post<RespuestaLogin>(
      this.urlAuth,
      body,
      { headers }
    );

  }

  // Método para registrar un usuario en Supabase
  registrar(email: string, password: string) {

    // Construimos el body exactamente como lo exige Supabase
    const body = {
      email: email,
      password: password
    };

    // Enviamos petición POST al endpoint de registro
    return this.http.post(
      'https://kthypysefudciehungyg.supabase.co/auth/v1/signup',

      body,

      {
        headers: {
          // Indicamos que enviamos JSON
          'Content-Type': 'application/json',

          // Clave pública de Supabase (anon key)
          //  aquí debes pegar TU clave real
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHlweXNlZnVkY2llaHVuZ3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIzMjEsImV4cCI6MjA4NTgxODMyMX0.ZbjjHEL0Ej91Qd8cTqxxcAqKUJJSGpIKtxZf7Odq07Y'
        }
      }
    );
  }

  // Método que verifica si existe sesión activa en Supabase
  estaAutenticado(): boolean {

    // Obtenemos la sesión almacenada por Supabase en el navegador
    // Supabase guarda la sesión en localStorage automáticamente
    const sesion = localStorage.getItem('sb-auth-token');

    // Si existe token devolvemos TRUE (usuario logueado)
    if (sesion) {
      return true;
    }

    // Si no existe token devolvemos FALSE (usuario no logueado)
    return false;
  }


}
