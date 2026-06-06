import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "./config";

// Interfaz para el modelo de Producto
export interface Product {
  id?: string;
  name: string;
  price: number;
  unidadMedida: string;
  description: string;
  clase: string;
  composicion: string;
  imageUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = "products";
const productsCollection = collection(db, COLLECTION_NAME);

/**
 * Obtener todos los productos (para el catálogo y admin)
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const q = query(productsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    // Ordenar alfabéticamente por nombre de producto (ignora mayúsculas/minúsculas y acentos)
    products.sort((a, b) => 
      (a.name || "").localeCompare(b.name || "", 'es', { sensitivity: 'base' })
    );

    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

/**
 * Obtener un producto específico por ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return null;
  }
}

/**
 * Crear un nuevo producto
 */
export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const docRef = await addDoc(productsCollection, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
}

/**
 * Actualizar un producto existente
 */
export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
}

/**
 * Eliminar un producto
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
}
