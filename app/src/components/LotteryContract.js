import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function LotteryContract({ contract, account }) {
  const [balance, setBalance] = useState(0);
  const [isManager, setIsManager] = useState(false);
  const [participants, setParticipants] = useState(0);

  useEffect(() => {
    const checkManager = async () => {
      const manager = await contract.manager();
      setIsManager(manager.toLowerCase() === account.toLowerCase());
    };

    const updateParticipants = async () => {
      try {
        const count = await contract.getParticipantsCount();
        setParticipants(count.toNumber());
      } catch (error) {
        console.error("Error getting participants count", error);
      }
    };

    const updateBalance = async () => {
      try {
        const balance = await contract.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error getting balance", error);
      }
    };

    checkManager();
    updateParticipants();
    updateBalance();
  }, [contract, account]);

  const participate = async () => {
    try {
      const tx = await contract.participate({
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
      alert("You have successfully participated in the lottery!");
      const count = await contract.getParticipantsCount();
      setParticipants(count.toNumber());
      const newBalance = await contract.getBalance();
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error("Error participating in lottery", error);
      alert("Error participating in lottery: " + error.message);
    }
  };

  const pickWinner = async () => {
    if (isManager) {
      try {
        const tx = await contract.pickWinner();
        await tx.wait();
        alert("Winner has been picked!");
        setParticipants(0);
        setBalance(0);
      } catch (error) {
        console.error("Error picking winner", error);
        alert("Error picking winner: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold">{participants}</p>
          <p className="text-sm text-gray-400">Participants</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold">{balance} ETH</p>
          <p className="text-sm text-gray-400">Prize Pool</p>
        </div>
      </div>

      <button
        onClick={participate}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
      >
        Participate for 1 ETH
      </button>

      {isManager && (
        <div className="space-y-4 mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-bold">Manager Actions</h2>
          <button
            onClick={pickWinner}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            Pick Winner
          </button>
        </div>
      )}
    </div>
  );
}

export default LotteryContract;
