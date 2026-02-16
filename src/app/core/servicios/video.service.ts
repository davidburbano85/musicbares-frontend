import { Injectable } from '@angular/core'; // Permite que el servicio pueda inyectarse en toda la app
import { HttpClient } from '@angular/common/http'; // Cliente HTTP para consumir el backend
import { Observable } from 'rxjs'; // Tipo Observable para manejar respuestas async

@Injectable({
  providedIn: 'root' // Hace que el servicio sea singleton global
})
export class VideoService {

  // URL base del backend para videos
  private apiUrl = 'https://musicbares-backend.onrender.com/api/VideoMesa';

  // Inyectamos HttpClient para poder hacer peticiones REST
  constructor(private http: HttpClient) {}

  // ================================
  // REGISTRAR VIDEOS DESDE UNA MESA
  // ================================
  registrarVideosMesa(codigoMesa: string, links: string[]): Observable<any> {

    // Construimos el body que el backend espera
    const body = {
      codigoMesa: codigoMesa,
      links: links
    };

    // Enviamos POST al endpoint correspondiente
    return this.http.post(`${this.apiUrl}/registrar-multiples`, body);
  }

  // ================================
  // OBTENER VIDEOS DE UNA MESA
  // ================================
  obtenerVideosMesa(idMesa: number): Observable<any> {

    // GET simple pasando el id de la mesa en la URL
    return this.http.get(`${this.apiUrl}/mesa/${idMesa}`);
  }

  // ================================
  // OBTENER COLA COMPLETA DEL BAR
  // ================================
  obtenerColaBar(idBar: number): Observable<any> {

    // Devuelve todos los videos pendientes y en proceso
    return this.http.get(`${this.apiUrl}/cola/${idBar}`);
  }

  // ================================
  // OBTENER SIGUIENTE VIDEO (ROUND ROBIN)
  // ================================
  obtenerSiguienteVideo(idBar: number): Observable<any> {

    // Este endpoint es el corazón del reproductor automático
    return this.http.get(`${this.apiUrl}/siguiente/${idBar}`);
  }

  // ================================
  // ELIMINAR VIDEO POR ID
  // ================================
  eliminarVideo(idVideo: number): Observable<any> {

    // DELETE directo con id del video
    return this.http.delete(`${this.apiUrl}/${idVideo}`);
  }
}
