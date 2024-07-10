import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [ethBalance, setEthBalance] = useState('');

  const detectCurrentProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      console.log('No Ethereum browser detected. Please install Metamask');
    }

    return provider;
  };

  const onConnect = async () => {
    try {
      const currentProvider = detectCurrentProvider();
      if (currentProvider) {
        await currentProvider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(currentProvider);
        const userAccount = await web3.eth.getAccounts();
        const account = userAccount[0];
        let ethBalance = await web3.eth.getBalance(account);
        setEthBalance(ethBalance);
        setIsConnected(true);
      }
    } catch (err) {
      console.error(err);

    }
  }


  const onDisconnect = () => {
    setIsConnected(false);
  }

  return (
    <div className='App'>
      <div className='app-header'>
        <h1>hello world!</h1>
      </div>

      <div className='app-wrapper'>
        {!isConnected && (
          <div>
            <button className='app-button_login' onClick={onConnect}>
              Login
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className='app-wrapper'>
          <div className='app-details'>
            <h2> You are connected to Metamask </h2>
            <div className='app-balance'>
              <span>Balance: </span>
              {ethBalance}
            </div>
          </div>
          <div>
            <button className='app-button_logout' onClick={onDisconnect}>
              Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
