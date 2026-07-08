import { useState, useEffect, useRef } from "react";
import { api } from "@/src/lib/api";
import { compressImage } from "@/src/lib/imageCompressor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  Ticket,
  Megaphone,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Truck,
  Clock,
  Trash2,
  Plus,
  FileText,
  Zap,
  Settings,
  Image as ImageIcon,
  Save,
  Star,
  AlertCircle,
  Edit,
  UserPlus,
  Shield,
  Lock,
  MapPin,
  Phone,
  Mail,
  Database,
  Copy,
  ShieldAlert
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
export const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [users, setUsers] = useState([]);
  const [userSearchFilter, setUserSearchFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    accountNumber: "",
    role: "consumer",
    phoneNumber: "",
    address: ""
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const fileInputRef = useRef(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const fetchBackendStatus = async () => {
    try {
      const status = await api.backend.status();
      setBackendStatus(status);
    } catch (err) {
      console.error("Failed to fetch backend status:", err);
    }
  };
  const fetchData = async () => {
    try {
      const [ticketsData, announcementsData, settingsData, usersData] = await Promise.all([
        api.tickets.list(),
        api.announcements.list(),
        api.settings.get("system"),
        api.users.list()
      ]);
      setTickets(ticketsData);
      setAnnouncements(announcementsData);
      if (settingsData.value) {
        setLogoPreview(JSON.parse(settingsData.value).logoUrl);
      }
      setUsers(usersData);
      try {
        const inquiriesData = await api.inquiries.list();
        setInquiries(inquiriesData);
      } catch (inqErr) {
        console.warn("Failed to load inquiries. Table might not be ready yet.", inqErr);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    fetchBackendStatus();
    const interval = setInterval(() => {
      fetchData();
      fetchBackendStatus();
    }, 3e4);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Clock className="h-8 w-8 animate-spin text-primary" />
          <p className="text-slate-500 animate-pulse">Loading Admin Dashboard...</p>
        </div>
      </div>;
  }
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.announcements.create(newAnnouncement);
      toast.success("Announcement published");
      setNewAnnouncement({ title: "", content: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to publish announcement");
    }
  };
  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.announcements.delete(id);
      toast.success("Announcement deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };
  const handleEditUser = (user) => {
    setEditingUser(user);
  };
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.users.update(editingUser.id, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        accountNumber: editingUser.accountNumber,
        role: editingUser.role,
        phoneNumber: editingUser.phoneNumber || "",
        address: editingUser.address || ""
      });
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    }
  };
  const handleDeleteUser = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setUserToDelete(user);
    }
  };
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.users.create(newUser);
      toast.success("User created successfully");
      setIsCreatingUser(false);
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        accountNumber: "",
        role: "consumer",
        phoneNumber: "",
        address: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to create user");
    }
  };
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 256, 0.7);
        setLogoPreview(compressed);
      } catch (err) {
        console.warn("Error compressing logo, falling back:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleUpdateSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await api.settings.set("system", JSON.stringify({
        logoUrl: logoPreview,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }));
      toast.success("System settings updated");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdatingSettings(false);
    }
  };
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    reviewing: tickets.filter((t) => t.status === "reviewing").length,
    dispatched: tickets.filter((t) => t.status === "dispatched").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    urgent: tickets.filter((t) => t.isUrgent === 1).length
  };
  const chartData = [
    { name: "Pending", value: stats.pending, color: "#f59e0b" },
    { name: "Reviewing", value: stats.reviewing, color: "#3b82f6" },
    { name: "Dispatched", value: stats.dispatched, color: "#8b5cf6" },
    { name: "Resolved", value: stats.resolved, color: "#10b981" },
    { name: "Urgent", value: stats.urgent, color: "#ef4444" }
  ];
  const filteredTickets = tickets.filter((ticket) => {
    const searchMatch = !searchFilter || ticket.consumerName.toLowerCase().includes(searchFilter.toLowerCase()) || ticket.id.toLowerCase().includes(searchFilter.toLowerCase());
    const urgencyMatch = urgencyFilter === "all" || urgencyFilter === "urgent" && ticket.isUrgent === 1 || urgencyFilter === "normal" && ticket.isUrgent === 0;
    const statusMatch = statusTab === "all" || ticket.status === statusTab;
    let dateMatch = true;
    if (startDate || endDate) {
      const ticketDate = new Date(ticket.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (ticketDate < start) dateMatch = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (ticketDate > end) dateMatch = false;
      }
    }
    return searchMatch && urgencyMatch && statusMatch && dateMatch;
  });
  return <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
        <p className="text-slate-500">Manage consumer requests and cooperative announcements</p>
      </div>



      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl">
          <TabsTrigger value="analytics" className="gap-2 rounded-lg">
            <BarChart3 className="h-4 w-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2 rounded-lg">
            <Ticket className="h-4 w-4" /> Ticket Management
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 rounded-lg">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2 rounded-lg">
            <Megaphone className="h-4 w-4" /> Announcements
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="gap-2 rounded-lg">
            <Star className="h-4 w-4" /> Feedbacks
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2 rounded-lg">
            <Mail className="h-4 w-4" /> Inquiries
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 rounded-lg">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {
    /* Analytics Tab */
  }
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
    { label: "Total Tickets", value: stats.total, icon: <Ticket className="h-5 w-5" />, color: "bg-slate-100 text-slate-600" },
    { label: "Urgent", value: stats.urgent, icon: <AlertCircle className="h-5 w-5" />, color: "bg-red-100 text-red-600" },
    { label: "Pending", value: stats.pending, icon: <Clock className="h-5 w-5" />, color: "bg-yellow-100 text-yellow-600" },
    { label: "In Progress", value: stats.reviewing + stats.dispatched, icon: <Truck className="h-5 w-5" />, color: "bg-blue-100 text-blue-600" },
    { label: "Resolved", value: stats.resolved, icon: <CheckCircle2 className="h-5 w-5" />, color: "bg-green-100 text-green-600" }
  ].map((stat, i) => <Card key={i} className="border-slate-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={cn("p-3 rounded-xl", stat.color)}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle>Ticket Status Distribution</CardTitle>
                <CardDescription>Real-time volume of requests by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip
    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
    cursor={{ fill: "#f8fafc" }}
  />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from consumers</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[260px]">
                  <div className="space-y-4">
                    {tickets.slice(0, 5).map((ticket) => <div key={ticket.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className={cn(
    "h-10 w-10 rounded-full flex items-center justify-center",
    ticket.type === "billing" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
  )}>
                          {ticket.type === "billing" ? <FileText className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-slate-900">{ticket.consumerName}</p>
                          <p className="text-xs text-slate-500">{ticket.category}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                          {ticket.status}
                        </Badge>
                      </div>)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {
    /* Ticket Management Tab */
  }
        <TabsContent value="tickets">
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <div className="p-0 border-b bg-slate-50/50">
              <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full">
                <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none px-6 gap-6">
                  <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1">All Tickets</TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 underline-offset-8">Pending</TabsTrigger>
                  <TabsTrigger value="reviewing" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 underline-offset-8">Reviewing</TabsTrigger>
                  <TabsTrigger value="dispatched" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 underline-offset-8">Crew Dispatched</TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 underline-offset-8">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
    placeholder="Search by consumer name or ticket ID..."
    className="pl-10 bg-white"
    value={searchFilter}
    onChange={(e) => setSearchFilter(e.target.value)}
  />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <select
    className="bg-transparent border-none outline-none text-sm font-medium"
    value={urgencyFilter}
    onChange={(e) => setUrgencyFilter(e.target.value)}
  >
                        <option value="all">All Urgency</option>
                        <option value="urgent">Urgent Only</option>
                        <option value="normal">Normal Only</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="start-date" className="text-xs text-slate-500">From:</Label>
                    <Input
    id="start-date"
    type="date"
    className="h-8 text-xs bg-white w-32"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date" className="text-xs text-slate-500">To:</Label>
                    <Input
    id="end-date"
    type="date"
    className="h-8 text-xs bg-white w-32"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  />
                  </div>
                  {(searchFilter || urgencyFilter !== "all" || statusTab !== "all" || startDate || endDate) && <Button
    variant="ghost"
    size="sm"
    className="text-xs text-red-500 h-8"
    onClick={() => {
      setSearchFilter("");
      setUrgencyFilter("all");
      setStatusTab("all");
      setStartDate("");
      setEndDate("");
    }}
  >
                      Clear Filters
                    </Button>}
                  <div className="ml-auto text-xs text-slate-400">
                    Showing {filteredTickets.length} of {tickets.length} tickets
                  </div>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consumer</TableHead>
                  <TableHead>Type & Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => <TableRow key={ticket.id} className={cn(ticket.isUrgent === 1 && "bg-red-50/30")}>
                    <TableCell>
                      <div className="font-medium">{ticket.consumerName}</div>
                      <div className="text-xs text-slate-500">Acc: {ticket.accountNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="capitalize w-fit">{ticket.type}</Badge>
                        {ticket.isUrgent === 1 && <Badge variant="destructive" className="text-[10px] w-fit animate-pulse">URGENT</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
    "capitalize",
    ticket.status === "pending" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    ticket.status === "reviewing" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
    ticket.status === "dispatched" && "bg-purple-100 text-purple-700 hover:bg-purple-100",
    ticket.status === "resolved" && "bg-green-100 text-green-700 hover:bg-green-100"
  )}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "Just now..."}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/ticket/${ticket.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" /> View & Manage
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>)}
                {filteredTickets.length === 0 && <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                      No tickets found matching your filters.
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {
    /* Announcements Tab */
  }
        <TabsContent value="announcements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-slate-100 shadow-sm h-fit">
              <CardHeader>
                <CardTitle>New Announcement</CardTitle>
                <CardDescription>Publish a notice to all consumers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
    id="title"
    placeholder="e.g., Scheduled Maintenance"
    required
    value={newAnnouncement.title}
    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
  />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
    id="content"
    placeholder="Provide details about the interruption or news..."
    className="min-h-[120px]"
    required
    value={newAnnouncement.content}
    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
  />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" /> Publish Notice
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle>Manage Announcements</CardTitle>
                <CardDescription>View and delete existing notices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((ann) => <div key={ann.id} className="p-4 border rounded-xl bg-slate-50/50 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{ann.title}</h4>
                        <p className="text-sm text-slate-600">{ann.content}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Published: {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : "Just now..."}
                        </p>
                      </div>
                      <Button
    variant="ghost"
    size="icon"
    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
    onClick={() => handleDeleteAnnouncement(ann.id)}
  >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>)}
                  {announcements.length === 0 && <div className="text-center py-12 text-slate-400">
                      No announcements published yet.
                    </div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {
    /* Feedbacks Tab */
  }
        <TabsContent value="feedbacks">
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Consumer Feedbacks</CardTitle>
              <CardDescription>Review ratings and comments from resolved tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.filter((t) => t.feedback).length > 0 ? tickets.filter((t) => t.feedback).map((ticket) => <div key={ticket.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900">{ticket.consumerName}</h4>
                          <p className="text-xs text-slate-500">Ticket: {ticket.category} (#{ticket.id.substring(0, 8).toUpperCase()})</p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => <Star
    key={s}
    className={cn(
      "h-3 w-3",
      s <= ticket.feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-200"
    )}
  />)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 italic">"{ticket.feedback.comment}"</p>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Submitted: {new Date(ticket.feedback.createdAt).toLocaleString()}
                        </p>
                        <Link to={`/ticket/${ticket.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px]">View Ticket</Button>
                        </Link>
                      </div>
                    </div>) : <div className="text-center py-12 text-slate-400">
                    No feedbacks received yet.
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {
    /* Settings Tab */
  }
        <TabsContent value="settings">
          <Card className="border-slate-100 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure portal-wide branding and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Cooperative Logo</Label>
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-xl bg-slate-50">
                  {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="h-32 w-32 object-contain" /> : <div className="h-32 w-32 bg-slate-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-400" />
                    </div>}
                  <div className="flex gap-2">
                    <Button
    variant="outline"
    size="sm"
    type="button"
    onClick={() => fileInputRef.current?.click()}
  >
                      Change Logo
                    </Button>
                    <input
    ref={fileInputRef}
    type="file"
    className="hidden"
    accept="image/*"
    onChange={handleLogoChange}
  />
                    {logoPreview && <Button variant="ghost" size="sm" onClick={() => setLogoPreview(null)} className="text-red-500">
                        Remove
                      </Button>}
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    This logo will appear in the navigation bar and reports.<br />
                    Recommended: Square aspect ratio, PNG or SVG.
                  </p>
                </div>
              </div>

              <Button
    onClick={handleUpdateSettings}
    className="w-full bg-primary hover:bg-primary/90"
    disabled={isUpdatingSettings}
  >
                {isUpdatingSettings ? <Clock className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {
    /* User Management Tab */
  }
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">User Management System</h2>
              <p className="text-sm text-slate-500">Register new consumers, authorize administrators, and view account directories.</p>
            </div>
            
            <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
              <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 gap-2">
                  <UserPlus className="h-4 w-4" /> Add New User
                </Button>} />
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" /> Register New Account
                  </DialogTitle>
                  <DialogDescription>
                    Create a new administrator or consumer profile. Backed up to local database automatically.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUserSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="create-name">Full Name</Label>
                      <Input
    id="create-name"
    placeholder="John Doe"
    required
    value={newUser.fullName}
    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="create-email">Email Address</Label>
                      <Input
    id="create-email"
    type="email"
    placeholder="john@example.com"
    required
    value={newUser.email}
    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="create-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
    id="create-password"
    type="password"
    placeholder="••••••••"
    className="pl-10"
    required
    value={newUser.password}
    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
  />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-role">Role</Label>
                      <select
    id="create-role"
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    value={newUser.role}
    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
  >
                        <option value="consumer">Consumer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-account">Account Number</Label>
                      <Input
    id="create-account"
    placeholder="01-2345-6789"
    value={newUser.accountNumber}
    onChange={(e) => setNewUser({ ...newUser, accountNumber: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="create-phone">Phone Number</Label>
                      <Input
    id="create-phone"
    placeholder="09123456789"
    value={newUser.phoneNumber}
    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="create-address">Service Address</Label>
                      <Textarea
    id="create-address"
    placeholder="Sorsogon City, Philippines"
    rows={2}
    value={newUser.address}
    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
  />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreatingUser(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">Register Account</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative flex-grow max-w-md w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
    placeholder="Search users by name, email, account no..."
    className="pl-10 bg-white"
    value={userSearchFilter}
    onChange={(e) => setUserSearchFilter(e.target.value)}
  />
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full md:w-auto">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 mr-1 text-xs font-medium">Role:</span>
                <select
    className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer"
    value={userRoleFilter}
    onChange={(e) => setUserRoleFilter(e.target.value)}
  >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="consumer">Consumers</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Profile</TableHead>
                    <TableHead>Account No.</TableHead>
                    <TableHead>Contact Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
    const filteredUsers = users.filter((u) => {
      const searchLower = userSearchFilter.toLowerCase();
      const matchesSearch = !userSearchFilter || u.fullName && u.fullName.toLowerCase().includes(searchLower) || u.email && u.email.toLowerCase().includes(searchLower) || u.accountNumber && u.accountNumber.toLowerCase().includes(searchLower) || u.phoneNumber && u.phoneNumber.toLowerCase().includes(searchLower);
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
    return filteredUsers.map((u) => {
      const initials = u.fullName ? u.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "US";
      const isCurrentUser = u.email === "admin@gov.ph" || u.email === "janry.maligaso@sorsu.edu.ph";
      return <TableRow key={u.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border text-sm">
                                {u.profileImage ? <img src={u.profileImage} alt={u.fullName} className="h-full w-full rounded-full object-cover" /> : initials}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{u.fullName}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" /> {u.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.accountNumber ? <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                {u.accountNumber}
                              </code> : <span className="text-xs text-slate-400 italic">None</span>}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1 text-slate-600">
                              {u.phoneNumber && <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-slate-400" /> {u.phoneNumber}
                                </div>}
                              {u.address && <div className="flex items-center gap-1 max-w-[200px] truncate">
                                  <MapPin className="h-3 w-3 text-slate-400" /> {u.address}
                                </div>}
                              {!u.phoneNumber && !u.address && <span className="text-slate-400 italic">Not provided</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
        "capitalize gap-1.5",
        u.role === "admin" ? "bg-red-50 text-red-700 hover:bg-red-50 border-red-200" : "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
      )} variant="outline">
                              {u.role === "admin" ? <Shield className="h-3 w-3" /> : null}
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Initial Setup"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEditUser(u)}
        title="Edit User"
      >
                                <Edit className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                              </Button>
                              <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDeleteUser(u.id)}
        disabled={isCurrentUser}
        title={isCurrentUser ? "Cannot delete critical system administrator" : "Delete User"}
        className={isCurrentUser ? "opacity-50 cursor-not-allowed" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}
      >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>;
    });
  })()}
                  {users.length === 0 && <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        No users registered matching the filter criteria.
                      </TableCell>
                    </TableRow>}
                </TableBody>
              </Table>
            </div>
          </Card>

          {
    /* Edit User Dialog */
  }
          <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
            {editingUser && <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-primary" /> Modify User Profile
                  </DialogTitle>
                  <DialogDescription>
                    Update details for {editingUser.fullName}. Changes are pushed live immediately.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateUserSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
    id="edit-name"
    required
    value={editingUser.fullName || ""}
    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input
    id="edit-email"
    type="email"
    required
    value={editingUser.email || ""}
    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
  />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <select
    id="edit-role"
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    value={editingUser.role || "consumer"}
    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
  >
                        <option value="consumer">Consumer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-account">Account Number</Label>
                      <Input
    id="edit-account"
    placeholder="01-2345-6789"
    value={editingUser.accountNumber || ""}
    onChange={(e) => setEditingUser({ ...editingUser, accountNumber: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input
    id="edit-phone"
    placeholder="09123456789"
    value={editingUser.phoneNumber || ""}
    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
  />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="edit-address">Service Address</Label>
                      <Textarea
    id="edit-address"
    placeholder="Sorsogon City, Philippines"
    rows={2}
    value={editingUser.address || ""}
    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
  />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">Save Changes</Button>
                  </div>
                </form>
              </DialogContent>}
          </Dialog>

          {
    /* Delete User Confirmation Dialog */
  }
          <Dialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
            {userToDelete && <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" /> Confirm User Deletion
                  </DialogTitle>
                  <DialogDescription>
                    This action is irreversible. Are you sure you want to delete this user?
                  </DialogDescription>
                </DialogHeader>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 my-2 space-y-1.5">
                  <div className="text-sm font-semibold text-slate-800">{userToDelete.fullName}</div>
                  <div className="text-xs text-slate-500">{userToDelete.email}</div>
                  {userToDelete.accountNumber && <div className="text-xs text-slate-500">
                      Account: <code className="font-mono bg-slate-200 px-1 rounded">{userToDelete.accountNumber}</code>
                    </div>}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
                  <Button
    type="button"
    variant="destructive"
    onClick={async () => {
      const id = userToDelete.id;
      setUserToDelete(null);
      try {
        await api.users.delete(id);
        toast.success("User deleted successfully");
        fetchData();
      } catch (error) {
        toast.error(error.message || "Failed to delete user");
      }
    }}
  >
                    Delete User
                  </Button>
                </div>
              </DialogContent>}
          </Dialog>
        </TabsContent>

        {
    /* Inquiries Tab */
  }
        <TabsContent value="inquiries" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">General Inquiries & Messages</h2>
              <p className="text-sm text-slate-500">Monitor general contact form submissions from the public web form.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {inquiries && inquiries.length > 0 ? inquiries.map((inq) => <Card key={inq.id} className="border-slate-100 shadow-sm overflow-hidden hover:border-slate-200 transition-colors">
                  <CardHeader className="bg-slate-50/50 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="font-mono text-[10px] bg-slate-200 text-slate-700 hover:bg-slate-200">
                          {inq.id}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(inq.createdAt || inq.createdat).toLocaleString()}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 mt-1">
                        {inq.subject}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col sm:items-end text-xs text-slate-500">
                      <div className="font-bold text-slate-800">{inq.fullName}</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-start sm:justify-end">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {inq.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {inq.phone}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100/50">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {inq.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>) : <Card className="border-slate-100 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-4">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No inquiries yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    All inquiry form submissions from the contact page will be saved here in real-time.
                  </p>
                </CardContent>
              </Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
