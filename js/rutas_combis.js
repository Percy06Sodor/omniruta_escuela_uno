import { db, inicializarSesionWeb } from "./web_common.js";
import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let escuelaIdActual = null;

inicializarSesionWeb((user, userData) => {
  escuelaIdActual = userData.idEscuela || "ESCUELA_CENTRO";
  cargarRutasYCombis();
});

const formRutaCombi = document.getElementById('formRutaCombi');

if (formRutaCombi) {
  formRutaCombi.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarRuta');
    btn.disabled = true;
    btn.innerText = "Guardando...";

    try {
      await addDoc(collection(db, "rutas"), {
        nombreRuta: document.getElementById('nombreRuta').value,
        turno: document.getElementById('turnoRuta').value,
        modeloCombi: document.getElementById('modeloCombi').value,
        patente: document.getElementById('patenteCombi').value.toUpperCase(),
        emailChofer: document.getElementById('emailChofer').value,
        celadora: document.getElementById('celadoraRuta').value,
        idEscuela: escuelaIdActual,
        estado: "PROGRAMADO",
        creadoEl: new Date().toISOString()
      });

      formRutaCombi.reset();
      alert("Ruta y combi asignadas correctamente.");
    } catch (error) {
      console.error("Error al registrar la ruta:", error);
      alert("Hubo un error al registrar la ruta.");
    } finally {
      btn.disabled = false;
      btn.innerText = "Registrar Ruta y Asignar Vehículo";
    }
  });
}

function cargarRutasYCombis() {
  const q = query(collection(db, "rutas"), orderBy("creadoEl", "desc"));

  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('tablaRutasCombis');
    const contador = document.getElementById('contadorRutas');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (contador) contador.innerText = `Rutas Activas: ${snapshot.size}`;

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay rutas asignadas a la flota todavía.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const r = docSnap.data();
      let badgeEstado = 'bg-secondary';
      if (r.estado === 'EN_CURSO') badgeEstado = 'bg-success';
      if (r.estado === 'PROGRAMADO') badgeEstado = 'bg-primary';

      tbody.innerHTML += `
        <tr>
          <td>
            <div class="fw-bold text-dark">${r.nombreRuta}</div>
            <div class="small text-muted">${r.turno}</div>
          </td>
          <td>
            <div class="fw-semibold text-danger">${r.patente}</div>
            <div class="small text-muted">${r.modeloCombi}</div>
          </td>
          <td>
            <div class="small"><strong>Chofer:</strong> ${r.emailChofer}</div>
            <div class="small text-muted"><strong>Celadora:</strong> ${r.celadora}</div>
          </td>
          <td>
            <span class="badge ${badgeEstado} px-3 py-2 rounded-pill">${r.estado}</span>
          </td>
        </tr>
      `;
    });
  });
}