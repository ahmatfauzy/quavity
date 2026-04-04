import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

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

    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const targetCompany = await db.query.companies.findFirst({
        where: eq(companies.id, companyId)
    });

    if (!targetCompany || targetCompany.status !== "approved") {
        return NextResponse.json({ error: "Invalid or unapproved company" }, { status: 400 });
    }

    // Update the user to link to this company as pending employee
    await db
      .update(user)
      .set({
        companyId,
        role: "employee",
        status: "pending", 
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ message: "Successfully joined company as pending employee" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
