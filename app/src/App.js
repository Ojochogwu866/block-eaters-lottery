import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import LotteryContract from "./components/LotteryContract";
import contractABI from "./contractABI.json";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
        const lotteryContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        setContract(lotteryContract);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center flex-col text-white">
      <header className="bg-gray-800 p-4 rounded-[2px]">
        <h1 className="text-3xl font-bold text-center">Crypto Lottery</h1>
      </header>
      <main className="w-8/12 mx-auto flex flex-col px-4 py-8">
        {account ? (
          <div className="bg-gray-800 rounded-[2px] shadow-xl p-6">
            <p className="text-sm text-gray-400 mb-4">
              Connected Account: {account}
            </p>
            {contract && (
              <LotteryContract contract={contract} account={account} />
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl">Please connect your wallet to participate</p>
            <button
              onClick={connectWallet}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
