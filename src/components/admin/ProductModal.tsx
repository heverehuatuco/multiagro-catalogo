"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/firebase/firestore";
import { uploadImage } from "@/lib/firebase/storage";
import { X, Upload, Loader2 } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id">, file: File | null) => Promise<void>;
  productToEdit?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSave, productToEdit }: ProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clase, setClase] = useState("");
  const [composicion, setComposicion] = useState("");
  const [price, setPrice] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setDescription(productToEdit.description || "");
      setClase(productToEdit.clase || "");
      setComposicion(productToEdit.composicion || "");
      setPrice(productToEdit.price ? productToEdit.price.toString() : "");
      setUnidadMedida(productToEdit.unidadMedida || "");
      setPreviewUrl(productToEdit.imageUrl || "");
      setFile(null);
    } else {
      setName("");
      setDescription("");
      setClase("");
      setComposicion("");
      setPrice("");
      setUnidadMedida("");
      setFile(null);
      setPreviewUrl("");
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(
        {
          name,
          description,
          clase,
          composicion,
          price: parseFloat(price) || 0,
          unidadMedida,
          imageUrl: previewUrl,
        },
        file
      );
      onClose();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                {productToEdit ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* 2. Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                ></textarea>
              </div>

              {/* 3. Clase */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Clase</label>
                <input
                  type="text"
                  required
                  value={clase}
                  onChange={(e) => setClase(e.target.value)}
                  placeholder="Ej: Orgánico, Químico..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* 4. Composición */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Composición</label>
                <textarea
                  required
                  rows={2}
                  value={composicion}
                  onChange={(e) => setComposicion(e.target.value)}
                  placeholder="Ej: Nitrógeno 10%, Fósforo 20%..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                ></textarea>
              </div>

              {/* 5. Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* 6. Unidad Medida */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                <input
                  type="text"
                  required
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  placeholder="Ej: Saco de 50kg, Litro..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              {/* 7. Imagen del Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                {previewUrl && (
                  <div className="mt-3 relative h-32 w-32 rounded-md overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Vista previa" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
