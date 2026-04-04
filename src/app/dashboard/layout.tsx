import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleSlash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    console.error("Session Check Failed", error);
    redirect("/auth/login");
  }

  if (!session) {
    redirect("/auth/login");
  }

  const status = session.user.status;

  if (!session.user.companyId && session.user.role !== "superadmin") {
    redirect("/setup-company");
  }

  if (status === "pending") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <Alert className="max-w-md border-yellow-500/50 bg-yellow-500/10 text-yellow-600">
          <Clock className="h-4 w-4" />
          <AlertTitle>Waiting for Approval</AlertTitle>
          <AlertDescription>
            Akun Anda sedang menunggu verifikasi dari HR. Silakan hubungi admin
            atau cek kembali nanti.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/auth/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <CircleSlash className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Waduh! Akun Anda ditolak oleh HR. Hubungi manajemen jika ini
            kesalahan.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/auth/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userData = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "",
        role: session.user.role,
      }
    : {
        name: "User",
        email: "user@example.com",
        avatar: "",
        role: "employee",
      };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-8 pt-0">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
