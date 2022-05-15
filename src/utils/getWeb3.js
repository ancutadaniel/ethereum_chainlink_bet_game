import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

const getWeb3 = async () => {
  const provider = await detectEthereumProvider();
  if (provider) {
    return new Web3(provider);
  } else {
    console.error('Please install MetaMask!');
  }
};

export default getWeb3;
