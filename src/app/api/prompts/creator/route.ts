import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Prompt from "@/lib/models/prompt";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const prompts = await Prompt.find({ createdBy: email }).sort({ createdAt: -1 });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("[CREATOR PROMPTS ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch creator prompts" },
      { status: 500 }
    );
  }
}
