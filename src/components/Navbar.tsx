import Link from "next/link";
import { Leaf } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <Leaf className="h-6 w-6 text-green-300" />
              <span>MultiAgo</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Si se necesita, aquí pueden ir enlaces. Por ahora solo el título. */}
          </div>
        </div>
      </div>
    </nav>
  );
}
