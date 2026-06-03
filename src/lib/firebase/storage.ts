import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

/**
 * Subir una imagen a Firebase Storage y obtener la URL
 */
export async function uploadImage(file: File, folderName: string = "products"): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folderName}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
}

/**
 * Eliminar una imagen de Firebase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Si la imagen es una URL de prueba o no proviene de Firebase Storage, saltar
    if (!imageUrl.includes("firebasestorage.googleapis.com")) return;

    // Extraer el path del archivo desde la URL
    // Ejemplo de URL: https://firebasestorage.googleapis.com/v0/b/bucket/o/products%2F123_image.jpg?...
    const urlObj = new URL(imageUrl);
    const pathDecoded = decodeURIComponent(urlObj.pathname);
    const pathParts = pathDecoded.split("/o/");
    if (pathParts.length > 1) {
      const filePath = pathParts[1];
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    }
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    // No lanzar error aquí para no romper el borrado del producto en Firestore
  }
}
