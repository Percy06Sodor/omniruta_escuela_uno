import { auth, db } from "./web_common.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formLoginWeb = document.getElementById('formLoginWeb');

if (formLoginWeb) {
  formLoginWeb.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('emailLogin').value.trim();
    const password = document.getElementById('passwordLogin').value.trim();
    const btn = document.getElementById('btnLogin');

    btn.disabled = true;
    btn.innerText = "Verificando credenciales...";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "usuarios", uid));

      if (userDoc.exists() && userDoc.data().rol === "ADMIN_ESCUELA") {
        window.location.href = "dashboard_escuela.html";
      } else {
        alert("Acceso denegado: El usuario no cuenta con perfil de Administrador de Escuela.");
        btn.disabled = false;
        btn.innerText = "Iniciar Sesión";
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de autenticación. Verifique su correo y contraseña.");
      btn.disabled = false;
      btn.innerText = "Iniciar Sesión";
    }
  });
}