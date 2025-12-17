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

    // Count prompts created by user
    const promptCount = await Prompt.countDocuments({ createdBy: email });

    // Get total likes on user's prompts
    const userPrompts = await Prompt.find({ createdBy: email });
    const totalLikes = userPrompts.reduce((sum, prompt) => sum + (prompt.likes || 0), 0);

    return NextResponse.json({
      promptCount,
      totalLikes,
      email,
    });
  } catch (error) {
    console.error("[USER STATS ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
