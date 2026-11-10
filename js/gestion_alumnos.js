import { db, inicializarSesionWeb } from "./web_common.js";
import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let escuelaIdActual = null;

inicializarSesionWeb((user, userData) => {
  escuelaIdActual = userData.idEscuela || "ESCUELA_CENTRO";
  cargarListaAlumnos();
});

const formAlumno = document.getElementById('formAlumno');

if (formAlumno) {
  formAlumno.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarAlumno');
    btn.disabled = true;

    try {
      await addDoc(collection(db, "alumnos"), {
        nombre: document.getElementById('nombreAlumno').value,
        nivelEscolar: document.getElementById('nivelEscolar').value,
        planSuscrito: document.getElementById('planSuscrito').value,
        direccion: document.getElementById('direccionAlumno').value,
        emailTutor: document.getElementById('emailTutor').value,
        idEscuela: escuelaIdActual,
        creadoEl: new Date().toISOString()
      });

      formAlumno.reset();
      alert("Alumno registrado correctamente.");
    } catch (error) {
      console.error("Error al registrar alumno:", error);
      alert("Error al guardar alumno.");
    } finally {
      btn.disabled = false;
    }
  });
}

function cargarListaAlumnos() {
  const q = query(collection(db, "alumnos"), orderBy("creadoEl", "desc"));

  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById('tablaAlumnos');
    const contador = document.getElementById('contadorAlumnos');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (contador) contador.innerText = `Total: ${snapshot.size}`;

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay alumnos registrados aún.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const a = docSnap.data();
      let badgePlan = 'bg-secondary';
      if (a.planSuscrito === 'MEDIO') badgePlan = 'bg-info text-dark';
      if (a.planSuscrito === 'PREMIUM') badgePlan = 'bg-warning text-dark';

      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">${a.nombre}</td>
          <td>${a.nivelEscolar}</td>
          <td><span class="badge ${badgePlan}">${a.planSuscrito}</span></td>
          <td class="small">${a.direccion}</td>
          <td class="small text-muted">${a.emailTutor}</td>
        </tr>
      `;
    });
  });
}