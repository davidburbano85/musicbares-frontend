import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActivarBoolService {
  // BehaviorSubject con valor inicial true
  private _activarPantalla$ = new BehaviorSubject<boolean>(true);

  // Observable público
  activarpantalla$ = this._activarPantalla$.asObservable();

  // Método para actualizar el valor
  setActivarPantalla(valor: boolean) {
    this._activarPantalla$.next(valor);
    console.log('Servicio: pantalla actual =', valor);
  }
}