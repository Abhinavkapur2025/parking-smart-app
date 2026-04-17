import { Link, useLocation } from "wouter";
import { CarFront, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CarFront className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary font-display">SmartPark</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Find Parking
          </Link>
          <Link href="/admin">
            <Button variant={location === "/admin" ? "default" : "outline"} size="sm" className="gap-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Operator Portal
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
