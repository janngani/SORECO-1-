import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Globe, Shield, FileText } from "lucide-react";
export const Footer = () => {
  return <footer className="bg-slate-900 text-slate-300 py-16 font-sans">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {
    /* Company Brief & Logo */
  }
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-extrabold text-sm shadow-sm">
                S1
              </div>
              <span className="text-white text-lg font-black tracking-tight font-poppins">
                SORECO-1
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Sorsogon I Electric Cooperative, Inc. (SORECO-1) is dedicated to providing reliable, digitized, and highly affordable electrical service across Sorsogon's First District.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com/soreco1" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-700 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://soreco1.com.ph" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-700 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {
    /* Quick Links */
  }
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold font-poppins uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">Services Overview</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {
    /* Services Offered */
  }
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold font-poppins uppercase tracking-wider">Online Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/services/reconnection" className="hover:text-primary transition-colors">Reconnection of Service</Link>
              </li>
              <li>
                <Link to="/services/billing-dispute" className="hover:text-primary transition-colors">Billing Disputes & Audits</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">Secure Consumer Portal</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">Register Account</Link>
              </li>
            </ul>
          </div>

          {
    /* Office Address & Hotlines */
  }
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold font-poppins uppercase tracking-wider">Bulan Main Office</h4>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li className="flex gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                <span>Zone-5, Immaculada Concepcion Street, Bulan, Sorsogon, Philippines</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                <span>(056) 555-0199 / +63 917-888-2626</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                <span>info@soreco1.com.ph</span>
              </li>
            </ul>
          </div>

        </div>

        {
    /* Footer Base */
  }
        <div className="border-t border-slate-800 pt-8 mt-12 text-slate-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {(/* @__PURE__ */ new Date()).getFullYear()} Sorsogon I Electric Cooperative, Inc. All rights reserved.</p>
          <div className="flex gap-6 text-[11px]">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="h-3 w-3" /> Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <FileText className="h-3 w-3" /> Terms & Conditions
            </a>
          </div>
        </div>

      </div>
    </footer>;
};
