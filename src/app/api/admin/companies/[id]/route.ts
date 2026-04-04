import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const targetCompany = await db.query.companies.findFirst({
        where: eq(companies.id, id)
    });

    if (!targetCompany) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Update company status
    await db
        .update(companies)
        .set({ status })
        .where(eq(companies.id, id));

    // If approved, set the owner to be 'owner' and 'active'
    if (status === "approved" && targetCompany.ownerId) {
        await db
            .update(user)
            .set({ role: "owner", status: "active" })
            .where(eq(user.id, targetCompany.ownerId));
    } else if (status === "rejected" && targetCompany.ownerId) {
        // If rejected, remove company association or let them wait?
        // Typically role remains employee/pending.
        await db
            .update(user)
            .set({ companyId: null })
            .where(eq(user.id, targetCompany.ownerId));
    }

    return NextResponse.json({ message: `Company ${status} successfully` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
