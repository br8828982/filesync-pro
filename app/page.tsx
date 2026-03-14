import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";
import { Suspense } from "react";

export default function Home({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome to Our Store</h1>
          <p className="text-muted-foreground">
            Discover our amazing products with real-time stock updates
          </p>
        </div>
        
        <ProductFilters />
        
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductGrid 
            category={searchParams.category}
            search={searchParams.search}
          />
        </Suspense>
      </div>
    </div>
  );
}