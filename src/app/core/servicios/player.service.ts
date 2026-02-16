import { Injectable } from '@angular/core'; // Permite inyección global
import { BehaviorSubject, timer, Subscription } from 'rxjs'; // Manejo reactivo y temporizadores
import { VideoService } from './video.service'; // Servicio que consume backend

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  // Guarda SOLO el id de youtube del video actual
  private videoYoutubeIdSubject = new BehaviorSubject<string | null>(null);

  // Observable público al que se suscribe el reproductor
  videoYoutubeId$ = this.videoYoutubeIdSubject.asObservable();

  // Guarda id del bar actual
  private idBar!: number;

  // Control de espera cuando no hay videos
  private esperaSub?: Subscription;

  // Indica si el player está activo
  private activo = false;

  constructor(private videoService: VideoService) {}

  // ============================
  // INICIAR PLAYER
  // ============================
  iniciar(idBar: number) {

    this.idBar = idBar;      // Guardamos bar activo
    this.activo = true;      // Activamos loop
    this.cargarSiguiente();  // Buscamos primer video
  }

  // ============================
  // DETENER PLAYER
  // ============================
  detener() {

    this.activo = false;                 // Desactivamos loop
    this.esperaSub?.unsubscribe();       // Cancelamos temporizador
    this.videoYoutubeIdSubject.next(null); // Limpiamos video actual
  }

  // ============================
  // PEDIR SIGUIENTE VIDEO
  // ============================
  private cargarSiguiente() {

    if (!this.activo) return; // Si el player está apagado, no hace nada

    this.videoService.obtenerSiguienteVideo(this.idBar).subscribe({

      next: (video) => {

        // Si backend no envía nada
        if (!video || !video.id_video_youtube) {
          this.esperarYReintentar();
          return;
        }

        // Emitimos SOLO el id de YouTube
        this.videoYoutubeIdSubject.next(video.id_video_youtube);
      },

      error: () => {
        // Si falla backend, reintentamos luego
        this.esperarYReintentar();
      }
    });
  }

  // ============================
  // ESPERA CUANDO NO HAY VIDEOS
  // ============================
  private esperarYReintentar() {

    this.esperaSub?.unsubscribe();

    this.esperaSub = timer(5000).subscribe(() => {
      this.cargarSiguiente();
    });
  }

  // ============================
  // CUANDO TERMINA EL VIDEO
  // ============================
  videoFinalizado() {

    // Cuando el componente detecta que terminó el video,
    // pedimos el siguiente automáticamente
    this.cargarSiguiente();
  }
}
