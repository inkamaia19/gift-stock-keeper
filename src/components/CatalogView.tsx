// --- START OF FILE src/components/CatalogView.tsx ---

import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, List, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Item, ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";
import { ItemsTable } from "@/components/ItemsTable";
import { GalleryView } from "@/components/GalleryView";

type FilterType = 'all' | 'available' | 'out of stock' | 'services';
type ViewMode = 'list' | 'grid';

interface CatalogViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allItems: Item[];
  itemsWithCalculated: ItemWithCalculated[];
  onSell: (item: ItemWithCalculated) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
}

export const CatalogView = ({ open, onOpenChange, allItems, itemsWithCalculated, onSell, onUpdate, onDelete }: CatalogViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try { const v = localStorage.getItem('ui.catalog.view'); return (v === 'list' || v === 'grid') ? v : 'grid'; } catch { return 'grid'; }
  });
  const [filter, setFilter] = useState<FilterType>(() => {
    try { const v = localStorage.getItem('ui.catalog.filter') as FilterType | null; return v ?? 'all'; } catch { return 'all'; }
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { try { localStorage.setItem('ui.catalog.view', viewMode); } catch {} }, [viewMode]);
  useEffect(() => { try { localStorage.setItem('ui.catalog.filter', filter); } catch {} }, [filter]);

  const filteredItems = useMemo(() => {
    return itemsWithCalculated
      .filter(item => {
        if (filter === 'all') return true;
        if (filter === 'services') return item.type === 'service';
        if (item.type === 'service') return false;
        
        const productData = item as ProductWithCalculated;
        if (filter === 'available') return productData.currentStock > 0;
        if (filter === 'out of stock') return productData.currentStock === 0;
        return true;
      })
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [itemsWithCalculated, filter, searchTerm]);

  const handleTableSell = (itemId: string, quantity: number, pricePerUnit: number, commissionAmount: number) => {
    // La tabla espera los 4 argumentos, así que abrimos el diálogo de venta
    const itemToSell = itemsWithCalculated.find(i => i.id === itemId);
    if (itemToSell) onSell(itemToSell);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-full sm:max-w-full h-full flex flex-col p-4 sm:p-6" side="right">
        <SheetHeader className="space-y-1 pb-4 border-b">
          <SheetTitle className="text-2xl">Catálogo</SheetTitle>
          <p className="text-sm text-muted-foreground">Gestiona tus productos y servicios con una vista mínima y clara.</p>
        </SheetHeader>
        
        <div className="flex-none flex flex-col sm:flex-row gap-4 py-4 border-b">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar ítems..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <ToggleGroup type="single" defaultValue="all" value={filter} onValueChange={(value: FilterType) => value && setFilter(value)} size="sm">
              <ToggleGroupItem value="all">Todos</ToggleGroupItem>
              <ToggleGroupItem value="available">Disponibles</ToggleGroupItem>
              <ToggleGroupItem value="out of stock">Agotados</ToggleGroupItem>
              <ToggleGroupItem value="services">Servicios</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" defaultValue="grid" value={viewMode} onValueChange={(value: ViewMode) => value && setViewMode(value)} size="sm">
              <ToggleGroupItem value="grid"><Grid className="h-4 w-4"/></ToggleGroupItem>
              <ToggleGroupItem value="list"><List className="h-4 w-4"/></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="py-2 text-xs text-muted-foreground">{filteredItems.length} resultado(s)</div>

        <div className="flex-grow overflow-y-auto py-4">
          {viewMode === 'grid' ? (
            <GalleryView items={filteredItems} onSellClick={onSell} onEditClick={onUpdate} onDeleteClick={onDelete} />
          ) : (
            <ItemsTable 
              items={filteredItems} 
              rawItems={allItems} 
              onSell={handleTableSell} 
              onUpdate={onUpdate} 
              onDelete={onDelete} 
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
// --- END OF FILE src/components/CatalogView.tsx ---
