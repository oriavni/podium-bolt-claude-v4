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
import { Search, MoreVertical, CheckCircle, XCircle, Ban, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserRole } from "@/lib/types";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastSeenAt: string;
  verified: boolean;
  approvedByAdmin?: boolean;
  mediaOutlet?: string;
}

interface UserListProps {
  role?: UserRole;
  title?: string;
}

export function UserList({ role, title = "Users" }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
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
        verified: true
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
        approvedByAdmin: false,
        mediaOutlet: "Independent Music Blog"
      }
    ];

    // Filter by role if specified
    const filteredUsers = role 
      ? mockUsers.filter(user => user.role === role)
      : mockUsers;
    
    setUsers(filteredUsers);
    setIsLoading(false);
  }, [role]);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.mediaOutlet && user.mediaOutlet.toLowerCase().includes(query))
    );
  });

  const handleApproveUser = (userId: string) => {
    // In a real app, this would update the user in Supabase
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, approvedByAdmin: true }
        : user
    ));
  };

  const handleRejectUser = (userId: string) => {
    // In a real app, this would update the user in Supabase
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, approvedByAdmin: false }
        : user
    ));
  };

  const handleVerifyUser = (userId: string) => {
    // In a real app, this would update the user in Supabase
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, verified: true }
        : user
    ));
  };

  return (
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
                {role === 'media' && <TableHead>Media Outlet</TableHead>}
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
                  {role === 'media' && (
                    <TableCell>{user.mediaOutlet || "—"}</TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {user.role === 'media' ? (
                      user.approvedByAdmin ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending Approval
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
                        
                        {user.role === 'media' && !user.approvedByAdmin && (
                          <DropdownMenuItem 
                            className="gap-2 text-green-600"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </DropdownMenuItem>
                        )}
                        
                        {user.role === 'media' && user.approvedByAdmin && (
                          <DropdownMenuItem 
                            className="gap-2 text-amber-600"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            <XCircle className="w-4 h-4" /> Revoke Approval
                          </DropdownMenuItem>
                        )}
                        
                        {!user.verified && (
                          <DropdownMenuItem 
                            className="gap-2 text-green-600"
                            onClick={() => handleVerifyUser(user.id)}
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
  );
}