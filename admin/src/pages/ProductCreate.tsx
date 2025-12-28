import SideBar from "../components/SideBar";
import { log } from "../lib/logger";
import { addProduct } from "../api/apiClient";
import { useApiErrorHandler, type ApiError } from "../hooks/useApiErrorHandler";
import ProductForm from "../components/ProductForm";
import { useNavigate } from "react-router-dom";
import { type ProductFormData } from "../types/types";
import { useNotyf } from "../hooks/useNotyf";

export default function AddProduct() {
  const nav = useNavigate()
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
      nav("/products")
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
