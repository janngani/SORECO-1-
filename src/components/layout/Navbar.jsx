import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard, Menu, X, ChevronDown, Zap, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
export const Navbar = () => {
  const { user, userData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [systemLogo, setSystemLogo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const isLandingPage = location.pathname === "/";
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get("system");
        if (data.value) {
          setSystemLogo(JSON.parse(data.value).logoUrl);
        }
      } catch (error) {
        console.error("Navbar settings fetch error:", error);
      }
    };
    fetchSettings();
  }, []);
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);
  const handleLogout = async () => {
    logout();
    navigate("/");
  };
  return <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-[#F8F6F2]/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {
    /* Logo and Title */
  }
        <Link to="/" className="flex items-center gap-2.5 group">
          {systemLogo ? <img src={systemLogo} alt="SORECO-1 Logo" className="h-10 w-10 object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4A261] text-white font-extrabold text-lg shadow-md shadow-[#F4A261]/20 group-hover:scale-105 transition-transform">
              S1
            </div>}
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 font-poppins">
              SORECO-1
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#F4A261] font-bold -mt-1">
              Bulan Portal
            </span>
          </div>
        </Link>

        {
    /* Desktop Navigation Links */
  }
        <div className="hidden lg:flex items-center gap-8">
          <Link
    to="/"
    className={`text-sm font-semibold transition-colors hover:text-[#F4A261] ${location.pathname === "/" ? "text-[#F4A261]" : "text-slate-600"}`}
  >
            Home
          </Link>
          {!isAdmin && <>
              <Link
    to="/about"
    className={`text-sm font-semibold transition-colors hover:text-[#F4A261] ${location.pathname === "/about" ? "text-[#F4A261]" : "text-slate-600"}`}
  >
                About Us
              </Link>

              {
    /* Services Dropdown */
  }
              <div className="relative">
                <button
    onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
    onMouseEnter={() => setServicesDropdownOpen(true)}
    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#F4A261] focus:outline-none ${location.pathname.startsWith("/services") ? "text-[#F4A261]" : "text-slate-600"}`}
  >
                  Services <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${servicesDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {servicesDropdownOpen && <div
    className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl p-3 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
    onMouseLeave={() => setServicesDropdownOpen(false)}
  >
                    <Link
    to="/services"
    className="p-2.5 rounded-xl text-xs font-bold text-[#F4A261] hover:bg-slate-50 uppercase tracking-widest border-b border-slate-100 mb-1"
  >
                      All Services
                    </Link>
                    <Link
    to="/services/reconnection"
    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-950"
  >
                      <Zap className="h-4 w-4 text-[#F4A261]" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Reconnection of Service</span>
                        <span className="text-[10px] text-slate-400">Restore power after cutoffs</span>
                      </div>
                    </Link>
                    <Link
    to="/services/billing-dispute"
    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-950"
  >
                      <FileText className="h-4 w-4 text-[#F4A261]" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Billing Dispute</span>
                        <span className="text-[10px] text-slate-400">Lodge discrepancies & audits</span>
                      </div>
                    </Link>
                  </div>}
              </div>

              <Link
    to="/contact"
    className={`text-sm font-semibold transition-colors hover:text-[#F4A261] ${location.pathname === "/contact" ? "text-[#F4A261]" : "text-slate-600"}`}
  >
                Contact
              </Link>
            </>}
        </div>

        {
    /* Right Section Action Buttons */
  }
        <div className="hidden lg:flex items-center gap-4">
          {user ? <>
              <Link to={isAdmin ? "/admin" : "/dashboard"}>
                <Button variant="ghost" className="gap-2 text-slate-700 hover:bg-slate-100/50 rounded-xl">
                  <LayoutDashboard className="h-4 w-4 text-[#F4A261]" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              {!isAdmin && <Link to="/profile">
                  <Button variant="ghost" className="gap-2 text-slate-700 hover:bg-slate-100/50 rounded-xl">
                    <User className="h-4 w-4 text-[#F4A261]" />
                    <span>Profile</span>
                  </Button>
                </Link>}
              <Button variant="outline" onClick={handleLogout} className="gap-2 border-[#F4A261] text-[#F4A261] hover:bg-[#F4A261] hover:text-white rounded-xl">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </> : <>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-xl">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#F4A261] hover:bg-[#F4A261]/90 text-white rounded-xl font-bold shadow-md shadow-[#F4A261]/20">Register</Button>
              </Link>
            </>}
        </div>

        {
    /* Mobile Hamburger Button */
  }
        <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="lg:hidden p-2 rounded-xl bg-white/50 border border-slate-200/40 text-slate-700 hover:text-[#F4A261]"
  >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

      </div>

      {
    /* Mobile Drawer Overlay */
  }
      <AnimatePresence>
        {mobileMenuOpen && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="lg:hidden border-t border-slate-200/50 bg-[#F8F6F2] overflow-hidden shadow-inner z-40"
  >
            <div className="p-5 flex flex-col gap-4">
              <Link
    to="/"
    className={`text-sm font-bold p-2 rounded-xl transition-colors hover:bg-slate-100 ${location.pathname === "/" ? "text-[#F4A261]" : "text-slate-700"}`}
  >
                Home
              </Link>
              {!isAdmin && <>
                  <Link
    to="/about"
    className={`text-sm font-bold p-2 rounded-xl transition-colors hover:bg-slate-100 ${location.pathname === "/about" ? "text-[#F4A261]" : "text-slate-700"}`}
  >
                    About Us
                  </Link>
                  
                  {
    /* Mobile Services Sections */
  }
                  <div className="p-2 border border-slate-200/40 rounded-2xl bg-white/50 space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block px-2 pt-1">Our Services</span>
                    <Link
    to="/services"
    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700"
  >
                      <div className="h-3 w-3 rounded-full bg-slate-300" />
                      <span className="text-xs font-bold">Services Overview</span>
                    </Link>
                    <Link
    to="/services/reconnection"
    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700"
  >
                      <Zap className="h-4 w-4 text-[#F4A261]" />
                      <span className="text-xs font-bold">Reconnection of Service</span>
                    </Link>
                    <Link
    to="/services/billing-dispute"
    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700"
  >
                      <FileText className="h-4 w-4 text-[#F4A261]" />
                      <span className="text-xs font-bold">Billing Dispute</span>
                    </Link>
                  </div>

                  <Link
    to="/contact"
    className={`text-sm font-bold p-2 rounded-xl transition-colors hover:bg-slate-100 ${location.pathname === "/contact" ? "text-[#F4A261]" : "text-slate-700"}`}
  >
                    Contact
                  </Link>
                </>}

              <hr className="border-slate-200/50 my-2" />

              {
    /* Portal Auth buttons for Mobile */
  }
              <div className="flex flex-col gap-2">
                {user ? <>
                    <Link to={isAdmin ? "/admin" : "/dashboard"} className="w-full">
                      <Button className="w-full bg-[#F4A261] text-white rounded-xl font-bold py-5 gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                      </Button>
                    </Link>
                    {!isAdmin && <Link to="/profile" className="w-full">
                        <Button variant="outline" className="w-full border-slate-200 rounded-xl py-5 text-slate-700 gap-2">
                          <User className="h-4 w-4 text-[#F4A261]" /> View Profile
                        </Button>
                      </Link>}
                    <Button variant="ghost" onClick={handleLogout} className="w-full rounded-xl py-5 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2">
                      <LogOut className="h-4 w-4" /> Logout
                    </Button>
                  </> : <>
                    <Link to="/login" className="w-full">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-700 py-5 rounded-xl">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <Button className="w-full bg-[#F4A261] text-white py-5 rounded-xl font-bold shadow-md shadow-[#F4A261]/20">
                        Register
                      </Button>
                    </Link>
                  </>}
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </nav>;
};
