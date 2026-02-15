import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  //decalramos cariable sin inicializar
  formularioRegistro;
  //inyectamos formbuilder y autservice
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formularioRegistro = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]]
    });
  }



  registrar() {

    // Si el formulario es inválido, detenemos la ejecución
    // Evita enviar datos incompletos al backend
    if (this.formularioRegistro.invalid) return;

    // Extraemos los valores del formulario reactivo
    // correo y clave vienen de los FormControl definidos
    const { correo, clave } = this.formularioRegistro.value;

    // Llamamos al servicio de autenticación
    // enviando correo y contraseña al método registrar()
    this.authService.registrar(correo!, clave!)
      .subscribe({

        // Se ejecuta cuando Supabase responde correctamente
        next: resp => {

          // Mostramos en consola la respuesta del servidor
          // útil para depuración y aprendizaje
          console.log('usuario creado en supa', resp);

          // Mostramos mensaje visual al usuario
          // indicando que el registro fue exitoso
          alert('Usuario registrado correctamente.');
          //redirigimos a login
          this.router.navigate(['/login']);

        },

        // Se ejecuta si ocurre un error en la petición
        error: err => {

          // Mostramos el error técnico en consola
          // para poder analizar qué falló
          console.error(err);

          // Mostramos mensaje amigable al usuario
          alert('Error al registrar usuario');

        }

      });
  }


}


