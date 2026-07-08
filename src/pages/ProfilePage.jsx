import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/src/lib/api";
import { compressImage } from "@/src/lib/imageCompressor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Save,
  Loader2,
  Phone,
  MapPin,
  Camera,
  ArrowLeft,
  ClipboardCheck,
  Eye,
  Edit,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
export const ProfilePage = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [accountNumber, setAccountNumber] = useState(userData?.accountNumber || "");
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [profileImage, setProfileImage] = useState(userData?.profileImage || "");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [fetchingTickets, setFetchingTickets] = useState(true);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("billing");
  const [editIsUrgent, setEditIsUrgent] = useState(false);
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const fetchTickets = async () => {
    try {
      const list = await api.tickets.list();
      setTickets(list);
    } catch (err) {
      console.error("Error fetching user tickets:", err);
    } finally {
      setFetchingTickets(false);
    }
  };
  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 256, 0.7);
        setProfileImage(compressed);
      } catch (err) {
        console.warn("Error compressing image, falling back:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.auth.updateProfile({
        fullName,
        phoneNumber,
        address,
        profileImage,
        accountNumber
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setEditCategory(ticket.category || "");
    setEditDescription(ticket.description || "");
    setEditType(ticket.type || "billing");
    setEditIsUrgent(ticket.isUrgent === 1);
  };
  const handleUpdateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsUpdatingTicket(true);
    try {
      await api.tickets.update(editingTicket.id, {
        category: editCategory,
        description: editDescription,
        type: editType,
        isUrgent: editIsUrgent
      });
      toast.success("Service request updated successfully");
      setEditingTicket(null);
      await fetchTickets();
    } catch (err) {
      toast.error("Failed to update request");
    } finally {
      setIsUpdatingTicket(false);
    }
  };
  const handleCancelTicket = async (ticketId) => {
    const confirm = window.confirm("Are you sure you want to cancel this request? Once cancelled, it will be locked and you cannot edit it further.");
    if (!confirm) return;
    try {
      await api.tickets.update(ticketId, { status: "cancelled" });
      toast.success("Request cancelled successfully");
      await fetchTickets();
    } catch (err) {
      toast.error("Failed to cancel request");
    }
  };
  return <div className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
      <div className="flex justify-start">
        <Button
    variant="ghost"
    onClick={() => navigate(-1)}
    className="gap-2 text-slate-600 hover:text-slate-900 transition-colors"
  >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {
    /* Profile Details Card */
  }
      <Card className="border-slate-100 shadow-xl overflow-hidden">
        <div className="h-32 bg-primary/10 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.fullName}`} />
                <AvatarFallback>{userData?.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="h-6 w-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
        </div>
        
        <CardHeader className="pt-16 pb-4">
          <CardTitle className="text-2xl font-bold">{userData?.fullName}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Shield className="h-3 w-3" /> {userData?.role?.toUpperCase()} ACCOUNT
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-500">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
    id="fullName"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    className="pl-10"
  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
    value={userData?.email || ""}
    disabled
    className="pl-10 bg-slate-50 border-slate-100 text-slate-500"
  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Email cannot be changed online for security reasons.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-slate-500">Utility Account Number</Label>
                <Input
    id="accountNumber"
    value={accountNumber}
    onChange={(e) => setAccountNumber(e.target.value)}
    className={cn(
      "font-mono",
      userData?.accountNumber === "PENDING" ? "border-primary/50 bg-primary/5" : ""
    )}
  />
                {userData?.accountNumber === "PENDING" && <p className="text-[10px] text-primary font-medium">Please enter your 10-digit SORECO-1 account number.</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-500">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
    id="phoneNumber"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    placeholder="09XX XXX XXXX"
    className="pl-10"
  />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-500">Service Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
    id="address"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="Barangay, Municipality"
    className="pl-10"
  />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t p-6">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {
    /* My Requests Section */
  }
      <Card className="border-slate-100 shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" /> My Service Requests
          </CardTitle>
          <CardDescription>
            Manage and track your submitted billing audits and reconnection requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingTickets ? <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div> : tickets.length === 0 ? <div className="text-center py-8 text-slate-500 text-sm">
              You have not submitted any service requests yet.
            </div> : <div className="space-y-4">
              {tickets.map((t) => <div key={t.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900">{t.id}</span>
                      <Badge variant={t.type === "reconnection" ? "destructive" : "default"} className="text-[10px] capitalize">
                        {t.type === "billing" ? "Billing Dispute" : "Reconnection"}
                      </Badge>
                      <Badge className={cn(
    "text-[10px] capitalize",
    t.status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    t.status === "reviewing" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
    t.status === "approved" && "bg-green-100 text-green-800 hover:bg-green-100",
    t.status === "completed" && "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    t.status === "cancelled" && "bg-slate-200 text-slate-700 hover:bg-slate-200"
  )}>
                        {t.status}
                      </Badge>
                      {t.isUrgent === 1 && <Badge variant="destructive" className="text-[10px] animate-pulse">URGENT</Badge>}
                    </div>
                    <p className="font-medium text-sm text-slate-800">{t.category}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-md">{t.description}</p>
                    <p className="text-[10px] text-slate-400">Submitted on: {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button
    variant="outline"
    size="sm"
    onClick={() => navigate(`/ticket/${t.id}`)}
    className="text-xs gap-1"
  >
                      <Eye className="h-3 w-3" /> View
                    </Button>

                    {t.status === "pending" && <Button
    variant="outline"
    size="sm"
    onClick={() => openEditModal(t)}
    className="text-xs text-blue-600 border-blue-100 hover:bg-blue-50 hover:text-blue-700 gap-1"
  >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>}

                    {(t.status === "pending" || t.status === "reviewing") && <Button
    variant="outline"
    size="sm"
    onClick={() => handleCancelTicket(t.id)}
    className="text-xs text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 gap-1"
  >
                        <XCircle className="h-3 w-3" /> Cancel
                      </Button>}
                  </div>
                </div>)}
            </div>}
        </CardContent>
      </Card>

      {
    /* Edit Dialog Modal */
  }
      {editingTicket && <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Edit Service Request {editingTicket.id}</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Modify your request details. Changes are allowed only while the status is pending.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTicketSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="editType" className="text-slate-600 text-xs">Request Type</Label>
                <select
    id="editType"
    value={editType}
    onChange={(e) => setEditType(e.target.value)}
    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
  >
                  <option value="billing">Billing Dispute</option>
                  <option value="reconnection">Reconnection</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCategory" className="text-slate-600 text-xs">Category</Label>
                <Input
    id="editCategory"
    value={editCategory}
    onChange={(e) => setEditCategory(e.target.value)}
    placeholder="e.g. High Consumption, Meter Damage"
    required
  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription" className="text-slate-600 text-xs">Description</Label>
                <textarea
    id="editDescription"
    value={editDescription}
    onChange={(e) => setEditDescription(e.target.value)}
    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm h-24 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
    placeholder="Provide more details about your request..."
    required
  />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
    type="checkbox"
    id="editIsUrgent"
    checked={editIsUrgent}
    onChange={(e) => setEditIsUrgent(e.target.checked)}
    className="rounded text-primary focus:ring-primary"
  />
                <Label htmlFor="editIsUrgent" className="text-slate-700 cursor-pointer text-sm">Mark this request as Urgent</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditingTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingTicket} className="bg-primary hover:bg-primary/90 text-white">
                  {isUpdatingTicket ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>}
    </div>;
};
export default ProfilePage;
