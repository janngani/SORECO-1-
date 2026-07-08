import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Zap, FileText, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
export const ServicesPage = () => {
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
            <Sparkles className="h-3 w-3" /> Online Portal Services
          </motion.div>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-poppins mb-6"
  >
            Consumer Services
          </motion.h1>
          <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="text-lg text-slate-600 leading-relaxed"
  >
            We are progressively digitizing SORECO-1 operations. Currently, two high-priority services can be filed and tracked completely online.
          </motion.p>
        </div>

        {
    /* Services Cards */
  }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-24">
          {
    /* Card 1: Reconnection of Service */
  }
          <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -8 }}
    className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col justify-between"
  >
            <div>
              <div className="mb-8 w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 font-poppins mb-4">Reconnection of Service</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Submit an application to restore power to your premises after disconnected service due to unpaid balances or temporary closures. Simply provide your account number and payment receipt.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Require official payment reference/receipt</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Fast-tracked processing in 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>View status of physical crew dispatch</span>
                </div>
              </div>
            </div>

            <Link to="/services/reconnection">
              <button className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all flex items-center justify-center gap-2 group">
                View Service Details <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {
    /* Card 2: Billing Dispute */
  }
          <motion.div
    initial={{ opacity: 0, x: 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -8 }}
    className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col justify-between"
  >
            <div>
              <div className="mb-8 w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 font-poppins mb-4">Billing Dispute</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Lodge formal disputes regarding high consumption spikes, meter readings discrepancies, or double payments. Provide photographs of your meter glass face and bill statements.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Require photograph of current meter face</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Interactive messaging with dispute officers</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Suspends standard penalty timeline during audit</span>
                </div>
              </div>
            </div>

            <Link to="/services/billing-dispute">
              <button className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center justify-center gap-2 group">
                View Dispute Details <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>

        {
    /* Notice of progress */
  }
        <div className="bg-[#FFF5EC] border border-[#F4A261]/15 rounded-[2.5rem] p-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <ShieldAlert className="h-12 w-12 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-extrabold text-slate-900 text-lg font-poppins mb-1">Additional Services coming soon!</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              We are working to integrate online applications for **New Connection Installation**, **Change of Billing Name**, and **Sub-Meter Permissions** into the digital portal. For now, please visit our main Bulan office for these requests.
            </p>
          </div>
        </div>
      </div>
    </div>;
};
