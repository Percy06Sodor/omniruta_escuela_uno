import { db, inicializarSesionWeb } from "./web_common.js";
import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let escuelaIdActual = null;

inicializarSesionWeb((user, userData) => {
  escuelaIdActual = userData.idEscuela || "ESCUELA_CENTRO";
  cargarSolicitudesExcursiones();
});

const formExcursion = document.getElementById('formExcursion');

if (formExcursion) {
  formExcursion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarExcursion');
    btn.disabled = true;
    btn.innerText = "Enviando solicitud...";

    try {
      await addDoc(collection(db, "solicitudesExcursion"), {
        titulo: document.getElementById('tituloExcursion').value,
        destino: document.getElementById('destinoExcursion').value,
        fecha: document.getElementById('fechaExcursion').value,
        horaSalida: document.getElementById('horaSalida').value,
        horaRegreso: document.getElementById('horaRegreso').value,
        cantidadAlumnos: parseInt(document.getElementById('cantidadAlumnos').value),
        docentesCargo: document.getElementById('docentesCargo').value,
        idEscuela: escuelaIdActual,
        estado: "PENDIENTE",
        creadoEl: new Date().toISOString()
      });

      formExcursion.reset();
      alert("Solicitud de excursión registrada correctamente.");
    } catch (error) {
      console.error("Error al registrar excursión:", error);
      alert("Error al enviar la solicitud.");
    } finally {
      btn.disabled = false;
      btn.innerText = "Enviar Solicitud de Combis";
    }
  });
}

function cargarSolicitudesExcursiones() {
  const q = query(collection(db, "solicitudesExcursion"), orderBy("creadoEl", "desc"));

  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('tablaExcursiones');
    const contador = document.getElementById('contadorExcursiones');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (contador) contador.innerText = `Total Solicitudes: ${snapshot.size}`;

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No se registran solicitudes de excursión.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const ex = docSnap.data();
      let badgeEstado = 'bg-warning text-dark';
      if (ex.estado === 'APROBADA') badgeEstado = 'bg-success text-white';
      if (ex.estado === 'REALIZADA') badgeEstado = 'bg-secondary text-white';

      tbody.innerHTML += `
        <tr>
          <td>
            <div class="fw-bold text-dark">${ex.titulo}</div>
            <div class="small text-muted">📍 ${ex.destino}</div>
          </td>
          <td>
            <div class="small">📅 ${ex.fecha}</div>
            <div class="small text-muted">⏰ ${ex.horaSalida} a ${ex.horaRegreso} hs</div>
          </td>
          <td>
            <div class="small">👥 <strong>${ex.cantidadAlumnos} alumnos</strong></div>
            <div class="small text-muted">👨‍🏫 ${ex.docentesCargo}</div>
          </td>
          <td>
            <span class="badge ${badgeEstado} px-3 py-2 rounded-pill">${ex.estado}</span>
          </td>
        </tr>
      `;
    });
  });
}