"use client";

import { cn, formatCfa } from "@/lib/utils";
import { Suspense, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";
import { getProductCategoryLabel } from "@/lib/product-categories";

import { EditProductModal } from "./_components/EditProductModal";

// ✅ shadcn/ui dialog (make sure you have these components in your project)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Custom pagination helper to match the [1, 2, 3, "...", 17] style
function getPageNumbers(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  pages.push(1);
  if (left > 2) pages.push("...");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

function ProductListContent() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const [editOpen, setEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // ✅ delete confirmation modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<any>(null);

  const { data: productData, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {
      const res = await apiClient.get("/products", {
        params: { page, limit, search },
      });
      return res.data.data;
    },
  });

  const totalPages = productData?.totalPages || 1;
  const pageButtons = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages]
  );

  // ✅ delete mutation: DELETE /products/:id
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      // make sure your axios baseURL already points to API
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      setDeleteOpen(false);
      setDeleteProductTarget(null);

      // refresh list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete product";
      toast.error(msg);
    },
  });

  return (
    <div className="space-y-6 py-6">
      {/* Header & Search Area */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-800">Products List</h1>
            <p className="text-sm font-medium text-slate-500">
              Manage your Products
            </p>
          </div>
          <Link href="/dashboard/products/add">
            <Button className="bg-[#38B475] hover:bg-[#2e9460] h-11 px-6 rounded-lg flex items-center gap-2 font-bold shadow-sm">
              <Plus className="w-5 h-5" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by product name"
            className="pl-12 h-12 bg-white border-[#B4E4C8] rounded-xl shadow-sm focus-visible:ring-[#38B475]/20 focus-visible:border-[#38B475]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="text-slate-500 font-bold py-5 px-6">
                Product Name
              </TableHead>
              <TableHead className="text-slate-500 font-bold">
                Remaining Amount
              </TableHead>
              <TableHead className="text-slate-500 font-bold">
                Category
              </TableHead>
              <TableHead className="text-slate-500 font-bold">
                Per Piece Price (CFA)
              </TableHead>
              <TableHead className="text-slate-500 font-bold">
                Added Date
              </TableHead>
              <TableHead className="text-slate-500 font-bold text-right px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="p-4">
                      <Skeleton className="h-16 w-full opacity-50" />
                    </TableCell>
                  </TableRow>
                ))
            ) : productData?.docs?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-20 text-center text-slate-400 font-medium"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              productData?.docs?.map((product: any) => (
                <TableRow
                  key={product._id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                        <img
                          src={product.image?.url || "/placeholder.svg"} // ✅ use image (backend)
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-500 font-bold text-sm">
                    {product.remainingUnit ?? product.totalUnit}{" "}
                    {product.unit ?? "pieces"}
                  </TableCell>

                  <TableCell className="text-slate-500 font-bold text-sm">
                    {getProductCategoryLabel(product.category)}
                  </TableCell>

                  <TableCell className="text-slate-500 font-bold text-sm">
                    {formatCfa(product.perPrice)}
                  </TableCell>

                  <TableCell className="text-slate-500 font-bold text-sm">
                    {new Date(product.createdAt).toISOString().split("T")[0]}
                  </TableCell>

                  <TableCell className="text-right px-6 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      onClick={() => {
                        setSelectedProduct(product);
                        setEditOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {/* ✅ Click Trash => open confirm modal */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => {
                        setDeleteProductTarget(product);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-slate-400 font-bold text-sm">
          Showing {(page - 1) * limit + 1} to{" "}
          {Math.min(page * limit, productData?.totalDocs || 0)} of{" "}
          {productData?.totalDocs || 0} results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-slate-200 bg-white"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>

          {pageButtons.map((p, idx) =>
            p === "..." ? (
              <div
                key={`dots-${idx}`}
                className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold"
              >
                ...
              </div>
            ) : (
              <Button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-10 w-10 rounded-lg font-bold text-sm transition-all",
                  page === p
                    ? "bg-[#4B66F1] text-white shadow-md shadow-blue-100"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-slate-200 bg-white"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        <EditProductModal
          open={editOpen}
          onOpenChange={setEditOpen}
          product={selectedProduct}
        />
      </div>

      {/* ✅ Delete Confirmation Modal */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          // prevent closing while deleting
          if (deleteProductMutation.isPending) return;
          setDeleteOpen(open);
          if (!open) setDeleteProductTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[450px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Delete product?
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold text-slate-700">
                {deleteProductTarget?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 space-x-3 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              disabled={deleteProductMutation.isPending}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteProductTarget(null);
              }}
            >
              No
            </Button>

            <Button
              type="button"
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteProductMutation.isPending}
              onClick={() => {
                const id = deleteProductTarget?._id;
                if (!id) return toast.error("Missing product id");
                deleteProductMutation.mutate(id);
              }}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-[600px] w-full rounded-[20px]" />
        </div>
      }
    >
      <ProductListContent />
    </Suspense>
  );
}
