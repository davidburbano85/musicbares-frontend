import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesaService {

  private baseUrl = 'https://musicbares-backend.onrender.com/api/mesa';

  constructor(private http: HttpClient) {}

  // =====================================================
  // 🔐 Obtener token EXACTAMENTE igual que VideoService
  // =====================================================
  private obtenerTokenSupabase(): string {

    const raw = localStorage.getItem('sb-auth-token');

    if (!raw) {
      console.warn('[MesaService] No existe sesión Supabase');
      return '';
    }

    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token || '';

      console.log('[MesaService] Token obtenido correctamente');
      return token;

    } catch (err) {
      console.error('[MesaService] Error parseando token:', err);
      return '';
    }
  }

  // =====================================================
  // 🔐 Construir headers con JWT
  // =====================================================
  private construirHeaders(): HttpHeaders {

    const token = this.obtenerTokenSupabase();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('[MesaService] Headers JWT construidos:', headers);

    return headers;
  }

  // =====================================================
  // 🟢 Crear mesa
  // =====================================================
  crearMesa(numeroMesa: number, codigoQR: string): Observable<any> {

    const body = {
      numeroMesa: numeroMesa,
      codigoQR: codigoQR,
      estado: true
    };

    console.log('[MesaService] POST crearMesa body:', body);

    return this.http.post(
      this.baseUrl,
      body,
      { headers: this.construirHeaders() }
    );
  }

  // =====================================================
  // 🔵 Obtener mis mesas
  // =====================================================
  obtenerMesas(): Observable<any> {

    console.log('[MesaService] GET mis-mesas');

    return this.http.get(
      `${this.baseUrl}/mis-mesas`,
      { headers: this.construirHeaders() }
    );
  }

  // =====================================================
  // 🟡 Obtener mesa por ID
  // =====================================================
  obtenerMesa(idMesa: number): Observable<any> {

    console.log('[MesaService] GET mesa por ID:', idMesa);

    return this.http.get(
      `${this.baseUrl}/${idMesa}`,
      { headers: this.construirHeaders() }
    );
  }

  // =====================================================
  // 🟣 Obtener mesa por QR
  // =====================================================
  obtenerMesaPorQR(qr: string): Observable<any> {

    console.log('[MesaService] GET mesa por QR:', qr);

    return this.http.get(
      `${this.baseUrl}/qr/${qr}`,
      { headers: this.construirHeaders() }
    );
  }

  
  // =====================================================
  // 🔴 Actualizar mesa
  // =====================================================
  actualizarMesa( idMesa:number, nuevoNumero: number, nuevoQR: string,estado:boolean): Observable<any> {

    const body = {
      idMesa:idMesa,
      numeroMesa: nuevoNumero,
      codigoQR: nuevoQR,
      estado: estado
    };

    console.log('[MesaService] PUT actualizarMesa body:', body);

    return this.http.put(
      `${this.baseUrl}/${idMesa}`,
      body,
      { headers: this.construirHeaders() }
    );
  }
}
