import { DNA } from "react-loader-spinner";

const Loader = () => (
  <div className='flex flex-col items-center justify-center h-96'>
    <DNA
      visible={true}
      height="80"
      width="80"
      ariaLabel="dna-loading"
      wrapperStyle={{}}
      wrapperClass="dna-wrapper"
    />
    {/* <p>fetching transaction data...</p> */}
  </div>
);

export default Loader;
