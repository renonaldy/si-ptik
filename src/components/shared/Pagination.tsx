import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, pageCount, onPage }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
      <span className="text-xs text-muted-foreground">
        Halaman {page} dari {pageCount}
      </span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          Berikutnya <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
