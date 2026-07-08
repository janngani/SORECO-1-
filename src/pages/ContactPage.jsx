import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Facebook, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
export const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.inquiries.create(formData);
      setSuccess(true);
      toast.success("Inquiry submitted successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit inquiry. Please try again.");
      setErrors({ submit: error.message || "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  return <div className="bg-[#F8F6F2] py-16 md:py-24 font-sans min-h-screen">
      <div className="container mx-auto px-4">
        
        {
    /* Header Section */
  }
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4"
  >
            <Mail className="h-3 w-3" /> Get In Touch
          </motion.div>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-poppins mb-6"
  >
            Contact SORECO-1
          </motion.h1>
          <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="text-lg text-slate-600 leading-relaxed"
  >
            We are here to assist you. Send us your general inquiries, feedback, or report emergencies through our dedicated channels.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto mb-20">
          
          {
    /* Contact Details Panel - 5 Cols */
  }
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 font-poppins mb-2">Our Office Info</h3>
              <p className="text-xs text-slate-500">Visit us or reach out via official communications lines.</p>

              <div className="space-y-6">
                
                {
    /* Office Address */
  }
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm font-poppins">Main Office Address</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Zone-5, Immaculada Concepcion Street,<br />
                      Bulan, Sorsogon, Philippines
                    </p>
                  </div>
                </div>

                {
    /* Phone */
  }
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm font-poppins">Phone Hotlines</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Landline: (056) 555-0199<br />
                      Mobile: +63 917-888-2626 (Globe)<br />
                      Mobile: +63 920-999-2626 (Smart)
                    </p>
                  </div>
                </div>

                {
    /* Email */
  }
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm font-poppins">Email Helpdesk</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      General: info@soreco1.com.ph<br />
                      Billing Audits: billing@soreco1.com.ph
                    </p>
                  </div>
                </div>

                {
    /* Business Hours */
  }
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm font-poppins">Business Hours</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Monday to Friday: 8:00 AM - 5:00 PM<br />
                      Saturdays: 8:00 AM - 12:00 PM (Cashier Only)<br />
                      Sundays & Holidays: Closed
                    </p>
                  </div>
                </div>

                {
    /* Facebook Placeholder */
  }
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Facebook className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm font-poppins">Official Facebook</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      <a href="https://facebook.com/soreco1official" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        facebook.com/soreco1official
                      </a>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {
    /* Contact Form Panel - 7 Cols */
  }
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 font-poppins mb-6">Send Us a Message</h3>
              
              {success ? <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-2xl bg-green-50 border border-green-100 text-green-700 space-y-4"
  >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <h4 className="font-bold font-poppins">Message Sent Successfully!</h4>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Thank you for contacting SORECO-1. Your inquiry has been logged in our general inbox, and a customer relations officer will respond to your email address within 24 hours.
                  </p>
                  <button
    onClick={() => setSuccess(false)}
    className="text-xs font-bold underline hover:text-green-800"
  >
                    Send another message
                  </button>
                </motion.div> : <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {
    /* Full Name */
  }
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name *</label>
                    <input
    type="text"
    name="fullName"
    value={formData.fullName}
    onChange={handleChange}
    placeholder="Juan Dela Cruz"
    className={`w-full h-12 rounded-xl bg-slate-50 border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.fullName ? "border-red-500" : "border-slate-100"}`}
  />
                    {errors.fullName && <span className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}
                      </span>}
                  </div>

                  {
    /* Email & Phone Rows */
  }
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address *</label>
                      <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="juan@gmail.com"
    className={`w-full h-12 rounded-xl bg-slate-50 border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email ? "border-red-500" : "border-slate-100"}`}
  />
                      {errors.email && <span className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                        </span>}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number *</label>
                      <input
    type="text"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    placeholder="09171234567"
    className={`w-full h-12 rounded-xl bg-slate-50 border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.phone ? "border-red-500" : "border-slate-100"}`}
  />
                      {errors.phone && <span className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.phone}
                        </span>}
                    </div>
                  </div>

                  {
    /* Subject */
  }
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Subject *</label>
                    <input
    type="text"
    name="subject"
    value={formData.subject}
    onChange={handleChange}
    placeholder="e.g. Inquire about solar integrations"
    className={`w-full h-12 rounded-xl bg-slate-50 border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.subject ? "border-red-500" : "border-slate-100"}`}
  />
                    {errors.subject && <span className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.subject}
                      </span>}
                  </div>

                  {
    /* Message */
  }
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Message *</label>
                    <textarea
    name="message"
    rows={4}
    value={formData.message}
    onChange={handleChange}
    placeholder="Type your message details here..."
    className={`w-full rounded-xl bg-slate-50 border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none ${errors.message ? "border-red-500" : "border-slate-100"}`}
  />
                    {errors.message && <span className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.message}
                      </span>}
                  </div>

                  {
    /* Submit Button */
  }
                  <button
    type="submit"
    disabled={loading}
    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all flex items-center justify-center gap-2"
  >
                    {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                        <Send className="h-4 w-4" /> Send Message
                      </>}
                  </button>

                </form>}
            </div>
          </div>

        </div>

        {
    /* Google Map Placeholder */
  }
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="relative w-full h-[400px] bg-slate-100 rounded-3xl overflow-hidden flex flex-col items-center justify-center">
              {
    /* Fallback visual representing a Google map centered in Bulan Sorsogon */
  }
              <div className="absolute inset-0 bg-[#E0DEC9] opacity-40" />
              <div className="absolute inset-x-0 h-4 bg-primary/10 top-1/3" />
              <div className="absolute inset-y-0 w-4 bg-primary/10 left-1/2" />
              <div className="relative z-10 text-center p-6 bg-white/95 backdrop-blur-md border rounded-2xl max-w-sm shadow-md">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-3 animate-bounce" />
                <h4 className="font-extrabold text-slate-900 font-poppins text-sm mb-1">Bulan Main Office</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Zone-5, Immaculada Concepcion Street, Bulan, Sorsogon (Near Immaculada Concepcion Parish Church).
                </p>
                <a
    href="https://maps.google.com/?q=Immaculada+Concepcion+Street+Bulan+Sorsogon"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
  >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>;
};
