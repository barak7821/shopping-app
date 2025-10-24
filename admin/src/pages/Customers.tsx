import SideBar from "../components/SideBar";

export default function Customers() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

      <div className="flex flex-1 w-full mx-auto gap-12 pt-8 pb-20 px-4">
        {/* Sidebar */}
        <SideBar />
      </div>
    </div>
  )
}
