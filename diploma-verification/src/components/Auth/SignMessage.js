// utils.js
import { ethers } from 'ethers';

export const signMessage = async (message, account) => {
    if (window.ethereum && account) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Error signing message', error);
        }
    } else {
        console.error('MetaMask not connected or account not set');
    }
};
