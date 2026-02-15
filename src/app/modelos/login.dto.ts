// Esta interfaz define la estructura de los datos
// que enviaremos al backend cuando el usuario haga login
export interface LoginDTO {

  // Correo del usuario
  // Debe coincidir con el nombre que espera el backend
  correo: string;

  // Contraseña del usuario
  // Se mantiene como string porque se envía en el body del request
  password: string;
}
