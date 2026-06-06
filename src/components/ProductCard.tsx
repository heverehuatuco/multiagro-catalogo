"use client";

import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import { Product } from "@/lib/firebase/firestore";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const WHATSAPP_NUMBER = "51930997894";
  const message = encodeURIComponent(`Hola, estoy interesado en el producto: ${product.name}`);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <>
      <div 
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-col h-full"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-48 w-full bg-gray-50 flex-shrink-0">
          {product.clase && (
            <span className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
              {product.clase}
            </span>
          )}
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
          </div>
          <p className="text-gray-500 text-sm mb-2 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>
          <div className="text-gray-600 text-xs font-medium mb-4 space-y-1">
            <p className="line-clamp-1 text-gray-500">Comp: {product.composicion || "N/A"}</p>
          </div>
          <div className="mt-auto">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-full gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar
            </a>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full transition-colors shadow-sm"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            
            <div className="overflow-y-auto">
              <div className="relative h-64 sm:h-80 w-full bg-gray-50">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h2>
                  {product.clase && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {product.clase}
                    </span>
                  )}
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Descripción</h4>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                    {product.description || "No hay descripción disponible."}
                  </p>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Composición</h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {product.composicion || "No especificada."}
                  </p>
                </div>

                <div className="flex justify-end">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors w-full sm:w-auto shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
