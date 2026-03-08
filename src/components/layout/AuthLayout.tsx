import { Outlet, Link } from "react-router-dom";
import { Droplets } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
        >
          <Droplets className="h-8 w-8" />
          <span className="text-xl font-bold">NITER Blood Bridge</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-sm text-muted-foreground">
        <p>
          National Institute of Technical Teachers' Education and Research,
          Bangladesh
        </p>
      </footer>
    </div>
  );
}
