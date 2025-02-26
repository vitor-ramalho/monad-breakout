import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const useRequestLogic = () => {
  const { writeContractAsync: writeBreakoutGameAsync } = useScaffoldWriteContract({
    contractName: "BreakoutGame",
  });

  const authorizeRelayer = async (address: string | undefined) => {
    if (!address) return;
    try {
      await writeBreakoutGameAsync({
        functionName: "authorizeRelayer",
        args: [process.env.NEXT_PUBLIC_RELAYER_ADDRESS, true],
      });
    } catch (error) {
      console.error("Error authorizing relayer:", error);
    }
  };

  const handleRegisterBrickBroken = async (address: string | undefined) => {
    if (!address) return;
    try {
      await fetch("/api/relay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerAddress: address,
          action: "breakBrick",
        }),
      });
    } catch (error) {
      console.error("Error processing transaction:", error);
    }
  };

  const handleStartGame = async (address: string | undefined) => {
    if (!address) return;
    try {
      await fetch("/api/relay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerAddress: address,
          action: "startGame",
        }),
      });
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return {
    authorizeRelayer,
    handleRegisterBrickBroken,
    handleStartGame,
  };
};
