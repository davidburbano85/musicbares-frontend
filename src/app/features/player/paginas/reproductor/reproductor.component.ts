import { Component, OnDestroy, OnInit } from '@angular/core'; // Ciclo de vida del componente
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Permite usar URLs seguras en iframe
import { Subscription } from 'rxjs'; // Para manejar suscripciones
import { PlayerService } from '../../../../core/servicios/player.service'; // Servicio central del reproductor
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reproductor', // Nombre del selector HTML
  standalone: true, // Importante: componente standalone
  imports:[CommonModule],
  templateUrl: './reproductor.component.html',
  styleUrls: ['./reproductor.component.scss']
})
export class ReproductorComponent implements OnInit, OnDestroy {

  // URL segura que usará el iframe
  videoUrl: SafeResourceUrl | null = null;

  // Suscripción al servicio del player
  private sub?: Subscription;

  // Inyectamos:
  // sanitizer → para evitar bloqueo de Angular en iframe
  // playerService → para recibir el video actual
  constructor(
    private sanitizer: DomSanitizer,
    private playerService: PlayerService
  ) {}

  // ============================
  // CUANDO INICIA EL COMPONENTE
  // ============================
  ngOnInit(): void {

    // IMPORTANTE:
    // Aquí debes pasar el id del bar real.
    // De momento lo dejamos fijo para pruebas.
    const idBar = 1;

    // Iniciamos el motor automático
    this.playerService.iniciar(idBar);

    // Nos suscribimos al id del video actual
    this.sub = this.playerService.videoYoutubeId$.subscribe(idYoutube => {

      // Si no hay video, limpiamos iframe
      if (!idYoutube) {
        this.videoUrl = null;
        return;
      }

      // Construimos URL embebida de YouTube con autoplay
      const url = `https://www.youtube.com/embed/${idYoutube}?autoplay=1&mute=0&rel=0`;

      // Marcamos URL como segura para Angular
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }

  // ============================
  // CUANDO EL VIDEO TERMINA
  // ============================
  videoTerminado() {

    // Avisamos al servicio que el video finalizó
    this.playerService.videoFinalizado();
  }

  // ============================
  // CUANDO SE DESTRUYE COMPONENTE
  // ============================
  ngOnDestroy(): void {

    // Cancelamos suscripción para evitar fugas de memoria
    this.sub?.unsubscribe();

    // Detenemos el player si se cierra la pantalla
    this.playerService.detener();
  }
}
