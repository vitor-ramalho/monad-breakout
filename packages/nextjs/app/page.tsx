"use client";

import React from "react";
import { useAccount } from "wagmi";
import TransactionTable from "~~/components/TransactionTable/TransactionTable";
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
    await handleStartGame(connectedAddress);
    setLoading(false);
    setGameStarted(true);
  }

  async function authorize() {
    setLoading(true);
    await authorizeRelayer(connectedAddress);
    setIsRelayerAuthorized(true);
    setLoading(false);
  }

  return (
    <>
      {gameStarted && <BreakoutGame />}
      <div className="flex flex-col items-center justify-center w-screen h-screen">
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
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Start Game
            </button>
          )
        )}
      </div>
      <TransactionTable />
    </>
  );
};

export default Home;
