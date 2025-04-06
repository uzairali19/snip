import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "snippets.json");

export async function DELETE(req: NextRequest) {
  try {
    const tree = await req.json();
    fs.writeFileSync(filePath, JSON.stringify(tree, null, 2), "utf-8");
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("Failed to delete:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
