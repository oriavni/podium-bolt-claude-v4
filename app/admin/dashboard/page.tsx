"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserList } from "@/components/admin/user-list";
import { 
  Users, 
  Music, 
  BarChart, 
  Flag, 
  Shield, 
  Mic2, 
  Briefcase, 
  Radio, 
  Star 
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, content, and platform settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Music className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Shield className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,853</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,459</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">+5% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">12 media accounts, 12 songs</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Recently registered users across all roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserList />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Media Approvals</CardTitle>
                <CardDescription>
                  Media accounts awaiting admin approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserList role="media" title="Media Users" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer" onClick={() => setActiveTab("users-all")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" /> All Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,853</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer" onClick={() => setActiveTab("users-musicians")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mic2 className="w-4 h-4" /> Musicians
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,245</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer" onClick={() => setActiveTab("users-professionals")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Professionals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">387</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer" onClick={() => setActiveTab("users-media")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">12 pending approval</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage all users across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users-all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage all users across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList title="All Users" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users-musicians">
          <Card>
            <CardHeader>
              <CardTitle>Musicians</CardTitle>
              <CardDescription>
                Manage musician accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList role="musician" title="Musicians" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users-professionals">
          <Card>
            <CardHeader>
              <CardTitle>Industry Professionals</CardTitle>
              <CardDescription>
                Manage professional accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList role="professional" title="Professionals" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users-media">
          <Card>
            <CardHeader>
              <CardTitle>Media People</CardTitle>
              <CardDescription>
                Manage media accounts and approval requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList role="media" title="Media People" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="text-center py-12 text-muted-foreground">
            Content management section
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12 text-muted-foreground">
            Reports and moderation section
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12 text-muted-foreground">
            Platform settings section
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}