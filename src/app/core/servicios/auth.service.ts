import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Respuesta que devuelve Supabase al iniciar sesión
 */
export interface RespuestaLogin {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  idBar?: number;
}
//Interfaz para almacenar los datos completos del usuario
export interface UsuarioReal {
  idUsuario: number;
  authUserId: string;
  nombreCompleto: string;
  correoElectronico: string;
  fechaCreacion: string;
  estado: boolean;
  idBar: number;
}
export interface BarUsuario {
  idBar: number;
  nombreBar: string;
  //nombreBar: number;
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
  private apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHlweXNlZnVkY2llaHVuZ3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIzMjEsImV4cCI6MjA4NTgxODMyMX0.ZbjjHEL0Ej91Qd8cTqxxcAqKUJJSGpIKtxZf7Odq07Y'
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



  //este caalapp.component
  cargarBarPorUsuario(idUsuario: number): Observable<BarUsuario> {
    const token = localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `https://musicbares-backend.onrender.com/api/bar/usuario/${idUsuario}`;

    return this.http.get<BarUsuario>(url, { headers }).pipe(
      tap(res => {
        if (res) {
          this._barUsuario = res;
          console.log('[AuthService] Bar del usuario cargado:', this._barUsuario);
        } else {
          console.warn('[AuthService] Usuario no tiene bar asociado');
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

  cargarBarPorCorreo(correoElectronico: string): Observable<BarUsuario> {
    // 🔹 Obtenemos token del localStorage
    const token = localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // 🔹 Construimos URL usando el correo electrónico
    const url = `https://musicbares-backend.onrender.com/api/bar/correo/${encodeURIComponent(correoElectronico)}`;

    // console.log('[AuthService] Buscando bar por correo:', correoElectronico);
    // console.log('[AuthService] URL llamada:', url);

    // 🔹 Llamada HTTP al backend
    return this.http.get<BarUsuario>(url, { headers }).pipe(
      tap(bar => {
        if (bar && bar.idBar) {
          // 🔹 Guardamos bar en servicio para uso interno
          this._barUsuario = bar;
          // console.log('[AuthService] Bar cargado por correo:', this._barUsuario);
        } else {
          console.warn('[AuthService] No se encontró bar para este correo');
        }
      })
    );
  }

  refrescarToken(): Observable<string> {
    const rawToken = localStorage.getItem('sb-auth-token');
    if (!rawToken) {
      console.warn('[AuthService] No hay token para refrescar');
      return throwError(() => new Error('No hay token disponible'));
    }

    let refreshToken: string;
    try {
      const parsed = JSON.parse(rawToken);
      refreshToken = parsed.refresh_token;
      if (!refreshToken) throw new Error('No existe refresh_token');
    } catch (err) {
      console.error('[AuthService] Error parseando token:', err);
      return throwError(() => new Error('Token inválido'));
    }

    const url = `${this.urlAuth}`;
    const headers = new HttpHeaders({
      'apikey': this.apikey,
      'Content-Type': 'application/json'
    });
    const body = { refresh_token: refreshToken };

    console.log('[AuthService] Intentando refrescar token con refresh_token:', refreshToken);

    return this.http.post<any>(url, body, { headers }).pipe(
      map(resp => {
        if (!resp || !resp.access_token) {
          throw new Error('No se recibió access_token al refrescar');
        }

        // 🔹 Actualizar localStorage con nueva sesión
        localStorage.setItem('sb-auth-token', JSON.stringify(resp));
        console.log('[AuthService] Token renovado correctamente:', resp.access_token);
        return resp.access_token;
      }),
      catchError(err => {
        console.error('[AuthService] Error refrescando token:', err);
        return throwError(() => err);
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
