"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardContent() {
  return (
    <section className="flex-1 p-6 space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Welcome back, Founder 🚀</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              What would you like to do today?
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>💬 Start AI Chat</Button>
              <Button variant="outline">📄 Generate Pitch Deck</Button>
              <Button variant="outline">📧 Draft Email</Button>
              <Button variant="outline">📊 Market Research</Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="w-full lg:w-72">
          <CardHeader>
            <CardTitle>Your Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">Weekly Goals</p>
            <Progress value={60} />
            <p className="text-xs text-muted-foreground mt-1">60% complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for AI Chat & History */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* AI Chat */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Chat with your AI co-pilot to get things done.
              </p>
              <div className="h-60 border rounded-md bg-white p-4 overflow-auto">
                {/* Chat messages placeholder */}
                <p className="text-sm text-muted-foreground">[Chat history here]</p>
              </div>
              <div className="flex mt-3 gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <Button>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">Session #{i + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">View</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
