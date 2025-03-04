import { useState } from "react";
import { Users } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function PartnerMenu() {
  const [partnerUsername, setPartnerUsername] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: requests } = useQuery({
    queryKey: ["/api/partner/requests"],
    enabled: !!user,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/partner/request", {
        receiverUsername: username,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Partner request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/requests"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send partner request.",
      });
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: number;
      status: "accepted" | "rejected";
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/partner/request/${requestId}/respond`,
        { status }
      );
      return res.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === "accepted" ? "Partner Connected!" : "Request Rejected",
        description:
          status === "accepted"
            ? "You can now match movies with your partner!"
            : "Partner request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/requests"] });
    },
  });

  const pendingRequests = requests?.filter((req: any) => req.status === "pending");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Users className="h-5 w-5" />
          {pendingRequests?.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Connect with Partner
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect with Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Partner's username"
                  value={partnerUsername}
                  onChange={(e) => setPartnerUsername(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  sendRequestMutation.mutate(partnerUsername);
                  setPartnerUsername("");
                }}
                disabled={!partnerUsername.trim()}
              >
                Send Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {pendingRequests?.map((request: any) => (
          <DropdownMenuItem
            key={request.id}
            className="flex flex-col items-start"
          >
            <p className="text-sm">
              Request from: <strong>{request.senderUsername}</strong>
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() =>
                  respondToRequestMutation.mutate({
                    requestId: request.id,
                    status: "accepted",
                  })
                }
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  respondToRequestMutation.mutate({
                    requestId: request.id,
                    status: "rejected",
                  })
                }
              >
                Reject
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
