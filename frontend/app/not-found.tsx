import Link from "next/link";


export default function NotFound() {
  return (
    <div className="flex flex-col items-center h-screen justify-center select-none dark:bg-neutral-900">
      <div className="max-w-md text-center">
        <h1 className="mb-8 font-extrabold text-9xl dark:text-gray-200">404</h1>
        <p className="font-semibold text-3xl dark:text-gray-200">Sorry, we couldn't find this page.</p>
        <p className="mt-4 mb-8 dark:text-gray-400">But don't worry, you can find plenty of other things on our homepage.</p>
        {/* Redirecting the user to the homepage when they click the link */}
        <Link href='/' className='bg-blue-900 rounded-xl text-white py-2 px-8 cursor-pointer hover:scale-105 active:scale-95 duration-300'>Back to homepage</Link>
      </div>
    </div>
  )
}