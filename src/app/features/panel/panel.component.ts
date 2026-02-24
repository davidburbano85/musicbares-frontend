import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../core/servicios/video.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MesaService } from '../../core/servicios/mesa.service';
import { AuthService, UsuarioReal, BarUsuario } from '../../core/servicios/auth.service';
import { ActivarBoolService } from '../auth/services/activarBool.service';
import { BarCrearDto, BarService } from '../../core/servicios/bar.service';
import { FormGroup } from '@angular/forms';

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
  intervalColaId: any;      // Intervalo para refresco de cola
  intervalTokenId: any;     // Intervalo para refresco de token
  mostrarFormularioBar = false;
  constructor(
    private videoService: VideoService,
    public mesaService: MesaService,
    private router: Router,
    public authService: AuthService,
    private http: HttpClient,
    public activarBoolService: ActivarBoolService,
    private barService: BarService
  ) { }

  // ngOnInit(): void {
  //   const email = localStorage.getItem('usuarioEmail');
  //   if (!email) {
  //     console.warn('[PANEL] No hay email en localStorage');
  //     return;
  //   }

  //   // 🔹 Cargamos el bar asociado al correo
  //   this.authService.cargarBarPorCorreo(email).subscribe({
  //     next: bar => {
  //       if (!bar || !bar.idBar) {
  //         console.warn('[PANEL] Usuario sin bar asignado');
  //         return;
  //       }

  //       // 🔹 Guardamos idBar en componente
  //       this.idBar = bar.idBar;
  //       console.log('[PANEL] Bar recibido:', bar);

  //       // 🔹 Guardamos idBar en localStorage para otras partes
  //       localStorage.setItem('idBar', bar.idBar.toString());

  //       // 🔹 Ahora podemos cargar la cola de videos
  //       this.cargarColaConTitulos(this.idBar);
  //     },
  //     error: err => console.error('[PANEL] Error cargando bar:', err)
  //   });


  // }
  ngOnInit(): void {
    // Si el usuario no tiene bar cargado → mostrar formulario
    if (!this.authService.barUsuario) {
      this.mostrarFormularioBar = true;
    }
    const email = localStorage.getItem('usuarioEmail');
    if (!email) return;

    // 🔹 1. Cargar usuario real (ESTO ES LO QUE FALTABA)
    this.authService.cargarUsuarioRealPorEmail(email).subscribe({
      next: usuario => {
        console.log('[PANEL] Usuario cargado correctamente:', usuario);
      },
      error: err => console.error('[PANEL] Error cargando usuario:', err)
    });

    // 🔹 2. Cargar bar del usuario s
    this.authService.cargarBarPorCorreo(email).subscribe({
      next: bar => {
        if (!bar || !bar.idBar) return;

        this.idBar = bar.idBar;

        this.cargarColaConTitulos(this.idBar);

        this.intervalColaId = setInterval(() => {
          this.cargarColaConTitulos(this.idBar!);
        }, 60000);

        this.intervalTokenId = setInterval(() => {
          console.log('[DEBUG PANEL] Refrescando token Supabase automáticamente');
          this.authService.refrescarToken().subscribe({
            next: () => console.log('[DEBUG PANEL] Token renovado correctamente'),
            error: err => console.error('[DEBUG PANEL] Error renovando token:', err)
          });
        }, 1800000);
      },
      error: err => console.error('[DEBUG PANEL] Error cargando bar:', err)
    });
  }
  ngOnDestroy(): void {
    // 🔹 Limpiar intervalos al salir del componente
    if (this.intervalColaId) clearInterval(this.intervalColaId);
    if (this.intervalTokenId) clearInterval(this.intervalTokenId);
  }


  cargarColaConTitulos(idBar: number): void {
    console.log('[DEBUG PANEL] cargarColaConTitulos ejecutada con idBar:', idBar);
    if (!idBar || idBar <= 0) return;

    // 🔹 Llamada al backend para obtener la cola de videos
    this.videoService.colaVideos(idBar).subscribe({
      next: (videos: any[]) => {
        //console.log('[DEBUG PANEL] Respuesta RAW backend:', videos);
        if (!videos || videos.length === 0) {
          this.cola = [];
          console.warn('[DEBUG PANEL] Backend respondió sin videos');
          return;
        }

        this.cola = []; // limpiar cola actual

        videos.forEach((video, index) => {
          //console.log(`[DEBUG PANEL] Video #${index} recibido:`, video);

          const idYoutube = video.idVideoYoutube ?? video.idYoutube ?? video.youtubeId ?? null;
          const mesa = video.idMesa ?? video.numeroMesa ?? video.mesa ?? 'Sin mesa';
          const usuario = video.usuario ?? { correoElectronico: localStorage.getItem('usuarioEmail'), nombreCompleto: 'Desconocido' };

          if (!idYoutube) return;

          this.cola.push({
            ...video,
            tituloCancion: idYoutube, // temporal
            qrMesa: mesa,
            usuario // mostrar quién envió
          });
        });

        // console.log('[DEBUG PANEL] Cola inicial cargada:', this.cola);

        // 🔹 Obtener títulos de YouTube
        this.cola.forEach(video => {
          if (!video.idVideoYoutube) return;

          this.videoService.obtenerTituloVideo(video.idVideoYoutube).subscribe({
            next: titulo => {
              video.tituloCancion = titulo;
              //console.log('[DEBUG PANEL] Título YouTube cargado para', video.idVideoYoutube, ':', titulo);
            },
            error: err => console.warn('[DEBUG PANEL] Error consultando YouTube:', err)
          });
        });
      },
      error: err => {
        console.error('[DEBUG PANEL] Error llamando colaVideos:', err);
        if (err.status) console.error('[DEBUG PANEL] HTTP Status:', err.status);
        if (err.error) console.error('[DEBUG PANEL] Body backend:', err.error);
      }
    });
  }


  verificarFlujoPanel(): void {

    // 🔹 Confirmamos que el componente inició correctamente
    console.log('[DEBUG PANEL] ngOnInit ejecutado');

    // 🔹 Obtenemos email guardado tras login
    const email = localStorage.getItem('usuarioEmail');
    console.log('[DEBUG PANEL] Email detectado:', email);

    // 🔹 Si no hay email, no podemos continuar
    if (!email) {
      console.warn('[DEBUG PANEL] No hay email en localStorage.');
      return;
    }

    // 🔹 Cargamos el usuario real desde backend
    this.authService.cargarUsuarioRealPorEmail(email).subscribe({

      // ======================================================
      // 🟢 USUARIO RECIBIDO
      // ======================================================
      next: usuario => {

        console.log('[DEBUG PANEL] Usuario recibido:', usuario);

        // 🔹 Extraemos idUsuario necesario para buscar su bar
        const idUsuario = usuario?.idUsuario;
        console.log('[DEBUG PANEL] idUsuario detectado:', idUsuario);

        // 🔹 Si no existe idUsuario, detenemos flujo
        if (!idUsuario) {
          console.warn('[DEBUG PANEL] Usuario sin idUsuario.');
          return;
        }

        // 🔹 Ahora el servicio devuelve UN SOLO BAR (no array)
        this.authService.cargarBarPorUsuario(idUsuario).subscribe({

          // ======================================================
          // 🟢 BAR RECIBIDO
          // ======================================================
          next: bar => {

            console.log('[DEBUG PANEL] Bar recibido:', bar);

            // 🔹 Validamos que exista idBar
            if (!bar || !bar.idBar) {
              console.warn('[DEBUG PANEL] Bar inválido o sin idBar.');
              return;
            }

            // 🔹 Guardamos idBar en el componente
            this.idBar = bar.idBar;

            console.log('[DEBUG PANEL] idBar asignado:', this.idBar);

            // 🔹 Confirmamos que el flujo llegó correctamente
            console.log('[DEBUG PANEL] Flujo correcto → cargando cola de videos');

            // 🔹 Llamamos a la carga de cola usando el idBar correcto
            this.cargarColaConTitulos(this.idBar);
          },

          // 🔴 Error cargando bar
          error: err =>
            console.error('[DEBUG PANEL] Error cargando bar del usuario:', err)

        });

      },

      // 🔴 Error cargando usuario
      error: err =>
        console.error('[DEBUG PANEL] Error cargando usuario:', err)

    });

  }



  eliminarVideo(id: number): void {
    console.log('[Panel] eliminarVideo:', id);
    this.videoService.eliminarVideo(id).subscribe({
      next: () => {
        console.log('[Panel] Video eliminado');
        alert('Eliminado correctamente');
        if (this.idBar) this.videoService.obtenerSiguienteVideo(this.idBar).subscribe({
          next: cola => this.cola = cola || [],
          error: err => console.error('[Panel] ERROR refrescando cola:', err)
        });
      },
    });
        alert('Eliminado correctamente');
    
  }

  // ======================================================
  // 🟢 CREAR MESA
  // ======================================================
  crearMesaForm(numeroMesa: number, codigoQR: string): void {
    console.log('[Panel] crearMesaForm:', numeroMesa, codigoQR);
    alert(`la mesa: ${codigoQR} fue creada exitosamente` );
    this.mesaService.crearMesa(numeroMesa, codigoQR).subscribe({
      next: () => console.log('[Panel] Mesa creada correctamente'),    
      error: err => console.error('[Panel] Error creando mesa:', err)
    });
  }

  // ======================================================
  // 🟡 ACTUALIZAR MESA
  // ======================================================
  actualizarMesa(idMesa: number, numeroMesa: number, codigoQR: string, estado: boolean): void {
    console.log('[Panel] actualizarMesa:', numeroMesa, codigoQR);
    alert(` nuevo nombre de mesa:  ${codigoQR}  nuevo numero: ${numeroMesa}`);
    this.mesaService.actualizarMesa(idMesa, numeroMesa, codigoQR, estado).subscribe({
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
alert
    this.http.put(url, body, { headers }).subscribe({
      next: resp =>{ console.log('[Panel] Usuario actualizado correctamente', resp);
        alert(`Nombre de usuario actualizado correctamente como: ${nombreCompleto}`) 
      },
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
        alert(`Mesa actualizada correctamente \nnuevo numero: ${numero}\nNuevo Nombre o CodigoQR: ${qr}`);
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
      next: resp =>{ console.log('[Panel] Bar actualizado correctamente', resp);
        alert(`Bar actualizado correctamente\nNuevo nombre: ${nombre}.\nNueva direccion: ${direccion}`)
      },
      error: err => console.error('[Panel] ERROR actualizando bar', err)
    });
  }

  obtenerYActualizarMesa(qrActual: string, nuevoNumero: number, nuevoqr: string, estado: boolean): void {
    if (!qrActual) {
      console.error('[panle]QR de mesa vacio.');
      return
    }
    console.log('[Panel] Obtener mesa por QR:', qrActual);
    this.mesaService.obtenerMesaPorQR(qrActual).subscribe({
      next: (mesa) => {

        console.log('[Panel] idMesaencontrado: ', mesa);
        //actualizar la mesa con elidMesa
        this.mesaService.actualizarMesa(
          mesa.idMesa,
          nuevoNumero || mesa.numeroMesa,
          nuevoqr || mesa.codigoQR,
          estado || mesa.estado).subscribe({
            next: () => console.log('[panel] Mesa actualizada correctamente'),
            error: (err) => console.error('[Panel] Error actualizando mesa: ', err)


          });
      },
      error: (err) => console.error('[Panel] Error obteniendo mesa: ', err)

    });
  }

  abrirReproductor() {
    window.open('/reproductor', '_blank');
  }
 crearBarForm(nombreBarInput: HTMLInputElement, direccionInput: HTMLInputElement) {

  const nombreBar = nombreBarInput.value;
  const direccion = direccionInput.value;

  if (!nombreBar || !direccion) {
    console.warn('[Panel] Datos de bar incompletos');
    return;
  }

  const dto = { nombreBar, direccion };

  this.barService.crearBar(dto).subscribe({
    next: () => {

      console.log('[Panel] Bar creado correctamente');

      // 🧹 LIMPIAR INPUTS
      nombreBarInput.value = '';
      direccionInput.value = '';

      // ocultar formulario
      this.mostrarFormularioBar = false;

      // recargar bar
      if (this.authService.usuarioReal?.idUsuario) {
        this.authService
          .cargarBarPorUsuario(this.authService.usuarioReal.idUsuario)
          .subscribe();
      }
    },
    error: err => console.error(err)
  });
}
}

