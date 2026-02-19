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


  constructor(private authService: AuthService) {}
//todo lo siguiente para cambiar el nombre del bar
  ngOnInit(): void {
    // 🔹 Revisamos si ya hay un usuario logueado y bar cargado
    const email = localStorage.getItem('usuarioEmail');
    if (!email) return;

    // 🔹 Cargamos el usuario
    this.authService.cargarUsuarioRealPorEmail(email).subscribe({
      next: () => {
        const idUsuario = this.authService.usuarioReal?.idUsuario;
        if (!idUsuario) return;

        // 🔹 Cargamos el bar del usuario
        this.authService.cargarBarPorUsuario(idUsuario).subscribe({
          next: barArray => {
            const bar: BarUsuario | null = barArray[0] || null;
            if (bar) {
              // 🔹 Actualizamos título con el nombre del bar
              document.title = `MusicBares - ${bar.nombreBar}`;
            } else {
              document.title = 'MusicBares';
            }
          },
          error: err => console.error('[AppComponent] Error cargando bar:', err)
        });
      },
      error: err => console.error('[AppComponent] Error cargando usuario:', err)
    });
  }
}
