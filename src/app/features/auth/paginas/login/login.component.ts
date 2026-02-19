import { RespuestaLogin } from './../../../../core/servicios/auth.service';
// import { AuthService } from './../../../../core/servicios/auth.service';
// import { Component } from '@angular/core';
// import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent {

//   // Declaramos el formulario sin inicializar
//   formularioLogin!: FormGroup;

//   // Angular inyecta FormBuilder aquí
//   constructor(private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router


//   ) {

//     // Ahora sí podemos usar fb porque ya existe
//     this.formularioLogin = this.fb.group({

//       // Campo correo con validaciones
//       correo: ['', [Validators.required, Validators.email]],

//       // Campo clave con validaciones
//       clave: ['', [Validators.required, Validators.minLength(6)]]

//     });
//   }

//   // Método al enviar formulario
//   iniciarSesion() {

//     // Si el formulario es inválido no hacemos nada
//     // Esto evita enviar datos incompletos al servidor
//     if (this.formularioLogin.invalid) return;

//     // Extraemos los valores del formulario reactivo
//     const { correo, clave } = this.formularioLogin.value;

//     // Llamamos al servicio de autenticación
//     // Este se comunica con Supabase para validar usuario
//     this.authService.iniciarSesion(correo!, clave!)
//       .subscribe({

//         next: resp => {
//           // Se ejecuta si el login fue exitoso

//           console.log('Login correcto', resp);

//           // Mostramos respuesta en consola para depuración
//           // Guardamos el token JWT en el navegador

//           // Esto permitirá que el AuthGuard detecte sesión activa
//           localStorage.setItem('sb-auth-token', resp.access_token);

//           this.router.navigate(['/panel']);
//           // Redirigimos al usuario al panel principal
//           // Esto solo ocurre si la autenticación fue válida
//         },

//         error: err => {
//           // Se ejecuta si el login falla

//           console.error(err);
//           // Mostramos error en consola para depuración

//           alert('Credenciales incorrectas');
//           // Mostramos mensaje al usuario
//         }
//       });
//   }



// }



import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Permite usar *ngIf y *ngFor
import { AuthService } from '../../../../core/servicios/auth.service';
import { Router } from '@angular/router'; // Para navegar al panel después del login

@Component({
  selector: 'app-login',                   // Nombre del componente
  templateUrl: './login.component.html',   // Ruta al HTML
  styleUrls: ['./login.component.scss'],   // Ruta al SCSS
  standalone: true,                        // Componente independiente, no necesita NgModule
  imports: [
    CommonModule,          // Para usar *ngIf, *ngFor
    ReactiveFormsModule    // Para usar formGroup y formControlName
  ]
})
export class LoginComponent {

  // FormGroup que representa el formulario reactivo
  loginForm: FormGroup;

  // Mensaje de error que se muestra en el template
  errorMessage: string = '';

  // Inyectamos FormBuilder, AuthService y Router
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializamos el formulario con campos 'email' y 'password' y sus validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],   // Email obligatorio y con formato válido
      password: ['', Validators.required]                     // Password obligatorio
    });
  }

  /**
   * Función que se ejecuta al hacer click en "Iniciar sesión"
   */
  iniciarSesion() {
    // Limpiamos cualquier mensaje de error previo
    this.errorMessage = '';

    // Verificamos que el formulario sea válido
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    // Extraemos los valores del formulario
    const { email, password } = this.loginForm.value;

    // Llamamos al servicio para iniciar sesión en Supabase
    this.authService.iniciarSesion(email, password).subscribe({
      next: (res: RespuestaLogin) => {
        console.log('Login correcto', res);

        // 🔹 Guardamos el token principal en localStorage
        localStorage.setItem('sb-auth-token', JSON.stringify(res));

        // 🔹 Guardamos email para mostrarlo en el panel
        localStorage.setItem('usuarioEmail', email);

        // 🔹 Guardamos nombre del bar (aquí usamos el email antes del @ como nombre temporal)
        localStorage.setItem('nombreBar', email.split('@')[0]);

        // 🔹 Redirigimos al panel principal
        this.router.navigate(['/panel']);
      },
      error: (err) => {
        console.error('Error login', err);

        // Mostramos mensaje de error en el template
        this.errorMessage = err.error_description || 'Usuario o contraseña incorrectos';
      }
    });
  }

  /**
   * Función auxiliar para acceder a los controles del formulario desde el HTML
   */
  get f() {
    return this.loginForm.controls;
  }
  /**
 * Redirige al usuario al componente de registro
 */
  irARegistro() {
    this.router.navigate(['/registro']); // Aquí  '/registro' y apunta a app-registro
  }
}
