"use client";

import React from "react";
import { transactions } from "../services/transactionQueue/queue";
import { useAccount } from "wagmi";
import TransactionTable from "~~/components/TransactionTable/TransactionTable";
import { TransactionList } from "~~/components/TransactionList";
import BreakoutGame from "~~/components/game/BreakoutGame";
import { useGlobalState } from "~~/services/store/store";
import { useRequestLogic } from "~~/services/web3/useRequests";

const Home = () => {
  const { address: connectedAddress } = useAccount();
  const { authorizeRelayer, handleStartGame } = useRequestLogic();
  const { setIsRelayerAuthorized, isRelayerAuthorized } = useGlobalState();
  const [gameStarted, setGameStarted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  console.log("connectedAddress", connectedAddress);

  async function startGame() {
    setLoading(true);
    try {
      await handleStartGame(connectedAddress);
      setGameStarted(true);
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setLoading(false);
    }
  }

  async function authorize() {
    setLoading(true);
    try {
      await authorizeRelayer(connectedAddress);
      setIsRelayerAuthorized(true);
    } catch (error) {
      console.error("Failed to authorize relayer:", error);
    } finally {
      setLoading(false);
    }
  }

  console.log(transactions);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {gameStarted && <BreakoutGame />}
        <div className="flex flex-col items-center justify-center p-4">
          {!isRelayerAuthorized ? (
            <button
              disabled={loading}
              className="btn btn-primary btn-sm md:btn-md w-full sm:w-auto"
              onClick={() => authorize()}
            >
              {"Authorize Relayer"}
            </button>
          ) : (
            !gameStarted && (
              <button
                disabled={loading}
                onClick={() => startGame()}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
              >
                Start Game
              </button>
            )
          )}
        </div>
      </div>
      
      {/* Transaction List Section */}
      <div className="p-4 bg-base-200">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <TransactionList />
      </div>
    </div>
  );
};

export default Home;
