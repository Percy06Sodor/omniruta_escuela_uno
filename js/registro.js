import { auth, db } from "./web_common.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formRegistroEscuela = document.getElementById('formRegistroEscuela');

if (formRegistroEscuela) {
  formRegistroEscuela.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreEscuela = document.getElementById('nombreEscuela').value.trim();
    const direccionEscuela = document.getElementById('direccionEscuela').value.trim();
    const telefonoEscuela = document.getElementById('telefonoEscuela').value.trim();

    const nombreAdmin = document.getElementById('nombreAdmin').value.trim();
    const email = document.getElementById('emailRegistro').value.trim();
    const password = document.getElementById('passwordRegistro').value.trim();
    const btn = document.getElementById('btnRegistro');

    btn.disabled = true;
    btn.innerText = "Registrando institución...";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const escuelaDocRef = await addDoc(collection(db, "escuelas"), {
        nombre: nombreEscuela,
        direccion: direccionEscuela,
        telefono: telefonoEscuela,
        emailContacto: email,
        abonoMensual: 0.0,
        creadaEl: new Date().toISOString()
      });

      const idEscuela = escuelaDocRef.id;

      await setDoc(doc(db, "usuarios", uid), {
        uid: uid,
        nombre: nombreAdmin,
        email: email,
        telefono: telefonoEscuela,
        rol: "ADMIN_ESCUELA",
        idEscuela: idEscuela,
        creadoEl: new Date().toISOString()
      });

      alert("¡Registro exitoso! Su institución ha sido dada de alta correctamente.");
      window.location.href = "dashboard_escuela.html";

    } catch (error) {
      console.error("Error al registrar escuela:", error);
      let msj = "Error al completar el registro.";
      if (error.code === 'auth/email-already-in-use') {
        msj = "El correo electrónico ya se encuentra registrado.";
      }
      alert(msj);
      btn.disabled = false;
      btn.innerText = "Registrar Escuela y Crear Cuenta";
    }
  });
}