import { Component, OnInit} from '@angular/core'; // Decorador base del componente
import { CommonModule } from '@angular/common'; // Necesario para directivas básicas
import { FormsModule } from '@angular/forms'; // Para usar ngModel en inputs
import { VideoService } from '../../../../core/servicios/video.service'; // Servicio de videos
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-mesa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss']
})
export class MesaComponent implements OnInit {

  // Código de mesa obtenido del QR o de la URL
  codigoMesa: string = '';

  // Texto donde el usuario pega los links (uno por línea)
  linksTexto: string = '';

  // Mensaje visual para el usuario
  mensaje: string = '';

  // Indicador de carga
  enviando = false;

  // Inyectamos servicio de videos
  constructor(private videoService: VideoService,
              private route: ActivatedRoute//angular da acceso a la url
  ) { }
  //se inicia automaticamente cuando el componente inicia
  ngOnInit(){
    //leeemos el parametro llamado codigo desde la url
    this.codigoMesa=this.route.snapshot.paramMap.get('codigo')||'';
    //solo para depurar  lomiramos en consola
    console.log('Mesa detectada desde url: ', this.codigoMesa);

  }

  // ============================
  // ENVIAR LINKS AL BACKEND
  // ============================
  enviarLinks() {

    // Si no hay código de mesa, no hacemos nada
    if (!this.codigoMesa) {
      this.mensaje = 'Mesa no identificada';
      return;
    }

    // Convertimos el textarea en array de links
    const links = this.linksTexto
      .split('\n')           // separa por líneas
      .map(l => l.trim())    // elimina espacios
      .filter(l => l);       // elimina vacíos

    // Si no hay links válidos
    if (links.length === 0) {
      this.mensaje = 'Agrega al menos un link válido';
      return;
    }

    // Activamos indicador visual
    this.enviando = true;
    this.mensaje = '';

    // Llamamos al backend
    this.videoService.registrarVideosMesa(this.codigoMesa, links)
      .subscribe({

        next: () => {

          // Mensaje de éxito
          this.mensaje = '🎵 Videos enviados a la cola';

          // Limpiamos campo
          this.linksTexto = '';

          // Quitamos loading
          this.enviando = false;
        },

        error: () => {

          // Mensaje de error
          this.mensaje = 'Error al enviar los videos';

          this.enviando = false;
        }

      });

  }


}
