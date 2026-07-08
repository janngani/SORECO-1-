import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { compressImage } from "@/src/lib/imageCompressor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  Calendar
} from "lucide-react";
import { ServiceTracker } from "@/src/components/ServiceTracker";
import { cn } from "@/lib/utils";
export const ConsumerDashboard = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [requestType, setRequestType] = useState("billing");
  const [billingCategory, setBillingCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [checklist, setChecklist] = useState({
    paid: false,
    receiptReady: false,
    accessClear: false
  });
  const fetchData = async () => {
    try {
      const [ticketsData, announcementsData] = await Promise.all([
        api.tickets.list(),
        api.announcements.list()
      ]);
      setTickets(ticketsData);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(fetchData, 3e4);
    return () => clearInterval(interval);
  }, [user]);
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.7);
        setPreviewImage(compressed);
      } catch (err) {
        console.warn("Error compressing image, falling back:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await api.tickets.create({
        consumerName: userData?.fullName,
        accountNumber: userData?.accountNumber,
        type: requestType,
        category: requestType === "billing" ? billingCategory : "Reconnection",
        description,
        isUrgent,
        evidenceImage: previewImage,
        checklist: requestType === "reconnection" ? checklist : null
      });
      toast.success("Request submitted successfully!");
      setPreviewImage(null);
      setDescription("");
      setBillingCategory("");
      setIsUrgent(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {
    /* --------------------------------------------------------
       Welcome Banner
       -------------------------------------------------------- */
  }
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              Sorsogon Consumer Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">{userData?.fullName || "Valued Consumer"}</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Track outstanding requests, file a dispute, or contact dispatch personnel right from your digital space.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[240px] space-y-2 w-full md:w-auto">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Account Details</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Account No:</span>
                <span className="font-mono font-semibold text-indigo-300">{userData?.accountNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Address:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[120px]">{userData?.address || "Sorsogon"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
    /* --------------------------------------------------------
       Pills/Filters Row
       -------------------------------------------------------- */
  }
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
    {
      id: "pending",
      label: "Pending",
      count: tickets.filter((t) => t.status === "pending").length,
      color: "border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100/50",
      activeColor: "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/10"
    },
    {
      id: "approved",
      label: "Approved",
      count: tickets.filter((t) => t.status === "reviewing" || t.status === "dispatched").length,
      color: "border-sky-200 text-sky-700 bg-sky-50/50 hover:bg-sky-100/50",
      activeColor: "bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-600/10"
    },
    {
      id: "completed",
      label: "Completed",
      count: tickets.filter((t) => t.status === "resolved").length,
      color: "border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50",
      activeColor: "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
    },
    {
      id: "notifications",
      label: "Notifications",
      count: tickets.reduce((acc, t) => {
        try {
          const msgs = JSON.parse(t.messages || "[]");
          return acc + (msgs.length > 0 ? 1 : 0);
        } catch {
          return acc;
        }
      }, 0),
      color: "border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50",
      activeColor: "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
    }
  ].map((tab) => {
    const isActive = activeFilter === tab.id;
    return <button
      key={tab.id}
      onClick={() => setActiveFilter(tab.id)}
      className={cn(
        "flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer",
        isActive ? tab.activeColor : `${tab.color} border-slate-200`
      )}
    >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className={cn(
      "text-xs font-bold px-2 py-0.5 rounded-full",
      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-800"
    )}>
                  {tab.count}
                </span>}
            </button>;
  })}
      </div>

      {
    /* --------------------------------------------------------
       Active Requests | Quick Actions Grid
       -------------------------------------------------------- */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {
    /* Left pane: Active Requests / Notifications List */
  }
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeFilter === "notifications" ? "System Updates & Alerts" : "Active Requests"}
            </h2>
          </div>

          {loading ? <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div> : activeFilter === "notifications" ? <div className="space-y-4">
              {tickets.length === 0 ? <Card className="border-dashed border-2 bg-slate-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No alerts found.</p>
                    <p className="text-slate-400 text-xs">We'll notify you here if your request status updates.</p>
                  </CardContent>
                </Card> : <div className="space-y-3">
                  {tickets.map((t) => {
    let messages = [];
    try {
      messages = JSON.parse(t.messages || "[]");
    } catch {
    }
    const lastMsg = messages[messages.length - 1];
    return <Card key={t.id} className="border-slate-100 hover:border-slate-200 transition-colors shadow-sm">
                        <CardContent className="p-4 flex gap-3 items-start">
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mt-1">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="flex-grow space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-800 text-sm">Ticket Update: {t.category}</span>
                              <Badge variant="outline" className="text-[10px] capitalize">{t.status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500">
                              {lastMsg ? `Last message: "${lastMsg.text}"` : `Your ticket is currently ${t.status}. No chat activity yet.`}
                            </p>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-[10px] text-slate-400">ID: {t.id.substring(0, 8).toUpperCase()}</span>
                              <Link to={`/ticket/${t.id}`}>
                                <Button size="sm" variant="link" className="h-auto p-0 text-xs text-indigo-600 font-semibold hover:text-indigo-800">
                                  Open Chat & Details →
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>;
  })}
                </div>}
            </div> : (() => {
    const filtered = tickets.filter((t) => {
      if (activeFilter === "pending") return t.status === "pending";
      if (activeFilter === "approved") return t.status === "reviewing" || t.status === "dispatched";
      if (activeFilter === "completed") return t.status === "resolved";
      return true;
    });
    if (filtered.length === 0) {
      return <Card className="border-dashed border-2 bg-slate-50/30 border-slate-200 rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
                    {
        /* Beautiful customized SVG illustration */
      }
                    <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 bg-indigo-50 rounded-full animate-pulse opacity-40" />
                      <div className="absolute inset-4 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No requests matching "{activeFilter}"</h3>
                    <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                      You don't have any requests under this tab. Click the button below to submit a reconnection or billing issue.
                    </p>
                    <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-6 py-2.5 transition-all duration-200"
      >
                      <Plus className="h-4 w-4 mr-2" /> Request Service
                    </Button>
                  </CardContent>
                </Card>;
    }
    return <div className="space-y-4">
                {filtered.map((ticket) => <Card key={ticket.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50/50 border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={cn(
      "p-2 rounded-lg",
      ticket.type === "billing" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
    )}>
                            {ticket.type === "billing" ? <FileText className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800">
                              {ticket.category}
                              {(ticket.isUrgent === 1 || ticket.isUrgent === true) && <Badge variant="destructive" className="text-[10px] animate-pulse">URGENT</Badge>}
                            </CardTitle>
                            <CardDescription className="text-xs">Ticket ID: {ticket.id.substring(0, 8).toUpperCase()}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={ticket.status === "resolved" ? "default" : "secondary"} className={cn(
      "capitalize text-xs font-semibold px-2 py-1",
      ticket.status === "pending" && "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
      ticket.status === "reviewing" && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
      ticket.status === "dispatched" && "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
      ticket.status === "resolved" && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
    )}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">{ticket.description}</p>
                        <ServiceTracker status={ticket.status} />
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/30 border-t py-3 flex justify-between items-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Submitted on {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "Just now..."}
                      </span>
                      <Link to={`/ticket/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/5">
                          <MessageSquare className="h-4 w-4" /> View Details & Chat
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>)}
              </div>;
  })()}
        </div>

        {
    /* Right pane: Quick Actions */
  }
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          </div>
          
          <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-4 space-y-3.5">
              <button
    onClick={() => {
      setRequestType("reconnection");
      setIsCreateDialogOpen(true);
    }}
    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-orange-100 bg-orange-50/30 text-orange-950 hover:bg-orange-50/70 transition-all font-semibold text-sm cursor-pointer text-left group"
  >
                <div className="flex items-center gap-3">
                  <span className="text-xl bg-orange-100/50 w-8 h-8 rounded-lg flex items-center justify-center">⚡</span>
                  <div className="flex flex-col">
                    <span className="font-bold">Reconnection</span>
                    <span className="text-[10px] text-slate-500 font-normal">Electric/water connection restore</span>
                  </div>
                </div>
                <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
    onClick={() => {
      setRequestType("billing");
      setIsCreateDialogOpen(true);
    }}
    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 text-blue-950 hover:bg-blue-50/70 transition-all font-semibold text-sm cursor-pointer text-left group"
  >
                <div className="flex items-center gap-3">
                  <span className="text-xl bg-blue-100/50 w-8 h-8 rounded-lg flex items-center justify-center">📝</span>
                  <div className="flex flex-col">
                    <span className="font-bold">Billing Dispute</span>
                    <span className="text-[10px] text-slate-500 font-normal">Report overcharging & wrong readings</span>
                  </div>
                </div>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
    onClick={() => setActiveFilter("completed")}
    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 text-slate-950 hover:bg-slate-50/70 transition-all font-semibold text-sm cursor-pointer text-left group"
  >
                <div className="flex items-center gap-3">
                  <span className="text-xl bg-slate-100/50 w-8 h-8 rounded-lg flex items-center justify-center">📄</span>
                  <div className="flex flex-col">
                    <span className="font-bold">Request History</span>
                    <span className="text-[10px] text-slate-500 font-normal">View resolved tickets archive</span>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <Link to="/profile" className="block">
                <div className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 text-slate-950 hover:bg-slate-50/70 transition-all font-semibold text-sm cursor-pointer text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-slate-100/50 w-8 h-8 rounded-lg flex items-center justify-center">👤</span>
                    <div className="flex flex-col">
                      <span className="font-bold">Profile</span>
                      <span className="text-[10px] text-slate-500 font-normal">Manage settings & contact details</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {
    /* --------------------------------------------------------
       Announcements | Recent Activity Panels
       -------------------------------------------------------- */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
        {
    /* Left Bottom Column: Announcements */
  }
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-600" /> Announcements
            </h2>
          </div>

          {announcements.length === 0 ? <Card className="border-dashed border-2 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                No announcements published at this time.
              </CardContent>
            </Card> : <div className="space-y-4">
              {announcements.slice(0, 3).map((ann) => <Card key={ann.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-slate-800">{ann.title}</CardTitle>
                    <CardDescription className="text-[10px]">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : "Published recently"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                  </CardContent>
                </Card>)}
            </div>}
        </div>

        {
    /* Right Bottom Column: Recent Activity */
  }
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" /> Recent Activity
            </h2>
          </div>

          <Card className="border-slate-100 shadow-sm bg-white">
            <CardContent className="p-5">
              {tickets.length === 0 ? <div className="text-center py-12 text-slate-400 text-sm leading-relaxed">
                  No recent activities or transaction history recorded.
                </div> : <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 py-2">
                  {tickets.slice(0, 4).map((t, idx) => {
    let activityText = "";
    let timeText = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Just now";
    if (t.status === "pending") {
      activityText = `Submitted request for ${t.type === "billing" ? "Billing Dispute" : "Reconnection"}: "${t.category}"`;
    } else if (t.status === "resolved") {
      activityText = `Request for "${t.category}" has been marked as Completed.`;
    } else {
      activityText = `Request for "${t.category}" transitioned to status: ${t.status}`;
    }
    return <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1.5 bg-white border border-slate-300 rounded-full h-2.5 w-2.5 flex items-center justify-center z-10">
                          <span className="h-1 w-1 rounded-full bg-slate-400" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-700 font-medium leading-normal">{activityText}</p>
                          <span className="text-[9px] text-slate-400 block">{timeText} • ID: {t.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                      </div>;
  })}
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {
    /* Controlled Dialog Form */
  }
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Select the type of service you need and provide details.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={requestType} value={requestType} onValueChange={(v) => setRequestType(v)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="billing" className="gap-2">
                <FileText className="h-4 w-4" /> Billing Dispute
              </TabsTrigger>
              <TabsTrigger value="reconnection" className="gap-2">
                <Zap className="h-4 w-4" /> Reconnection
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="billing" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label>Dispute Category</Label>
                  <Select onValueChange={setBillingCategory} required value={billingCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overcharge">Overcharging / High Bill</SelectItem>
                      <SelectItem value="wrong-reading">Wrong Meter Reading</SelectItem>
                      <SelectItem value="payment-not-reflected">Payment Not Reflected</SelectItem>
                      <SelectItem value="other">Other Billing Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="reconnection" className="space-y-4 mt-0">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <Label className="text-sm font-bold flex items-center gap-2 text-slate-800">
                    <AlertCircle className="h-4 w-4 text-primary" /> Pre-submission Checklist
                  </Label>
                  <div className="space-y-2">
                    {[
    { id: "paid", label: "I have paid all outstanding balances" },
    { id: "receiptReady", label: "I have the proof of payment ready" },
    { id: "accessClear", label: "Meter area is accessible for crew" }
  ].map((item) => <div key={item.id} className="flex items-center gap-2">
                        <input
    type="checkbox"
    id={item.id}
    className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
    onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
    required
  />
                        <Label htmlFor={item.id} className="text-xs font-normal cursor-pointer text-slate-600">
                          {item.label}
                        </Label>
                      </div>)}
                  </div>
                </div>
              </TabsContent>

              <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-100">
                <input
    type="checkbox"
    id="isUrgent"
    className="rounded border-red-300 text-red-600 focus:ring-red-500 h-4 w-4"
    checked={isUrgent}
    onChange={(e) => setIsUrgent(e.target.checked)}
  />
                <Label htmlFor="isUrgent" className="text-sm font-bold text-red-700 cursor-pointer flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> This request is URGENT
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
    id="description"
    placeholder="Please provide more details about your request..."
    className="min-h-[100px]"
    required
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
              </div>

              <div className="space-y-2">
                <Label>Supporting Document / Proof of Payment</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    {previewImage ? <img src={previewImage} alt="Preview" className="h-full w-full object-contain p-2" /> : <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500 font-semibold">Click to upload image</p>
                        <p className="text-xs text-slate-400">PNG, JPG or JPEG</p>
                      </div>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Submit Request
              </Button>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>;
};
