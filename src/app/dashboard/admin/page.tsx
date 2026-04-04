"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies");
      if (!res.ok) throw new Error("Gagal mengambil data perusahaan");
      const data = await res.json();
      setCompanies(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status");
      toast.success(`Perusahaan berhasil di-${status}`);
      fetchCompanies(); // Refresh data
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Superadmin - Manajemen Perusahaan</h2>
        <p className="text-muted-foreground">Kelola pendaftaran perusahaan di platform SaaS ini.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Perusahaan</CardTitle>
          <CardDescription>Persetujuan pembuatan workspace manajemen proyek (SaaS).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Belum ada pendaftaran.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.description || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          company.status === "approved"
                            ? "default"
                            : company.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {company.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(company.createdAt), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {company.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleStatusChange(company.id, "approved")}
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(company.id, "rejected")}
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                 ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
