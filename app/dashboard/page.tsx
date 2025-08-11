"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardContent() {
  return (
    <section className="flex-1 p-4 sm:p-6 space-y-6 bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        <Card className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              Welcome back, Founder 🚀
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
              What would you like to do today?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <Button size="sm" className="w-full sm:w-auto">💬 AI Chat</Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                📄 Pitch Deck
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                📧 Email
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                📊 Research
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="w-full lg:w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              Your Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm mb-2 text-gray-700 dark:text-gray-400">
              Weekly Goals
            </p>
            <Progress value={60} />
            <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
              60% complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for AI Chat & History */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="w-full sm:w-auto overflow-x-auto flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
          <TabsTrigger
            value="chat"
            className="flex-1 sm:flex-none text-gray-900 dark:text-gray-100 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
          >
            AI Chat
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 sm:flex-none text-gray-900 dark:text-gray-100 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
          >
            History
          </TabsTrigger>
        </TabsList>

        {/* AI Chat */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                Chat with your AI co-pilot to get things done.
              </p>
              <div className="h-48 sm:h-60 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 p-3 overflow-auto">
                {/* Chat messages placeholder */}
                <p className="text-sm text-muted-foreground dark:text-gray-500">
                  [Chat history here]
                </p>
              </div>
              <div className="flex mt-3 gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="sm">Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 dark:border-gray-700 pb-2 gap-2 sm:gap-0"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Session #{i + 1}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit sm:w-auto">
                    View
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
