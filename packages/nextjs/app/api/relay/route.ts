import { NextResponse } from "next/server";
import { addToQueue, getTransactions } from "~~/services/transactionQueue/queue";

export async function POST(req: Request) {
  try {
    const { playerAddress, action } = await req.json();

    if (!playerAddress || !action) {
      return NextResponse.json({ error: "Missing playerAddress or action" }, { status: 400 });
    }

    const result = await addToQueue(playerAddress, action);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Relayer error:", error);
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const transactions = getTransactions();
    console.log("GET transactions", transactions);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
