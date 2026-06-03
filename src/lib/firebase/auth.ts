import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./config";

/**
 * Iniciar sesión
 * Transformamos el username a un correo dummy para usar Firebase Auth estándar.
 */
export async function loginAdmin(username: string, password: string) {
  try {
    // Convertimos el "username" a un correo.
    // Ej: si escribe "admin" -> correo: admin@catalogo.com
    const fakeEmail = `${username.toLowerCase()}@catalogo.com`;
    // En Firebase Console debes crear este usuario y su contraseña
    const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

/**
 * Cerrar sesión
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
}
