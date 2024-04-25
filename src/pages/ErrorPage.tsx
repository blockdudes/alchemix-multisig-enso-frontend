import logo from "../assets/warning.png"
const ErrorPage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-[80vh] mt-6 gap-6 '>
      <div className="w-40   ">
        <img src={logo} alt="" />

      </div>
      <div className="mx-4 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-300">Unauthorized Access</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Only Alchemix Finance DevMultisig Owners are authorized.</p>
      </div>
    </div>
  )
}

export default ErrorPage




