"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserBadge } from "@/components/user-badge";
import { Search, MoreVertical, CheckCircle, XCircle, Ban, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserRole } from "@/lib/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastSeenAt: string;
  verified: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedByAdmin?: boolean;
  rejectionReason?: string;
  mediaOutlet?: string;
  company?: string;
  audience?: string;
  professionalTitle?: string;
}

interface UserListProps {
  role?: UserRole;
  title?: string;
  showPendingOnly?: boolean;
}

export function UserList({ role, title = "Users", showPendingOnly = false }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    // In a real app, this would fetch from Firestore
    // For demo purposes, we'll use mock data
    const mockUsers: User[] = [
      {
        id: "1",
        email: "admin@example.com",
        displayName: "Admin User",
        role: "admin",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=80",
        createdAt: "2024-01-01T00:00:00Z",
        lastSeenAt: "2024-03-25T12:30:00Z",
        verified: true
      },
      {
        id: "2",
        email: "musician@example.com",
        displayName: "John Musician",
        role: "musician",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&q=80",
        createdAt: "2024-01-15T00:00:00Z",
        lastSeenAt: "2024-03-24T10:15:00Z",
        verified: true
      },
      {
        id: "3",
        email: "producer@example.com",
        displayName: "Sarah Producer",
        role: "professional",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&q=80",
        createdAt: "2024-02-01T00:00:00Z",
        lastSeenAt: "2024-03-23T18:45:00Z",
        verified: true,
        approvalStatus: 'pending',
        professionalTitle: 'Music Producer',
        company: 'Beats Studio'
      },
      {
        id: "4",
        email: "fan@example.com",
        displayName: "Music Fan",
        role: "fan",
        createdAt: "2024-02-15T00:00:00Z",
        lastSeenAt: "2024-03-22T09:20:00Z",
        verified: false
      },
      {
        id: "5",
        email: "reporter@musicmag.com",
        displayName: "Jane Reporter",
        role: "media",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=32&h=32&q=80",
        createdAt: "2024-03-01T00:00:00Z",
        lastSeenAt: "2024-03-25T14:10:00Z",
        verified: true,
        approvalStatus: 'approved',
        approvedByAdmin: true,
        mediaOutlet: "Music Magazine"
      },
      {
        id: "6",
        email: "blogger@musicblog.com",
        displayName: "Alex Blogger",
        role: "media",
        createdAt: "2024-03-10T00:00:00Z",
        lastSeenAt: "2024-03-24T11:30:00Z",
        verified: false,
        approvalStatus: 'pending',
        approvedByAdmin: false,
        mediaOutlet: "Independent Music Blog"
      },
      {
        id: "7",
        email: "influencer@social.com",
        displayName: "Sam Influencer",
        role: "influencer",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&q=80",
        createdAt: "2024-03-05T00:00:00Z",
        lastSeenAt: "2024-03-26T09:45:00Z",
        verified: true,
        approvalStatus: 'pending',
        audience: "Music lovers, 18-34 age group"
      },
      {
        id: "8",
        email: "agent@agency.com",
        displayName: "Taylor Agent",
        role: "professional",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&q=80",
        createdAt: "2024-03-15T00:00:00Z",
        lastSeenAt: "2024-03-25T16:20:00Z",
        verified: true,
        approvalStatus: 'approved',
        professionalTitle: 'Booking Agent',
        company: 'Top Tier Agency'
      }
    ];

    // Apply initial filters
    let filteredUsers = mockUsers;
    
    // Filter by role if specified
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Show only pending approvals if requested
    if (showPendingOnly) {
      filteredUsers = filteredUsers.filter(user => 
        user.approvalStatus === 'pending' || 
        (user.approvedByAdmin === false && ['professional', 'media', 'influencer'].includes(user.role))
      );
    }
    
    setUsers(filteredUsers);
    setIsLoading(false);
  }, [role, showPendingOnly]);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.mediaOutlet && user.mediaOutlet.toLowerCase().includes(query)) ||
      (user.professionalTitle && user.professionalTitle.toLowerCase().includes(query)) ||
      (user.company && user.company.toLowerCase().includes(query))
    );
  });

  const handleOpenApproveDialog = (user: User) => {
    setSelectedUser(user);
    setConfirmAction('approve');
    setConfirmDialogOpen(true);
  };

  const handleOpenRejectDialog = (user: User) => {
    setSelectedUser(user);
    setConfirmAction('reject');
    setRejectionReason('');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would update the user in Firestore
      const userDocRef = doc(db, 'user_profiles', selectedUser.id);
      
      if (confirmAction === 'approve') {
        await updateDoc(userDocRef, { 
          approvalStatus: 'approved',
          approvedByAdmin: true,
          approvalDate: new Date().toISOString()
        });
        
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                approvalStatus: 'approved', 
                approvedByAdmin: true 
              }
            : user
        ));
      } else {
        await updateDoc(userDocRef, { 
          approvalStatus: 'rejected',
          approvedByAdmin: false,
          rejectionReason: rejectionReason
        });
        
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                approvalStatus: 'rejected', 
                approvedByAdmin: false,
                rejectionReason: rejectionReason
              }
            : user
        ));
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary/50 animate-pulse rounded-md" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  {(role === 'media' || showPendingOnly) && <TableHead>Details</TableHead>}
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserBadge role={user.role} verified={user.verified} />
                    </TableCell>
                    {(role === 'media' || showPendingOnly) && (
                      <TableCell>
                        {user.role === 'media' && user.mediaOutlet && (
                          <p className="text-sm">{user.mediaOutlet}</p>
                        )}
                        {user.role === 'professional' && (
                          <p className="text-sm">
                            {user.professionalTitle}
                            {user.company && ` at ${user.company}`}
                          </p>
                        )}
                        {user.role === 'influencer' && user.audience && (
                          <p className="text-sm">{user.audience}</p>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {['professional', 'media', 'influencer'].includes(user.role) ? (
                        user.approvalStatus === 'approved' || user.approvedByAdmin ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Approved
                          </span>
                        ) : user.approvalStatus === 'rejected' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" /> Pending Approval
                          </span>
                        )
                      ) : user.verified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                          Unverified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" /> View Profile
                          </DropdownMenuItem>
                          
                          {(['professional', 'media', 'influencer'].includes(user.role) && 
                            (user.approvalStatus === 'pending' || !user.approvalStatus)) && (
                            <DropdownMenuItem 
                              className="gap-2 text-green-600"
                              onClick={() => handleOpenApproveDialog(user)}
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          
                          {(['professional', 'media', 'influencer'].includes(user.role) && 
                            (user.approvalStatus === 'pending' || !user.approvalStatus)) && (
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onClick={() => handleOpenRejectDialog(user)}
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </DropdownMenuItem>
                          )}
                          
                          {(['professional', 'media', 'influencer'].includes(user.role) && 
                            user.approvalStatus === 'approved') && (
                            <DropdownMenuItem 
                              className="gap-2 text-amber-600"
                              onClick={() => handleOpenRejectDialog(user)}
                            >
                              <XCircle className="w-4 h-4" /> Revoke Approval
                            </DropdownMenuItem>
                          )}
                          
                          {(['professional', 'media', 'influencer'].includes(user.role) && 
                            user.approvalStatus === 'rejected') && (
                            <DropdownMenuItem 
                              className="gap-2 text-green-600"
                              onClick={() => handleOpenApproveDialog(user)}
                            >
                              <CheckCircle className="w-4 h-4" /> Reconsider
                            </DropdownMenuItem>
                          )}
                          
                          {!user.verified && (
                            <DropdownMenuItem 
                              className="gap-2 text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" /> Verify User
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Ban className="w-4 h-4" /> Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'approve' 
                ? `Approve ${selectedUser?.role} account` 
                : `Reject ${selectedUser?.role} account`}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'approve'
                ? "This will grant the user full access to their role-specific features."
                : "This will block the user from accessing role-specific features."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <p className="font-semibold">User: {selectedUser?.displayName}</p>
              <p className="text-sm text-muted-foreground">Email: {selectedUser?.email}</p>
              <p className="text-sm text-muted-foreground">Role: {selectedUser?.role}</p>
              
              {selectedUser?.role === 'media' && selectedUser.mediaOutlet && (
                <p className="text-sm mt-1">Media outlet: {selectedUser.mediaOutlet}</p>
              )}
              
              {selectedUser?.role === 'professional' && (
                <p className="text-sm mt-1">
                  {selectedUser.professionalTitle}
                  {selectedUser.company && ` at ${selectedUser.company}`}
                </p>
              )}
            </div>

            {confirmAction === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for rejection (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a reason for rejection. This will be visible to the user."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant={confirmAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : confirmAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}