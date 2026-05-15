import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to login");
      }
      
      login(data.token, data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login Berhasil!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitDB = async () => {
    if(!confirm("Anda yakin ingin inisiasi DB? (Hanya untuk setup awal)")) return;
    try {
      const res = await fetch("/api/setup/init", { method: "POST" });
      const data = await res.json();
      toast.success(data.message || "DB Initialized!");
    } catch (e: any) {
      toast.error("Gagal init DB");
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login Accurate Web</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda untuk masuk.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@accurate.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Masuk"}
            </Button>
            
            {/* Hanya untuk helper environment ini */}
            <Button variant="outline" type="button" className="w-full" onClick={handleInitDB}>
              Inisialisasi Database (Setup Awal)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
