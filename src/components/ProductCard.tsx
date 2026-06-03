import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Product } from "@/lib/firebase/firestore";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const WHATSAPP_NUMBER = "51980590842"; // Añadiendo 51 asumiendo Perú por el formato, o simplemente 980590842
  const message = encodeURIComponent(`Hola, estoy interesado en el producto: ${product.name}`);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-48 w-full bg-gray-50">
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
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {product.category}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>
        <p className="text-gray-600 text-xs font-medium mb-4">
          Presentación: {product.presentation || "No especificada"}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Consultar
          </a>
        </div>
      </div>
    </div>
  );
}
