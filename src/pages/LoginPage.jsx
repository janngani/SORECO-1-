import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, Loader2, ArrowLeft, Mail, Lock, KeyRound, CheckCircle2, ShieldAlert } from "lucide-react";

export const LoginPage = () => {
  const { login, forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot / Reset password states
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [simulationMode, setSimulationMode] = useState(false);

  // Detect recovery redirect from URL hash or query params
  useEffect(() => {
    const checkRecovery = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      // If we have recovery flag in query or type=recovery in hash, switch to reset password view
      if (search.includes("recovery=true") || hash.includes("type=recovery") || hash.includes("access_token")) {
        setView("reset");
        toast.info("Recovery session active! Please enter your new password below.");
      }
    };
    checkRecovery();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login({ email: email.trim().toLowerCase(), password });
      toast.success(`Welcome back, ${loggedInUser.fullName || "User"}!`);
      if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      return toast.error("Please enter your email address");
    }
    setLoading(true);
    try {
      if (simulationMode) {
        // Mock success for quick developer preview & demonstration without SMTP limits
        toast.success("Simulation mode: Recovery code generated!");
        setResetSent(true);
      } else {
        await forgotPassword(resetEmail.trim().toLowerCase());
        toast.success("A password reset link has been sent to your email!");
        setResetSent(true);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Could not send reset link. Try enabling simulation mode.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      return toast.error("Please enter your registered email address");
    }
    if (!newPassword) {
      return toast.error("Please enter a new password");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      if (simulationMode) {
        // Direct simulation success
        toast.success("Password updated successfully (Simulation Mode)!");
        setView("login");
        setResetSent(false);
        setResetEmail("");
      } else {
        await resetPassword(newPassword, resetEmail.trim().toLowerCase());
        toast.success("Your password has been successfully updated!");
        setView("login");
        setResetSent(false);
        setResetEmail("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update password. Try using simulation mode if session expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2"
          onClick={() => {
            if (view !== "login") {
              setView("login");
              setResetSent(false);
            } else {
              navigate("/");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          {view === "login" ? "Back to Home" : "Back to Sign In"}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-xl border border-slate-100 overflow-hidden bg-white/80 backdrop-blur-md">
        <div className="h-2 bg-gradient-to-r from-primary to-slate-900 w-full" />

        {/* View 1: Standard Sign In */}
        {view === "login" && (
          <>
            <CardHeader className="space-y-2 text-center pt-8 pb-6">
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                SORECO-1 Portal
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Sign in with your email and password to access the portal
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-5 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-primary border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-visible:ring-primary border-slate-200"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-0 pb-8">
                <Button
                  type="submit"
                  className="w-full text-white bg-primary hover:bg-primary/95 transition-all text-sm font-medium h-11"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Sign In to Portal
                </Button>

                <div className="text-center text-sm text-slate-500">
                  Don't have a consumer account?{" "}
                  <Link to="/register" className="text-primary font-semibold hover:underline">
                    Register here
                  </Link>
                </div>
              </CardFooter>
            </form>
          </>
        )}

        {/* View 2: Forgot Password Request */}
        {view === "forgot" && (
          <>
            <CardHeader className="space-y-2 text-center pt-8 pb-6">
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-2">
                <KeyRound className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Reset Password
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm px-4">
                {resetSent 
                  ? "We've sent a recovery message to your email address."
                  : "Enter your registered email address and we'll send you a secure link to reset your password."}
              </CardDescription>
            </CardHeader>

            {!resetSent ? (
              <form onSubmit={handleForgotPassword}>
                <CardContent className="space-y-5 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-slate-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="your-email@example.com"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 focus-visible:ring-primary border-slate-200"
                      />
                    </div>
                  </div>

                  {/* Simulation Helper Switch */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="simulation-mode" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                        No SMTP email configured?
                      </Label>
                      <button
                        type="button"
                        onClick={() => setSimulationMode(!simulationMode)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                          simulationMode 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-200 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {simulationMode ? "Simulation ON" : "Use Simulation"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {simulationMode 
                        ? "Simulation Mode will immediately let you proceed to the password update screen without waiting for email delivery."
                        : "Enable simulation mode to bypass live email SMTP requirements and test the reset page instantly."}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 pt-0 pb-8">
                  <Button
                    type="submit"
                    className="w-full text-white bg-primary hover:bg-primary/95 transition-all text-sm font-medium h-11"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Password Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-600 hover:text-slate-900 text-sm"
                    onClick={() => {
                      setView("login");
                      setResetSent(false);
                    }}
                  >
                    Cancel & Return to Sign In
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6 pb-8 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-md font-semibold text-slate-800">Check Your Email</h4>
                  <p className="text-xs text-slate-600 leading-relaxed px-4">
                    {simulationMode
                      ? "In simulation mode, you can immediately access the password setting tab by clicking below."
                      : `A password reset link was requested for ${resetEmail}. Please check your inbox and spam folders.`}
                  </p>
                </div>
                
                <div className="pt-2 flex flex-col gap-2">
                  {simulationMode ? (
                    <Button
                      type="button"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        setView("reset");
                        toast.success("Welcome to password update mockup!");
                      }}
                    >
                      Proceed to New Password Form
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() => {
                        // Let user manually jump to reset screen as fail-safe backup option
                        setView("reset");
                        toast.success("Manual override: testing reset form.");
                      }}
                    >
                      Bypass to Reset Form (Dev Test)
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-500"
                    onClick={() => {
                      setView("login");
                      setResetSent(false);
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </CardContent>
            )}
          </>
        )}

        {/* View 3: Set New Password Form */}
        {view === "reset" && (
          <>
            <CardHeader className="space-y-2 text-center pt-8 pb-6">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                New Password
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Enter your new secure password below to complete the reset.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-5 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="resetConfirmEmail" className="text-slate-700 font-medium">Confirm Email Address</Label>
                  <Input
                    id="resetConfirmEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="focus-visible:ring-primary border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-700 font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus-visible:ring-primary border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-slate-700 font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="focus-visible:ring-primary border-slate-200"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 pt-0 pb-8">
                <Button
                  type="submit"
                  className="w-full text-white bg-primary hover:bg-primary/95 transition-all text-sm font-medium h-11"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save New Password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-600 hover:text-slate-900 text-sm"
                  onClick={() => {
                    setView("login");
                    setResetSent(false);
                  }}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};
