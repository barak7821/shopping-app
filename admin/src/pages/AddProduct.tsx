import SideBar from "../components/SideBar";
import { log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { addProduct } from "../utils/api";
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import ProductForm, { type ProductFormData } from "../components/ProductForm";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const nav = useNavigate()
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const { handleApiError } = useApiErrorHandler()

  const handleAddProduct = async (productData: ProductFormData) => {
    const newProduct = {
      ...productData,
      price: +productData.price,
    }

    log("New product:", newProduct)

    try {
      await addProduct(newProduct)
      log("Adding product:", newProduct)
      notyf.success("Product added successfully!")
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
