import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Respuesta que devuelve Supabase al iniciar sesión
 */
export interface RespuestaLogin {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}
//Interfaz para almacenar los datos completos del usuario
export interface UsuarioReal {
  idUsuario: number;
  authUserId: string;
  nombreCompleto: string;
  correoElectronico: string;
  fechaCreacion: string;
  estado: boolean;
}
export interface BarUsuario {
  idBar: number;
  nombreBar: number;
}
// 🔹 Interface para la mesa
export interface Mesa {
  idMesa: number;
  numero: string;
  codigoQr: string;
  idBar: number;
  estado: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * URL de autenticación Supabase
   */
  private urlAuth = 'https://kthypysefudciehungyg.supabase.co/auth/v1/token?grant_type=password';
  private _datosUsuario: UsuarioReal | null = null;
  private _barUsuario: BarUsuario | null = null;
  // 🔹 Variable privada en AuthService
  private _mesa: Mesa | null = null;

  /**
   * Inyectamos HttpClient para llamadas HTTP
   */
  constructor(private http: HttpClient) { }

  /**
   * Envía credenciales a Supabase y recibe JWT
   * Ahora guarda automáticamente el access_token y refresh_token en localStorage
   */
  iniciarSesion(correo: string, clave: string): Observable<RespuestaLogin> {

    // Construimos el body con email y password
    const body = {
      email: correo,
      password: clave
    };

    // Encabezados requeridos por Supabase
    const headers = {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHlweXNlZnVkY2llaHVuZ3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIzMjEsImV4cCI6MjA4NTgxODMyMX0.ZbjjHEL0Ej91Qd8cTqxxcAqKUJJSGpIKtxZf7Odq07Y'
    };

    // Hacemos la petición POST a Supabase
    return this.http.post<RespuestaLogin>(
      this.urlAuth,
      body,
      { headers }
    )
      .pipe(
        // tap permite ejecutar código con el resultado antes de que el observable lo entregue
        tap((res: RespuestaLogin) => {
          // Guardamos el access_token en localStorage
          localStorage.setItem('access_token', res.access_token);

          // Guardamos refresh_token en localStorage
          localStorage.setItem('refresh_token', res.refresh_token);

          // También podemos guardar la fecha de expiración si queremos
          const expiracion = new Date();
          expiracion.setSeconds(expiracion.getSeconds() + res.expires_in);
          localStorage.setItem('token_expiration', expiracion.toISOString());

          // console.log('[AuthService] Tokens guardados correctamente en localStorage');
        })
      );
  }

  /**
   * Método para registrar un usuario en Supabase
   * Ahora también guarda tokens al registrar
   */
  registrar(email: string, password: string): Observable<any> {

    const body = { email, password };

    return this.http.post(
      'https://kthypysefudciehungyg.supabase.co/auth/v1/signup',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHlweXNlZnVkY2llaHVuZ3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIzMjEsImV4cCI6MjA4NTgxODMyMX0.ZbjjHEL0Ej91Qd8cTqxxcAqKUJJSGpIKtxZf7Odq07Y'
        }
      }
    )
      .pipe(
        // tap para capturar la respuesta de Supabase
        tap((res: any) => {
          // Si el registro devuelve tokens, los guardamos igual que en login
          if (res.access_token) {
            localStorage.setItem('access_token', res.access_token);
          }
          if (res.refresh_token) {
            localStorage.setItem('refresh_token', res.refresh_token);
          }
          //console.log('[AuthService] Tokens guardados automáticamente tras registro');
        })
      );
  }

  /**
   * Verifica si existe sesión activa en Supabase
   */
  estaAutenticado(): boolean {

    // Obtenemos token del localStorage
    const token = localStorage.getItem('access_token');

    // Si existe token y no ha expirado, devolvemos true
    if (token) {
      const expiracion = localStorage.getItem('token_expiration');
      if (expiracion && new Date(expiracion) > new Date()) {
        return true;
      }
    }

    // Si no hay token o expiró, devolvemos false
    return false;
  }



  cargarUsuarioRealPorEmail(correoElectronico: string): Observable<UsuarioReal> {
    const token = localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // 🔹 URL usando correo electrónico en lugar de ID
    const urlUsuario = `https://musicbares-backend.onrender.com/api/usuario/correo/${encodeURIComponent(correoElectronico)}`;

    return this.http.get<UsuarioReal>(urlUsuario, { headers }).pipe(
      tap(resUsuario => {
        this._datosUsuario = resUsuario;
        console.log('[AuthService] Usuario real cargado por email:', this._datosUsuario);
      })
    );
  }


  // Carga el bar asociado al usuario

  cargarBarPorUsuario(idUsuario: number): Observable<BarUsuario[]> {
    const token = localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const urlBar = `https://musicbares-backend.onrender.com/api/bar/usuario/${idUsuario}`;
    return this.http.get<BarUsuario[]>(urlBar, { headers }).pipe(
      tap(resBar => {
        // Asumimos que solo hay un bar principal, tomamos el primero
        if (resBar.length > 0) {
          this._barUsuario = resBar[0];
          console.log('[AuthService] Datos del bar cargados:', this._barUsuario);
        }
      })
    );
  }

  // 🔹 Función para cargar mesa por QR
  cargarMesaPorCodigoQR(codigoQR: string) {
    const token = localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const urlMesa = `https://musicbares-backend.onrender.com/api/mesa/qr/${encodeURIComponent(codigoQR)}`;

    return this.http.get<Mesa>(urlMesa, { headers }).pipe(
      tap(resMesa => {
        this._mesa = resMesa;
        console.log('[AuthService] Datos de la mesa cargados:', this._mesa);
      })
    );
  }
  /** Getters para acceder desde componentes */
  get usuarioReal(): UsuarioReal | null {
    return this._datosUsuario;
  }

  get barUsuario(): BarUsuario | null {
    return this._barUsuario;
  }


  get mesa(): Mesa | null {
    return this._mesa;
  }
}
