import { AuthService } from './../../../../core/servicios/auth.service';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  // Declaramos el formulario sin inicializar
  formularioLogin!: FormGroup;

  // Angular inyecta FormBuilder aquí
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router


  ) {

    // Ahora sí podemos usar fb porque ya existe
    this.formularioLogin = this.fb.group({

      // Campo correo con validaciones
      correo: ['', [Validators.required, Validators.email]],

      // Campo clave con validaciones
      clave: ['', [Validators.required, Validators.minLength(6)]]

    });
  }

  // Método al enviar formulario
  iniciarSesion() {

    // Si el formulario es inválido no hacemos nada
    // Esto evita enviar datos incompletos al servidor
    if (this.formularioLogin.invalid) return;

    // Extraemos los valores del formulario reactivo
    const { correo, clave } = this.formularioLogin.value;

    // Llamamos al servicio de autenticación
    // Este se comunica con Supabase para validar usuario
    this.authService.iniciarSesion(correo!, clave!)
      .subscribe({

        next: resp => {
          // Se ejecuta si el login fue exitoso

          console.log('Login correcto', resp);

          // Mostramos respuesta en consola para depuración
          // Guardamos el token JWT en el navegador
          
          // Esto permitirá que el AuthGuard detecte sesión activa
          localStorage.setItem('sb-auth-token', resp.access_token);

          this.router.navigate(['/panel']);
          // Redirigimos al usuario al panel principal
          // Esto solo ocurre si la autenticación fue válida
        },

        error: err => {
          // Se ejecuta si el login falla

          console.error(err);
          // Mostramos error en consola para depuración

          alert('Credenciales incorrectas');
          // Mostramos mensaje al usuario
        }
      });
  }



}
