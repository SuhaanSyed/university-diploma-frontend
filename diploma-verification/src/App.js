import Web3 from "web3";
import { useState } from "react";
import { ethers } from "ethers";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";


import "./App.css";
import ConnectWalletButton from "./components/ConnectWalletButton";
import mobileCheck from "./helpers/mobileCheck";
import getLinker from "./helpers/deepLink";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");


  const onPressConnect = async () => {
    setLoading(true);

    try {
      const yourWebUrl = "mysite.com"; // Replace with your website domain
      const deepLink = `https://metamask.app.link/dapp/${yourWebUrl}`;
      const downloadMetamaskUrl = "https://metamask.io/download.html";

      const getbalance = (address) => {
        // Requesting balance method
        window.ethereum
          .request({
            method: "eth_getBalance",
            params: [address, "latest"],
          })
          .then((balance) => {
            // Setting balance
            setBalance({
              Balance:
                ethers.utils.formatEther(balance),
            });
          });
      };


      if (window?.ethereum?.isMetaMask) {
        // Desktop browser
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const account = Web3.utils.toChecksumAddress(accounts[0]);
        setAddress(account);
        getbalance(account);
      } else if (mobileCheck()) {
        // Mobile browser
        const linker = getLinker(downloadMetamaskUrl);
        linker.openURL(deepLink);
      } else {
        window.open(downloadMetamaskUrl);
      }
    } catch (error) {
      console.log(error);
    }





    setLoading(false);
  };

  const onPressLogout = () => {
    setAddress("");
    setBalance("");
  }

  return (
    <div className="App">
      <header className="App-header">
        <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={address}
          balance={balance}
        />
      </header>
      <Card>
        <Card.Body>
          <Card.Title>Address: {address}</Card.Title>
          <Card.Text>Balance: {balance.Balance}</Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default App;