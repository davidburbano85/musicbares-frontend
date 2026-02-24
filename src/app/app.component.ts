import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService, BarUsuario } from './core/servicios/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'musicbares-frontend';
  anioActual = new Date().getFullYear();


  constructor(private authService: AuthService) { }
  //todo lo siguiente para cambiar el nombre del bar
  ngOnInit(): void {

    // 🔹 Revisamos si hay un usuario logueado
    const email = localStorage.getItem('usuarioEmail');
    if (!email) {
      console.warn('[DEBUG APP] No hay email en localStorage');
      return;
    }

    // 🔹 Cargamos el bar directamente por correo
    this.authService.cargarBarPorCorreo(email).subscribe({

      // 🟢 Bar recibido correctamente
      next: bar => {

        console.log('[DEBUG APP] Bar recibido por correo:', bar);

        if (bar && bar.idBar) {
          // 🔹 Guardamos idBar en localStorage para uso global
          localStorage.setItem('idBar', bar.idBar.toString());

          // 🔹 Actualizamos título con el nombre del bar
          document.title = `MusicBares - ${bar.nombreBar}`;

        } else {
          console.warn('[DEBUG APP] Usuario sin bar asignado → título genérico');
          document.title = 'MusicBares';
        }
      },

      // 🔴 Error cargando bar
      error: err => {
        console.error('[DEBUG APP] Error cargando bar por correo:', err);
        document.title = 'MusicBares';
      }
    });
  }
}
