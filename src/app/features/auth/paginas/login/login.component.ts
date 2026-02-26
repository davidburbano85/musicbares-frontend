import { RespuestaLogin } from './../../../../core/servicios/auth.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Permite usar *ngIf y *ngFor
import { AuthService } from '../../../../core/servicios/auth.service';
import { Router } from '@angular/router'; // Para navegar al panel después del login
import { ChangeDetectorRef } from '@angular/core';

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
  iniciarSesi: boolean = false;
  mostrar = false;
  // Inyectamos FormBuilder, AuthService y Router
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef // <- para forzar renderizado
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
  // Login.component.ts
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
        console.log('[LOGIN] Login correcto', res);

        // 🔹 Guardamos token principal en localStorage
        localStorage.setItem('sb-auth-token', JSON.stringify(res));

        // 🔹 Guardamos email del usuario
        localStorage.setItem('usuarioEmail', email);

        // 🔹 Cargamos el bar del usuario por correo
        this.authService.cargarBarPorCorreo(email).subscribe({
          next: bar => {
            if (bar && bar.idBar) {
              // 🔹 Guardamos idBar en localStorage
              localStorage.setItem('idBar', bar.idBar.toString());

              // 🔹 Guardamos nombre del bar
              localStorage.setItem('nombreBar', bar.nombreBar.toString());
              console.log('[INICIARSESION] nombre Bar: ', bar.nombreBar);

            } else {
              console.warn('[LOGIN] Usuario sin bar asignado');
            }



            if (bar?.nombreBar?.trim().length) {
              this.iniciarSesi = true;
              console.log('[INICIARSESION] nombre Bar: ', bar.nombreBar);
              this.router.navigate(['/panel'])
            } else {
              this.iniciarSesi = false;
              console.log('[INICIARSESION] Usuario sin bar asignado o nombre vacío');
             // this.router.navigate(['/login']);
            }
            // 🔹 Redirigimos al panel
          },
          error: err => {
            console.error('[LOGIN] Error cargando bar por correo:', err);
            // 🔹 Aunque falle la carga del bar, redirigimos al panel

            //this.router.navigate(['/panel']);
            this.router.navigate(['/validacion']);
            this.cd.detectChanges();
          }
        });
      },
      error: err => {
        console.error('[LOGIN] Error login', err);
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
