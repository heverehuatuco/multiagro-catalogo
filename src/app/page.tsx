"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/firebase/firestore";
import { Leaf, Loader2, Search, Filter, ChevronDown, Check } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const data = await getProducts();

      // Ordenar para que los productos sin foto aparezcan al final
      const sortedData = [...data].sort((a, b) => {
        const aHasImage = Boolean(a.imageUrl && a.imageUrl.trim() !== "");
        const bHasImage = Boolean(b.imageUrl && b.imageUrl.trim() !== "");

        if (aHasImage && !bHasImage) return -1;
        if (!aHasImage && bHasImage) return 1;
        return 0; // Mantiene el orden alfabético original para el resto
      });

      setProducts(sortedData);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Obtener clases únicas para el filtro
  const uniqueClasses = Array.from(new Set(products.map(p => p.clase).filter(Boolean)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.clase && product.clase.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(product.clase);

    return matchesSearch && matchesClass;
  });

  const toggleClassFilter = (clase: string) => {
    setSelectedClasses(prev =>
      prev.includes(clase)
        ? prev.filter(c => c !== clase)
        : [...prev, clase]
    );
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo_multiagro.png" 
              alt="Logo Multiagro" 
              className="h-24 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" 
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Catálogo de Abonos MULTIAGRO
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Mejora tus cultivos con nuestra selección y variedad de abonos de alta calidad.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12 flex flex-col sm:flex-row gap-4 relative">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm transition-shadow hover:shadow-md text-gray-900"
              placeholder="Buscar por nombre, descripción o clase..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative sm:w-64">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span>Filtrar por clase</span>
                {selectedClasses.length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedClasses.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-full min-w-[16rem] bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Clases
                </div>
                {uniqueClasses.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {uniqueClasses.map((clase, idx) => (
                      <label
                        key={idx}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedClasses.includes(clase)}
                          onChange={() => toggleClassFilter(clase)}
                        />
                        <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 mr-3 rounded border transition-colors ${selectedClasses.includes(clase) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {selectedClasses.includes(clase) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-700 truncate">{clase}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No hay clases disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? `No hay resultados para "${searchQuery}".` : "Vuelve a revisar más tarde."}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
