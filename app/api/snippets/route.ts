import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "data", "snippets.json");

export async function GET() {
  try {
    const file = fs.existsSync(filePath)
      ? await fsp.readFile(filePath, "utf-8")
      : "[]";

    return NextResponse.json(JSON.parse(file));
  } catch (err) {
    console.error("Failed to read snippets:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newTree = await req.json();

    if (!Array.isArray(newTree)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    await fsp.writeFile(filePath, JSON.stringify(newTree, null, 2));
    return NextResponse.json({ message: "Saved" }, { status: 200 });
  } catch (error) {
    console.error("Failed to save snippet:", error);
    return NextResponse.json(
      { error: "Failed to save snippet" },
      { status: 500 }
    );
  }
}
