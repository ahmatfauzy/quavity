import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const list = await db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(eq(companies.status, "approved"));
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.companyId) {
      return NextResponse.json(
        { error: "You are already associated with a company" },
        { status: 400 }
      );
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Insert new company with pending status
    const result = await db
      .insert(companies)
      .values({
        name,
        description,
        ownerId: session.user.id,
        status: "pending",
      })
      .returning();

    const newCompany = result[0];

    // Update the user to link to this company
    await db
      .update(user)
      .set({
        companyId: newCompany.id,
        // Wait for superadmin to approve before giving 'owner' access
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ message: "Registration submitted successfully", company: newCompany });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
