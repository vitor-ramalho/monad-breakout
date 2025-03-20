import { NextResponse } from "next/server";
import { getTransactions } from "~~/services/transactionQueue/queue";

export async function GET() {
  const transactions = getTransactions();
  return NextResponse.json({ transactions });
} 