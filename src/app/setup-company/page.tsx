"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupCompanyPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  useEffect(() => {
    // Fetch available companies to join
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");
      toast.success("Berhasil mendaftar. Menunggu persetujuan Superadmin.");
      router.push("/dashboard"); // Will hit pending block in layout
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      toast.error("Pilih perusahaan terlebih dahulu");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/companies/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: selectedCompanyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal bergabung");
      toast.success("Berhasil bergabung. Menunggu HR perusahaan Anda.");
      router.push("/dashboard"); // Will hit pending block in layout
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Mulai Pekerjaan Anda</CardTitle>
          <CardDescription>
            Pilih untuk mendaftarkan manajemen proyek perusahaan Anda sendiri atau bergabung ke manajemen yang sudah ada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Gabung
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Daftar Perusahaan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              <form onSubmit={handleJoin} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilih Perusahaan</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="" disabled>Pilih perusahaan yang sudah terdaftar</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || companies.length === 0}>
                  {isLoading ? "Memproses..." : "Gabung"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Perusahaan Baru</label>
                  <Input
                    required
                    placeholder="Masukkan nama perusahaan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi (Opsional)</label>
                  <Input
                    placeholder="Deskripsi singkat"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Daftarkan Perusahaan"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
