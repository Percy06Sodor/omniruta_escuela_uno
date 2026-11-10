import { db, inicializarSesionWeb } from "./web_common.js";
import { 
  collection, 
  onSnapshot, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let escuelaIdActual = null;
let map;
let marcadoresCombis = {};

window.initMap = function() {
  const centroEscolares = { lat: -34.6037, lng: -58.3816 }; 
  map = new google.maps.Map(document.getElementById("mapaColegio"), {
    zoom: 13,
    center: centroEscolares,
    styles: [
      {
        featureType: "poi.school",
        elementType: "labels.icon",
        stylers: [{ visibility: "on" }]
      }
    ]
  });
};

inicializarSesionWeb((user, userData) => {
  escuelaIdActual = userData.idEscuela || "ESCUELA_CENTRO";
  escucharMetricasGlobales();
  escucharViajesEnTiempoReal();
});

function escucharMetricasGlobales() {
  onSnapshot(collection(db, "alumnos"), (snapshot) => {
    const el = document.getElementById('totalAlumnos');
    if (el) el.innerText = snapshot.size;
  });

  onSnapshot(collection(db, "rutas"), (snapshot) => {
    const el = document.getElementById('totalRutas');
    if (el) el.innerText = snapshot.size;
  });
}

function escucharViajesEnTiempoReal() {
  const q = collection(db, "viajesEscolares");

  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('tablaMonitoreoRutas');
    const totalActivasEl = document.getElementById('totalCombisActivas');
    
    if (!tbody) return;
    tbody.innerHTML = '';

    let activas = 0;

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay combis transmitiendo en este momento.</td></tr>`;
      if (totalActivasEl) totalActivasEl.innerText = "0";
      return;
    }

    snapshot.forEach(docSnap => {
      const v = docSnap.data();
      const idViaje = docSnap.id;

      if (v.estado === "EN_CURSO") activas++;

      if (v.latitudActual && v.longitudActual && window.google && map) {
        const pos = { lat: v.latitudActual, lng: v.longitudActual };
        
        if (marcadoresCombis[idViaje]) {
          marcadoresCombis[idViaje].setPosition(pos);
        } else {
          marcadoresCombis[idViaje] = new google.maps.Marker({
            position: pos,
            map: map,
            title: `Combi ${v.idRuta || idViaje}`,
            icon: {
              url: "../img/camion-de-carga.png", 
              scaledSize: new google.maps.Size(32, 32)
            }
          });
        }
      }

      let badgeEstado = 'bg-primary';
      if (v.estado === 'EN_CURSO') badgeEstado = 'bg-success animate-pulse';
      if (v.estado === 'FINALIZADO') badgeEstado = 'bg-secondary';

      tbody.innerHTML += `
        <tr>
          <td>
            <div class="fw-bold text-dark">${v.idRuta || '#' + idViaje.substring(0, 6)}</div>
            <div class="small text-muted">${v.turno || 'Turno Mañana'}</div>
          </td>
          <td>
            <div class="small">👤 ${v.chofer || 'Chofer Asignado'}</div>
          </td>
          <td>
            <div class="small fw-semibold text-danger">${v.patente || 'AF 123 CD'}</div>
          </td>
          <td>
            <div class="small font-monospace">${v.latitudActual ? `${v.latitudActual.toFixed(4)}, ${v.longitudActual.toFixed(4)}` : 'Buscando GPS...'}</div>
          </td>
          <td>
            <span class="badge ${badgeEstado} px-3 py-2 rounded-pill">${v.estado || 'PROGRAMADO'}</span>
          </td>
        </tr>
      `;
    });

    if (totalActivasEl) totalActivasEl.innerText = activas.toString();
  });
}