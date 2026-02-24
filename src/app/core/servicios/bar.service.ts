import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BarCrearDto {
  nombreBar: string;
  direccion: string;
}

export interface BarUsuario {
  idBar: number;
  nombreBar: string;
}

@Injectable({
  providedIn: 'root'
})
export class BarService {

  private apiUrl = 'https://musicbares-backend.onrender.com/api/bar';

  constructor(private http: HttpClient) {}

  // 🔐 Construir headers con JWT desde localStorage (sin tocar AuthService)
  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  //  Crear bar
  crearBar(data: BarCrearDto): Observable<any> {
    console.log('[BarService] POST crearBar:', data);

    return this.http.post(
      this.apiUrl,
      data,
      { headers: this.headers() }
    );
  }

  // 🔍 Obtener bar del usuario autenticado (si tu backend lo soporta)
  obtenerMiBar(): Observable<BarUsuario> {
    console.log('[BarService] GET obtenerMiBar');

    return this.http.get<BarUsuario>(
      this.apiUrl,
      { headers: this.headers() }
    );
  }
}