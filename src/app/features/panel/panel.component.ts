import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../core/servicios/video.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MesaService } from '../../core/servicios/mesa.service';
import { AuthService, UsuarioReal, BarUsuario } from '../../core/servicios/auth.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {

  titulo: string = 'Panel de Administración';
  cola: any[] = [];
  idBar: number | null = null;

  constructor(
    private videoService: VideoService,
    public mesaService: MesaService,
    private router: Router,
    public authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // 🔹 Obtenemos email del usuario desde localStorage
    const email = localStorage.getItem('usuarioEmail');
    if (!email) return;

    // 🔹 Cargar usuario real
    this.authService.cargarUsuarioRealPorEmail(email).subscribe({
      next: usuario => {
        // 🔹 Obtenemos idUsuario
        const idUsuario = this.authService.usuarioReal?.idUsuario;
        if (!idUsuario) return;

        // 🔹 Cargar bar asociado al usuario
        this.authService.cargarBarPorUsuario(idUsuario).subscribe({
          next: bar => {
            this.idBar = this.authService.barUsuario?.idBar || null;

            // 🔹 Si tenemos idBar, cargamos la cola de videos
            if (this.idBar) {
              this.cargarColaConTitulos(this.idBar);
            }
          }
        });
      }
    });
  }


  /**
   * 🔹 Función que carga la cola de videos y obtiene el título desde YouTube
   */
  cargarColaConTitulos(idBar: number): void {
  this.videoService.colaVideos(idBar).subscribe({
    next: videos => {
      // 🔹 Inicializamos la cola vacía
      this.cola = [];

      // 🔹 Para cada video obtenemos el título real desde YouTube
      videos.forEach(video => {
        this.videoService.obtenerTituloVideo(video.idVideoYoutube).subscribe({
          next: titulo => {
            this.cola.push({
              ...video,
              tituloCancion: titulo,
              qrMesa: video.idMesa
            });
          },
          error: err => {
            console.error('[Panel] Error obteniendo título de YouTube:', err);
            this.cola.push({
              ...video,
              tituloCancion: video.idVideoYoutube, // fallback
              qrMesa: video.idMesa
            });
          }
        });
      });
    },
    error: err => console.error('[Panel] Error cargando cola de videos:', err)
  });
}


  // 🔹 Paso 3: Cargar cola de videos solo si hay idBar válido



  // ======================================================
  // 🔴 ELIMINAR VIDEO
  // ======================================================
  eliminarVideo(id: number): void {
    console.log('[Panel] eliminarVideo:', id);
    this.videoService.eliminarVideo(id).subscribe({
      next: () => {
        console.log('[Panel] Video eliminado');
        if (this.idBar) this.videoService.obtenerSiguienteVideo(this.idBar).subscribe({
          next: cola => this.cola = cola || [],
          error: err => console.error('[Panel] ERROR refrescando cola:', err)
        });
      },
      error: err => console.error('[Panel] Error eliminando video:', err)
    });
  }

  // ======================================================
  // 🟢 CREAR MESA
  // ======================================================
  crearMesaForm(numeroMesa: number, codigoQR: string): void {
    console.log('[Panel] crearMesaForm:', numeroMesa, codigoQR);
    this.mesaService.crearMesa(numeroMesa, codigoQR).subscribe({
      next: () => console.log('[Panel] Mesa creada correctamente'),
      error: err => console.error('[Panel] Error creando mesa:', err)
    });
  }

  // ======================================================
  // 🟡 ACTUALIZAR MESA
  // ======================================================
  actualizarMesa( idMesa: number, numeroMesa: number, codigoQR:string, estado:boolean): void {
    console.log('[Panel] actualizarMesa:',  numeroMesa, codigoQR);
    this.mesaService.actualizarMesa(idMesa,numeroMesa, codigoQR, estado).subscribe({
      next: () => console.log('[Panel] Mesa actualizada'),
      error: err => console.error('[Panel] Error actualizando mesa:', err)
    });
  }

  // ======================================================
  // 🟣 CERRAR SESIÓN
  // ======================================================
  cerrarSesion(): void {
    console.log('[Panel] Cerrando sesión');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ======================================================
  // 🟢 ACTUALIZAR USUARIO
  // ======================================================
  actualizarUsuarioForm(correo: string, nombreCompleto: string): void {
    if (!this.authService.usuarioReal) {
      console.error('[Panel] No hay usuario cargado para actualizar');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `https://musicbares-backend.onrender.com/api/usuario/${correo}`;
    const body = { correoElectronico: correo, nombreCompleto };

    this.http.put(url, body, { headers }).subscribe({
      next: resp => console.log('[Panel] Usuario actualizado correctamente', resp),
      error: err => console.error('[Panel] ERROR actualizando usuario', err)
    });
  }

  // ======================================================
  // 🟡 ACTUALIZAR BAR
  // ======================================================
mesaSeleccionada: any = null;
modoEdicionMesa = false;
buscarMesa(qr: string): void {

  if (!qr) return;

  this.mesaService.obtenerMesaPorQR(qr).subscribe({
    next: mesa => {
      console.log('[Panel] Mesa encontrada:', mesa);

      this.mesaSeleccionada = mesa;
      this.modoEdicionMesa = true;
    },
    error: err => {
      console.error('[Panel] Error buscando mesa:', err);
      this.modoEdicionMesa = false;
    }
  });
}

guardarMesa(numero: number, qr: string): void {

  if (!this.mesaSeleccionada) return;

  const numeroFinal = numero || this.mesaSeleccionada.numeroMesa;
  const qrFinal = qr || this.mesaSeleccionada.codigoQR;

  this.mesaService.actualizarMesa(
    this.mesaSeleccionada.idMesa,
    numeroFinal,
    qrFinal,
    this.mesaSeleccionada.estado ?? true
  ).subscribe({
    next: () => {
      console.log('[Panel] Mesa actualizada correctamente');
      this.modoEdicionMesa = false;
      this.mesaSeleccionada = null;
    },
    error: err => console.error('[Panel] Error actualizando mesa:', err)
  });
}


  actualizarBarForm(nombre: string, direccion: string): void {
    if (!this.authService.barUsuario) {
      console.error('[Panel] No hay bar cargado para actualizar');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const idBar = this.authService.barUsuario.idBar;
    const urlPut = `https://musicbares-backend.onrender.com/api/bar/${idBar}`;
    const body = { idBar, nombreBar: nombre, direccion };

    this.http.put(urlPut, body, { headers }).subscribe({
      next: resp => console.log('[Panel] Bar actualizado correctamente', resp),
      error: err => console.error('[Panel] ERROR actualizando bar', err)
    });
  }

obtenerYActualizarMesa(qrActual:string, nuevoNumero:number,nuevoqr:string, estado: boolean):void{
  if(!qrActual){
    console.error('[panle]QR de mesa vacio.');
    return
  }
  console.log('[Panel] Obtener mesa por QR:', qrActual);
  this.mesaService.obtenerMesaPorQR(qrActual).subscribe({
    next:(mesa)=>{

      console.log('[Panel] idMesaencontrado: ', mesa);
      //actualizar la mesa con elidMesa
      this.mesaService.actualizarMesa(
        mesa.idMesa,
        nuevoNumero || mesa.numeroMesa,
        nuevoqr||mesa.codigoQR,
        estado||mesa.estado ).subscribe({
        next:()=>console.log('[panel] Mesa actualizada correctamente'),
        error:(err)=>console.error('[Panel] Error actualizando mesa: ', err)
        
        
      });
    },
    error:(err)=>console.error('[Panel] Error obteniendo mesa: ', err)
    
  });
}



}
