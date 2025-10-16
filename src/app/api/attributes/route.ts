import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const rows = db.prepare("SELECT * FROM attributes ORDER BY id").all();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
