import { useEffect, useRef } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
import { MessageSquare, Ticket } from "lucide-react";
export const NotificationListener = () => {
  const { user, isAdmin } = useAuth();
  const lastTicketId = useRef(null);
  const lastMessageCount = useRef({});
  useEffect(() => {
    if (!user) return;
    const checkNotifications = async () => {
      try {
        const tickets = await api.tickets.list();
        if (isAdmin && tickets.length > 0) {
          const latestTicket = tickets[0];
          if (lastTicketId.current && lastTicketId.current !== latestTicket.id) {
            toast(`New ${latestTicket.type} request`, {
              description: `From ${latestTicket.consumerName} for ${latestTicket.category}`,
              icon: <Ticket className="h-4 w-4 text-primary" />
            });
          }
          lastTicketId.current = latestTicket.id;
        }
        tickets.forEach((ticket) => {
          const messages = ticket.messages || [];
          const currentCount = messages.length;
          const previousCount = lastMessageCount.current[ticket.id] || 0;
          if (previousCount > 0 && currentCount > previousCount) {
            const lastMessage = messages[messages.length - 1];
            const myId = user.id || user.uid;
            if (lastMessage.senderId !== myId) {
              toast(`New message in Ticket #${ticket.id.substring(0, 5)}`, {
                description: `${lastMessage.senderName}: ${lastMessage.text.substring(0, 30)}${lastMessage.text.length > 30 ? "..." : ""}`,
                icon: <MessageSquare className="h-4 w-4 text-primary" />
              });
            }
          }
          lastMessageCount.current[ticket.id] = currentCount;
        });
      } catch (error) {
        const errMsg = error?.message || "";
        if (errMsg.includes("Failed to fetch") || errMsg.includes("401") || errMsg.includes("unauthorized")) {
          return;
        }
        console.error("Notification check error:", error);
      }
    };
    const interval = setInterval(checkNotifications, 1e4);
    checkNotifications();
    return () => clearInterval(interval);
  }, [user, isAdmin]);
  return null;
};
