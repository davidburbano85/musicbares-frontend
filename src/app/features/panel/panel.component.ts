import { Component } from '@angular/core';
// Importamos el decorador Component que permite definir un componente Angular

@Component({
  selector: 'app-panel',
  // Nombre de la etiqueta HTML que representará este componente

  standalone: true,
  // Indicamos que el componente es standalone (Angular moderno sin módulos)

  templateUrl: './panel.component.html',
  // Ruta del archivo HTML asociado al componente

  styleUrls: ['./panel.component.scss']
  // Ruta del archivo de estilos del componente
})
export class PanelComponent {
  // Clase del componente principal del panel del sistema

  titulo: string = 'Panel principal';
  // Variable que almacenará el título visible en la vista
  // Se define como string para mantener tipado fuerte (buena práctica)
}
