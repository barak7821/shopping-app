"use client"
import SideBar from "@/app/components/SideBar";
import { log } from "@/app/lib/logger";
import { addProduct } from "@/app/services/apiClient";
import { useApiErrorHandler, type ApiError } from "@/app/hooks/useApiErrorHandler";
import ProductForm from "@/app/components/ProductForm";
import { type ProductFormData } from "@/app/types/types";
import { useNotyf } from "@/app/hooks/useNotyf";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter()
  const notyf = useNotyf()
  const { handleApiError } = useApiErrorHandler()

  const handleAddProduct = async (productData: ProductFormData) => {
    const normalizedSizes = productData.sizes.map(({ code, stock }) => {
      const numericStock = stock === "" ? 0 : Number(stock)
      return {
        code,
        stock: Number.isNaN(numericStock) ? 0 : numericStock
      }
    })

    const newProduct = {
      ...productData,
      price: +productData.price,
      discountPercent: productData.onSale ? +(productData.discountPercent || 0) : 0,
      sizes: normalizedSizes,
    }

    log("New product:", newProduct)

    try {
      await addProduct(newProduct)
      log("Adding product:", newProduct)
      notyf?.success("Product added successfully!")
      router.push("/products")
    } catch (error) {
      handleApiError(error as ApiError, "handleAddProduct")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
        {/* Sidebar */}
        <SideBar />
        <ProductForm isEditing={false} onSubmit={handleAddProduct} />
      </div>
    </div>
  )
}
