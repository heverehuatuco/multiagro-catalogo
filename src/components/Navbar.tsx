import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight">
              <img
                src="/logo_multiagro.png"
                alt="Logo Multiagro"
                className="h-10 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
              <span>MULTIAGRO</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium hover:text-green-200 transition-colors">
              Acceder
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
