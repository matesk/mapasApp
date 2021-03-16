import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface Marcador {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}
@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        height: 100%;
        width: 100%;
      }

      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }
      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  centerMap: [number, number] = [-0.8966143024038146, 41.66025370621437];
  //Array Marcadores
  marcadores: Marcador[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.centerMap,
      zoom: this.zoomLevel,
    });

    this.reedMarkerLocalStorage();

    // const markerHtml: HTMLElement = document.createElement('div');
    // markerHtml.innerHTML = 'Marcador personalizado';

    // const marker = new mapboxgl.Marker()
    //   .setLngLat(this.centerMap)
    //   .addTo(this.mapa);
  }

  addNewMarker() {
    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color,
    })
      .setLngLat(this.centerMap)
      .addTo(this.mapa);

    this.marcadores.push({ color, marker: nuevoMarcador });

    this.saveMarkerLocalStorage();

    nuevoMarcador.on('dragend', () => {
      this.saveMarkerLocalStorage();
    });
  }

  moveToMarker(marcador: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marcador.getLngLat(),
    });
  }

  deleteMarker(i: number) {
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);
    this.saveMarkerLocalStorage();
  }

  saveMarkerLocalStorage() {
    const lngLatArr: Marcador[] = [];

    this.marcadores.forEach((m) => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({ color: color, centro: [lng, lat] });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
  }

  reedMarkerLocalStorage() {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: Marcador[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );

    lngLatArr.forEach((m) => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat(m.centro!)
        .addTo(this.mapa);

      this.marcadores.push({
        marker: newMarker,
        color: m.color,
      });

      newMarker.on('dragend', () => {
        this.saveMarkerLocalStorage();
      });
    });
  }
}
