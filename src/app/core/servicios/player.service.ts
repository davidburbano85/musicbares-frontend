import { Injectable } from '@angular/core'; // Permite que Angular inyecte este servicio
import { BehaviorSubject } from 'rxjs';     // Observable que mantiene el último valor emitido
import { VideoService } from './video.service'; // Servicio que llama al backend

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class PlayerService {

  // 🔴 Guarda el ID del video actual que se está reproduciendo
  // BehaviorSubject permite emitir y también guardar el último valor
  private videoYoutubeIdSubject = new BehaviorSubject<string | null>(null);

  // 🔴 Observable público que escucha el componente reproductor
  videoYoutubeId$ = this.videoYoutubeIdSubject.asObservable();

  // 🔴 Guarda el id del bar activo
  private idBar!: number;

  // 🔴 Indica si el reproductor está activo o no
  private activo = false;

  // 🔴 Inyectamos el servicio que habla con el backend
  constructor(private videoService: VideoService) {}

  // ==========================
  // INICIAR PLAYER
  // ==========================
  iniciar(idBar: number) {

    // Guardamos el bar actual
    this.idBar = idBar;

    // Activamos el reproductor
    this.activo = true;

    console.log('[PlayerService] Player iniciado con idBar:', idBar);

    // Pedimos el primer video al backend
    this.cargarSiguiente();
  }

  // ==========================
  // DETENER PLAYER
  // ==========================
  detener() {

    // Desactivamos el player
    this.activo = false;

    // Limpiamos el video actual
    this.videoYoutubeIdSubject.next(null);

    console.log('[PlayerService] Player detenido');
  }

  // ==========================
  // CARGAR SIGUIENTE VIDEO
  // ==========================
  private cargarSiguiente() {

    // Si el player está apagado no hacemos nada
    if (!this.activo) return;

    console.log('[PlayerService] Pidiendo siguiente video al backend...');

    // Llamamos al backend para obtener el siguiente video
    this.videoService.obtenerSiguienteVideo(this.idBar).subscribe({

      // Si el backend responde correctamente
      next: (video) => {

        console.log('[PlayerService] Respuesta backend:', video);

        // 🔥 IMPORTANTE:
        // El backend devuelve "idVideoYoutube"
        // antes estábamos leyendo mal la propiedad
        const youtubeId = video?.idVideoYoutube;

        // Si no viene ID válido, no hacemos nada
        if (!youtubeId) {
          console.log('[PlayerService] Backend respondió sin video válido');
          return;
        }

        // Emitimos el ID para que el componente lo reproduzca
        console.log('[PlayerService] Emitiendo video al reproductor:', youtubeId);
        this.videoYoutubeIdSubject.next(youtubeId);
      },

      // Si ocurre un error en la llamada
      error: (err) => {
        console.error('[PlayerService] Error al consultar backend:', err);
      }
    });
  }

  // ==========================
  // CUANDO TERMINA EL VIDEO
  // ==========================
  videoFinalizado() {

    console.log('[PlayerService] Video terminado → solicitando siguiente');

    // Pedimos el siguiente video solo cuando el actual termina
    this.cargarSiguiente();
  }

  
}
