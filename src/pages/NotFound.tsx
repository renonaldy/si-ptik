import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <div className="text-6xl font-black text-primary">404</div>
      <p className="text-muted-foreground">Halaman tidak ditemukan.</p>
      <Button asChild>
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
