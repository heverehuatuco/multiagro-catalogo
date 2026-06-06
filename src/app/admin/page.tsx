"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategoryPriorities, saveCategoryPriorities, Product } from "@/lib/firebase/firestore";
import { uploadImage, deleteImage } from "@/lib/firebase/storage";
import { ProductModal } from "@/components/admin/ProductModal";
import { CategoryPriorityModal } from "@/components/admin/CategoryPriorityModal";
import Image from "next/image";
import * as xlsx from "xlsx";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [categoryPriorities, setCategoryPriorities] = useState<string[]>([]);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const fetchProducts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const data = await getProducts();
    const priorities = await getCategoryPriorities();
    setProducts(data);
    setCategoryPriorities(priorities);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setProductToEdit(product);
    } else {
      setProductToEdit(null);
    }
    setIsModalOpen(true);
  };

  const handleSavePriorities = async (priorities: string[]) => {
    await saveCategoryPriorities(priorities);
    setCategoryPriorities(priorities);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = xlsx.utils.sheet_to_json(worksheet) as any[];
      setImportProgress({ current: 0, total: jsonData.length });

      let importedCount = 0;

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        const getVal = (keys: string[]) => {
           for (const k of Object.keys(row)) {
             const cleanK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
             if (keys.includes(cleanK)) return row[k];
           }
           return "";
        };

        const name = getVal(["producto", "nombre", "name"]);
        if (!name) continue; 

        const description = getVal(["descripcion", "description", "desc"]) || "";
        const clase = getVal(["clase", "categoria", "category"]) || "";
        const composicion = getVal(["composicion", "composition", "comp"]) || "";
        const priceRaw = getVal(["precio", "price"]);
        const price = parseFloat(priceRaw) || 0;
        const unidadMedida = getVal(["unidad de medida", "unidad de medida", "unidadmedida", "medida", "unidad"]) || "";

        await createProduct({
          name: String(name),
          description: String(description),
          clase: String(clase),
          composicion: String(composicion),
          price: price,
          unidadMedida: String(unidadMedida),
          imageUrl: "" 
        });

        importedCount++;
        setImportProgress(prev => ({ ...prev, current: i + 1 }));
      }
      
      alert(`¡Importación completada! Se importaron ${importedCount} productos de ${jsonData.length} filas.`);
      await fetchProducts(false);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al importar el archivo Excel.");
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerImageUpload = (productId: string) => {
    setUploadingImageId(productId);
    if (imageUploadInputRef.current) {
      imageUploadInputRef.current.click();
    }
  };

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingImageId) {
      setUploadingImageId(null);
      return;
    }

    try {
      const product = products.find(p => p.id === uploadingImageId);
      const newImageUrl = await uploadImage(file);

      if (product && product.imageUrl) {
        await deleteImage(product.imageUrl).catch(console.error);
      }

      await updateProduct(uploadingImageId, { imageUrl: newImageUrl });
      await fetchProducts(false);
    } catch (error) {
      console.error(error);
      alert("Error al subir la imagen");
    } finally {
      setUploadingImageId(null);
      if (imageUploadInputRef.current) {
        imageUploadInputRef.current.value = "";
      }
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, "id">, file: File | null) => {
    let imageUrl = productData.imageUrl;

    if (file) {
      imageUrl = await uploadImage(file);
      if (productToEdit && productToEdit.imageUrl && productToEdit.imageUrl !== imageUrl) {
        await deleteImage(productToEdit.imageUrl);
      }
    }

    if (productToEdit && productToEdit.id) {
      await updateProduct(productToEdit.id, { ...productData, imageUrl });
    } else {
      await createProduct({ ...productData, imageUrl });
    }
    
    await fetchProducts(false);
  };

  const handleDeleteProduct = async (id: string, imageUrl: string) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteProduct(id);
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      await fetchProducts(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Abonos</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={imageUploadInputRef} 
            onChange={handleQuickImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {importing ? `Importando (${importProgress.current}/${importProgress.total})` : "Importar Excel"}
          </button>
          
          <button
            onClick={() => setIsPriorityModalOpen(true)}
            disabled={importing}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            Priorizar Categorías
          </button>
          
          <button
            onClick={() => handleOpenModal()}
            disabled={importing}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative rounded overflow-hidden bg-gray-100 border border-gray-200">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400 m-auto mt-2.5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.clase}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.unidadMedida}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => product.id && triggerImageUpload(product.id)}
                        disabled={uploadingImageId === product.id}
                        className="text-emerald-600 hover:text-emerald-900 mr-4"
                        title="Subir imagen"
                      >
                        {uploadingImageId === product.id ? (
                          <Loader2 className="w-4 h-4 inline animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4 inline" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => product.id && handleDeleteProduct(product.id, product.imageUrl)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No tienes productos registrados.</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
      
      <CategoryPriorityModal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        uniqueClasses={Array.from(new Set(products.map(p => p.clase).filter(Boolean)))}
        initialPriorities={categoryPriorities}
        onSave={handleSavePriorities}
      />
    </div>
  );
}
