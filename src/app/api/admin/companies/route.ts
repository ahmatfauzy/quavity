import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all companies, with owners details
    const list = await db.query.companies.findMany({
        with: {
            owner: true
        },
        orderBy: (companies, { desc }) => [desc(companies.createdAt)]
    });

    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
