import logo from "../assets/warning.png";

const ErrorPage = ({errorTitle, errorDescription}: {errorTitle: string, errorDescription: string}): JSX.Element => {
  return (
    <div className='flex flex-col items-center justify-center h-[80vh] mt-6 gap-6 '>
      <div className="w-40">
        <img src={logo} alt="" />

      </div>
      <div className="mx-4 mb-8 text-center">
        {/* <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-300">Unauthorized Access</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Only Alchemix Finance DevMultisig Owners are authorized.</p> */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-300">{errorTitle}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{errorDescription}</p>
      </div>
    </div>
  )
}

const handleCreateNewTX = async (setter: React.Dispatch<React.SetStateAction<any>>, loader: React.Dispatch<React.SetStateAction<boolean>>) => {
loader(true)
setter(false)
}

export const ErrorCreateTxPage = ({errorTitle, errorDescription, setter, loader}: {errorTitle: string, errorDescription: string, setter: React.Dispatch<React.SetStateAction<any>>, loader:React.Dispatch<React.SetStateAction<boolean>> }): JSX.Element => {
  return (
    <div className='flex flex-col items-center justify-center h-[80vh] mt-6 gap-6 '>
      <div className="w-40">
        <img src={logo} alt="" />

      </div>
      <div className="mx-4 mb-8 text-center">
        {/* <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-300">Unauthorized Access</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Only Alchemix Finance DevMultisig Owners are authorized.</p> */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-300">{errorTitle}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{errorDescription}</p>
        <button onClick={() => handleCreateNewTX(setter,loader)} className="bg-[#1E3A8A] text-white mt-10 px-8 py-4 font-bold rounded-lg hover:bg-[#1E3A8A]/80 transition-colors duration-300 ease-in-out"> Create new Transaction</button>
      </div>
    </div>
  )
}

export default ErrorPage
