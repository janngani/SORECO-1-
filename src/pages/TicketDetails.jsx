import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { compressImage } from "@/src/lib/imageCompressor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle2,
  Truck,
  MessageSquare,
  Image as ImageIcon,
  Camera,
  RotateCcw,
  Star
} from "lucide-react";
import { ServiceTracker } from "@/src/components/ServiceTracker";
import { cn } from "@/lib/utils";
export const TicketDetails = () => {
  const { id } = useParams();
  const { user, userData, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [newPreviewImage, setNewPreviewImage] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const scrollRef = useRef(null);
  const fetchTicket = async () => {
    if (!id) return;
    try {
      const data = await api.tickets.get(id);
      setTicket(data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Ticket not found");
      navigate(isAdmin ? "/admin" : "/dashboard");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 1e4);
    return () => clearInterval(interval);
  }, [id]);
  useEffect(() => {
    if (isAdmin && !loading && ticket && ticket.status === "pending") {
      updateTicketStatus(
        "reviewing",
        "Your request is now being reviewed by our team. We will get back to you shortly if more information is needed."
      );
    }
  }, [ticket?.status, isAdmin, loading]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !id || !user) return;
    setIsSending(true);
    try {
      const newMessage = {
        senderId: user.id || user.uid,
        senderName: userData?.fullName || "User",
        text: message.trim(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isAdmin
      };
      const updatedMessages = [...ticket.messages || [], newMessage];
      await api.tickets.update(id, { messages: updatedMessages });
      setMessage("");
      fetchTicket();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  const updateTicketStatus = async (newStatus, automatedMessage) => {
    if (!id || !ticket) return;
    try {
      const updateData = { status: newStatus };
      if (automatedMessage) {
        const newMessage = {
          senderId: "system",
          senderName: "SORECO-1 Support",
          text: automatedMessage,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          isAdmin: true
        };
        updateData.messages = [...ticket.messages || [], newMessage];
      }
      await api.tickets.update(id, updateData);
      toast.success(`Ticket status updated to ${newStatus}`);
      fetchTicket();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.7);
        setNewPreviewImage(compressed);
      } catch (err) {
        console.warn("Error compressing image, falling back:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleUpdateImage = async () => {
    if (!id || !newPreviewImage) return;
    setIsUpdatingImage(true);
    try {
      const systemMessage = {
        senderId: "system",
        senderName: "System",
        text: "Consumer has updated the evidence image.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isAdmin: true
      };
      const updatedMessages = [...ticket.messages || [], systemMessage];
      await api.tickets.update(id, {
        evidenceImage: newPreviewImage,
        messages: updatedMessages
      });
      setNewPreviewImage(null);
      toast.success("Evidence image updated successfully");
      fetchTicket();
    } catch (error) {
      toast.error("Failed to update image");
    } finally {
      setIsUpdatingImage(false);
    }
  };
  const requestClearerPicture = async () => {
    if (!id || !user) return;
    try {
      const newMessage = {
        senderId: user.id || user.uid,
        senderName: userData?.fullName || "Staff",
        text: "Hello! Could you please provide a clearer picture of your evidence? The current one is a bit blurry and we need a better view to process your request.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isAdmin: true
      };
      const updatedMessages = [...ticket.messages || [], newMessage];
      await api.tickets.update(id, { messages: updatedMessages });
      toast.success("Request for clearer picture sent");
      fetchTicket();
    } catch (error) {
      toast.error("Failed to send request");
    }
  };
  const handleSubmitFeedback = async () => {
    if (!id) return;
    setIsSubmittingFeedback(true);
    try {
      await api.tickets.update(id, {
        feedback: {
          rating: feedbackRating,
          comment: feedbackComment.trim(),
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      toast.success("Thank you for your feedback!");
      fetchTicket();
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  if (!ticket) return null;
  return <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
    variant="ghost"
    onClick={() => navigate(-1)}
    className="mb-6 gap-2 text-slate-500 hover:text-slate-900"
  >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {
    /* Left Column: Ticket Info */
  }
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="capitalize">
                  {ticket.type}
                </Badge>
                <Badge className={cn(
    "capitalize",
    ticket.status === "pending" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    ticket.status === "reviewing" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
    ticket.status === "dispatched" && "bg-purple-100 text-purple-700 hover:bg-purple-100",
    ticket.status === "resolved" && "bg-green-100 text-green-700 hover:bg-green-100"
  )}>
                  {ticket.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{ticket.category}</CardTitle>
              <CardDescription>Ticket ID: {ticket.id.substring(0, 8).toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-slate-500 mb-1">Consumer</p>
                <p className="font-medium">{ticket.consumerName}</p>
                <p className="text-xs text-slate-400">Account: {ticket.accountNumber}</p>
              </div>
              <div className="text-sm">
                <p className="text-slate-500 mb-1">Description</p>
                <p className="text-slate-700 leading-relaxed">{ticket.description}</p>
              </div>
              {ticket.evidenceImage && <div className="pt-2">
                  <p className="text-sm text-slate-500 mb-2">Attached Evidence</p>
                  <div className="relative group">
                    <img
    src={newPreviewImage || ticket.evidenceImage}
    alt="Evidence"
    className="w-full rounded-lg border border-slate-100 shadow-sm"
  />
                    {!isAdmin && ticket.status !== "resolved" && <div className="mt-3 space-y-2">
                        {!newPreviewImage ? <label className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                            <Camera className="h-4 w-4" /> Change Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          </label> : <div className="flex gap-2">
                            <Button
    size="sm"
    className="flex-grow bg-primary hover:bg-primary/90"
    onClick={handleUpdateImage}
    disabled={isUpdatingImage}
  >
                              {isUpdatingImage ? <Clock className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                              Save New Image
                            </Button>
                            <Button
    size="sm"
    variant="outline"
    onClick={() => setNewPreviewImage(null)}
    disabled={isUpdatingImage}
  >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>}
                      </div>}
                  </div>
                </div>}

              {isAdmin && <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-bold text-slate-900">Admin Actions</p>
                  <div className="flex flex-col gap-2">
                    <Button
    size="sm"
    variant="outline"
    onClick={requestClearerPicture}
    className="justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
  >
                      <ImageIcon className="h-4 w-4" /> Request Clearer Picture
                    </Button>
                    <Button
    size="sm"
    variant={ticket.status === "reviewing" ? "default" : "outline"}
    onClick={() => updateTicketStatus(
      "reviewing",
      "Your request is currently being reviewed by our technical team."
    )}
    className="justify-start gap-2"
  >
                      <Clock className="h-4 w-4" /> Set to Reviewing
                    </Button>
                    <Button
    size="sm"
    variant={ticket.status === "dispatched" ? "default" : "outline"}
    onClick={() => updateTicketStatus(
      "dispatched",
      "A technical crew has been dispatched to your location. Please ensure our personnel have access to the meter or service area."
    )}
    className="justify-start gap-2 bg-purple-600 hover:bg-purple-700 text-white"
  >
                      <Truck className="h-4 w-4" /> Dispatch Crew
                    </Button>
                    <Button
    size="sm"
    variant={ticket.status === "resolved" ? "default" : "outline"}
    onClick={() => updateTicketStatus(
      "resolved",
      "Great news! Your service request has been resolved. If you have any further questions or if the issue persists, feel free to chat with us here. Thank you!"
    )}
    className="justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
  >
                      <CheckCircle2 className="h-4 w-4" /> Mark Resolved
                    </Button>
                  </div>
                </div>}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Service Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceTracker status={ticket.status} />
            </CardContent>
          </Card>

          {
    /* Feedback Section */
  }
          {ticket.status === "resolved" && <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-green-50/50 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 
                  Consumer Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {ticket.feedback ? <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => <Star
    key={s}
    className={cn(
      "h-4 w-4",
      s <= ticket.feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-200"
    )}
  />)}
                    </div>
                    <p className="text-sm text-slate-700 italic">"{ticket.feedback.comment}"</p>
                    <p className="text-[10px] text-slate-400">Submitted on {new Date(ticket.feedback.createdAt).toLocaleDateString()}</p>
                  </div> : !isAdmin ? <div className="space-y-4">
                    <p className="text-xs text-slate-500">How would you rate our service?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => <button
    key={s}
    onClick={() => setFeedbackRating(s)}
    className="focus:outline-none"
  >
                          <Star
    className={cn(
      "h-6 w-6 transition-all",
      s <= feedbackRating ? "text-yellow-500 fill-yellow-500 scale-110" : "text-slate-200 hover:text-yellow-200"
    )}
  />
                        </button>)}
                    </div>
                    <textarea
    placeholder="Any additional comments?"
    className="w-full min-h-[80px] p-3 text-sm border rounded-lg focus:ring-1 focus:ring-primary outline-none"
    value={feedbackComment}
    onChange={(e) => setFeedbackComment(e.target.value)}
  />
                    <Button
    className="w-full bg-green-600 hover:bg-green-700 text-white"
    onClick={handleSubmitFeedback}
    disabled={isSubmittingFeedback}
  >
                      {isSubmittingFeedback ? <Clock className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Submit Feedback
                    </Button>
                  </div> : <div className="text-center py-4">
                    <p className="text-xs text-slate-400 italic">No feedback provided yet.</p>
                  </div>}
              </CardContent>
            </Card>}
        </div>

        {
    /* Right Column: Chat Thread */
  }
        <div className="lg:col-span-2">
          <Card className="border-slate-100 shadow-lg h-[600px] flex flex-col">
            <CardHeader className="border-b py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">In-Ticket Chat</CardTitle>
                  <CardDescription>Direct communication with SORECO-1 Staff</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow p-0 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                  {ticket.messages && ticket.messages.length > 0 ? ticket.messages.map((msg, i) => {
    const isMe = msg.senderId === user?.uid;
    return <div
      key={i}
      className={cn(
        "flex flex-col max-w-[80%]",
        isMe ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {msg.senderName} {msg.isAdmin && "(Staff)"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className={cn(
      "px-4 py-2 rounded-2xl text-sm shadow-sm",
      isMe ? "bg-primary text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
    )}>
                            {msg.text}
                          </div>
                        </div>;
  }) : <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
    placeholder="Type your message here..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    className="flex-grow focus-visible:ring-primary"
    disabled={isSending}
  />
                <Button
    type="submit"
    size="icon"
    className="bg-primary hover:bg-primary/90 text-white shrink-0"
    disabled={isSending || !message.trim()}
  >
                  {isSending ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>;
};
