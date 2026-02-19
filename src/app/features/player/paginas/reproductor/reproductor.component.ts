// Importamos lo necesario de Angular
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Servicio que controla qué video se reproduce
import { PlayerService } from '../../../../core/servicios/player.service';

// Declaramos globalmente la API de YouTube
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'app-reproductor',
  standalone: true,
  imports: [CommonModule], // Necesario para usar *ngIf
  templateUrl: './reproductor.component.html',
  styleUrls: ['./reproductor.component.scss']
})
export class ReproductorComponent implements OnInit, OnDestroy {

  // ID del video actual a reproducir
  videoActual: string | null = null;

  // Indica si el video está bloqueado y se debe mostrar el botón
  videoBloqueado = false;

  // Guarda el timer de 30 segundos cuando el video está bloqueado
  private timerBloqueo?: any;

  // Referencia al contenedor donde se insertará el iframe de YouTube
  @ViewChild('playerContainer', { static: true }) playerContainer!: ElementRef;

  // Instancia del player de YouTube
  private player: any;

  constructor(private playerService: PlayerService) { }

  ngOnInit() {
    // Nos suscribimos al observable que entrega los IDs de videos
    this.playerService.videoYoutubeId$.subscribe(id => {
      // Reiniciamos estado de bloqueo
      this.videoBloqueado = false;

      // Guardamos el video actual
      this.videoActual = id;

      // Si existe un video válido, cargamos la API de YouTube
      if (id) {
        this.cargarYouTubeAPI();
      }
    });

    // Iniciamos el servicio del player para que consulte al backend
    this.playerService.iniciar(10);
  }

  ngOnDestroy() {
    // Limpiamos cualquier timer y destruimos el player al salir del componente
    if (this.timerBloqueo) clearTimeout(this.timerBloqueo);
    if (this.player) this.player.destroy();
  }

  // ===========================
  // Carga la API de YouTube si no está cargada
  // ===========================
  private cargarYouTubeAPI() {
    // Si la API ya existe, inicializamos directamente el player
    if (window.YT && window.YT.Player) {
      this.inicializarPlayer();
      return;
    }

    // Creamos el script que carga la API de YouTube
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    // Callback que se ejecuta cuando la API de YouTube está lista
    window.onYouTubeIframeAPIReady = () => {
      this.inicializarPlayer();
    };
  }

  // ===========================
  // Inicializa el player con el video actual
  // ===========================
  private inicializarPlayer() {
    if (!this.videoActual) return;

    // Destruimos player anterior si existe
    if (this.player) {
      this.player.destroy();
    }

    // Creamos un nuevo player
    this.player = new window.YT.Player(this.playerContainer.nativeElement, {
      videoId: this.videoActual, // ID del video a reproducir
      height: '100%',            // altura del iframe
      width: '100%',             // ancho del iframe
      playerVars: {
        autoplay: 1, // Reproduce automáticamente al cargar
        controls: 1, // Muestra controles de YouTube
        rel: 0       // No mostrar videos relacionados al final
      },
      events: {
        onReady: (event: any) => this.onPlayerReady(event),             // Evento cuando el player está listo
        onStateChange: (event: any) => this.onPlayerStateChange(event), // Evento cuando cambia el estado (play, pause, end)
        onError: (event: any) => this.onPlayerError(event)              // Evento cuando hay error de reproducción
      }
    });
  }

  // ===========================
  // Se ejecuta cuando el player está listo
  // ===========================
  private onPlayerReady(event: any) {
    // Reproducimos automáticamente el video
    event.target.playVideo();
  }

  // ===========================
  // Detecta cambios de estado del video
  // ===========================
  private onPlayerStateChange(event: any) {
    // Estado 0 significa que el video terminó
    if (event.data === 0) {
      // Pedimos al servicio que cargue el siguiente video
      this.playerService.videoFinalizado();
    }
  }

  // ===========================
  // Maneja errores del player (ej. video bloqueado)
  // ===========================
  private onPlayerError(event: any) {
    // YouTube bloquea videos externos con los códigos 101 y 150
    if (event.data === 101 || event.data === 150) {
      // Mostramos botón de "Abrir en YouTube"
      this.videoBloqueado = true;

      // Iniciamos timer de 30s para pasar automáticamente al siguiente video
      this.timerBloqueo = setTimeout(() => {
        this.videoBloqueado = false;
        this.playerService.videoFinalizado();
      }, 30000);
    }
  }

  // ===========================
  // Acción al presionar "Abrir en YouTube"
  // ===========================
  abrirEnYouTube() {
    if (!this.videoActual) return;

    // Abrimos el video en nueva pestaña de YouTube
    window.open(`https://www.youtube.com/watch?v=${this.videoActual}`, '_blank');

    // Cancelamos timer si estaba corriendo
    if (this.timerBloqueo) {
      clearTimeout(this.timerBloqueo);
      this.timerBloqueo = undefined;
    }

    // Ocultamos el botón y pasamos al siguiente video
    this.videoBloqueado = false;
    this.playerService.videoFinalizado();
  }
}
