import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Loader2, ShieldCheck, X } from "lucide-react";
export const RegisterPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    accountNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.accountNumber.length < 5) {
      return toast.error("Please enter a valid utility account number");
    }
    setLoading(true);
    try {
      const res = await register({
        fullName: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        accountNumber: formData.accountNumber
      });
      if (res && res.supabaseConfirmRequired) {
        toast.success("Verification link sent! Please check your email to verify your account before logging in.", {
          duration: 12e3
        });
        navigate("/login");
      } else {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-128px)] px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl border-slate-100 relative">
        <Button
    variant="ghost"
    size="icon"
    className="absolute right-2 top-2 text-slate-400 hover:text-red-500 z-10"
    onClick={() => navigate("/")}
  >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription>
            Register using your SORECO-1 utility account number
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
    id="fullName"
    placeholder="Juan Dela Cruz"
    required
    value={formData.fullName}
    onChange={handleChange}
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Utility Account Number</Label>
                <div className="relative">
                  <Input
    id="accountNumber"
    placeholder="00-0000-0000"
    required
    value={formData.accountNumber}
    onChange={handleChange}
  />
                  <ShieldCheck className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
    id="email"
    type="email"
    placeholder="name@example.com"
    required
    value={formData.email}
    onChange={handleChange}
  />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
    id="password"
    type="password"
    required
    value={formData.password}
    onChange={handleChange}
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
    id="confirmPassword"
    type="password"
    required
    value={formData.confirmPassword}
    onChange={handleChange}
  />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
    type="submit"
    className="w-full bg-primary hover:bg-primary/90 text-white"
    disabled={loading}
  >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Account
            </Button>

            <div className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>;
};
