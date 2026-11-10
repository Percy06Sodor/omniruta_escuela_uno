import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIwAlkkZ0X60SeTizZZlh8TM2VZsOJ3wo",
    authDomain: "omniruta-escolar.firebaseapp.com",
    projectId: "omniruta-escolar",
    storageBucket: "omniruta-escolar.firebasestorage.app",
    messagingSenderId: "1099468107290",
    appId: "1:1099468107290:web:9adee7bb5b0b162a446ba3",
    measurementId: "G-LS7JZ091RD"
  };

  export const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);
  
  export function inicializarSesionWeb(callback) {
    const userNombreSpan = document.getElementById('userNombre');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists() && userDoc.data().rol === "ADMIN_ESCUELA") {
          if (userNombreSpan) {
            userNombreSpan.innerText = userDoc.data().nombre || user.email;
          }
          if (callback) callback(user, userDoc.data());
        } else {
          alert("Acceso denegado: Se requieren permisos de administración escolar.");
          await signOut(auth);
          window.location.href = "login.html";
        }
      } else {
        window.location.href = "login.html";
      }
    });
  
    if (btnCerrarSesion) {
      btnCerrarSesion.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
      });
    }
  }