import { CheckCircle2, Clock, Truck, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
export const ServiceTracker = ({ status }) => {
  const stages = [
    { id: "pending", label: "Submitted", icon: <Clock className="h-5 w-5" /> },
    { id: "reviewing", label: "Admin Reviewing", icon: <CheckCircle2 className="h-5 w-5" /> },
    { id: "dispatched", label: "Crew Dispatched", icon: <Truck className="h-5 w-5" /> },
    { id: "resolved", label: "Resolved", icon: <CheckCircle className="h-5 w-5" /> }
  ];
  const getCurrentIndex = () => {
    return stages.findIndex((s) => s.id === status);
  };
  const currentIndex = getCurrentIndex();
  return <div className="w-full py-6">
      <div className="relative flex justify-between">
        {
    /* Progress Line */
  }
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        <div
    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
    style={{ width: `${currentIndex / (stages.length - 1) * 100}%` }}
  />

        {stages.map((stage, index) => {
    const isActive = index <= currentIndex;
    const isCurrent = index === currentIndex;
    return <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
        isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white text-slate-300 border-2 border-slate-100",
        isCurrent && "ring-4 ring-primary/20"
      )}
    >
                {stage.icon}
              </div>
              <span className={cn(
      "mt-2 text-[10px] sm:text-xs font-medium text-center max-w-[80px]",
      isActive ? "text-primary" : "text-slate-400"
    )}>
                {stage.label}
              </span>
            </div>;
  })}
      </div>
    </div>;
};
