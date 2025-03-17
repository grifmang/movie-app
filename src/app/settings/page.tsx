"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import ProtectedRoute from "@/components/protected-route";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email || "");

      // In a real app, these would be user preferences from the database
      const savedPrefs = localStorage.getItem("userPreferences");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setReceiveEmails(prefs.receiveEmails || false);
        setDailyReminders(prefs.dailyReminders || false);
      }
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      // In a real app, this would update the database
      // For demo, we'll just store preferences in localStorage
      const preferences = {
        receiveEmails,
        dailyReminders
      };

      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // Update the user object using the context function
      updateUser({
        name,
        email: email || undefined
      });

      setSuccessMessage("Settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update settings. Please try again.");
      console.error(err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 text-zinc-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2 text-center">
              Account Settings
            </h1>
            <p className="text-zinc-600 mb-8">
              Manage your profile and preferences
            </p>

            <Card className="p-6 w-full max-w-md">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Label htmlFor="name" className="block font-bold mb-2">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-1"
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-6">
                  <Label htmlFor="email" className="block font-bold mb-2">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-1"
                    placeholder="Your email (optional)"
                  />
                </div>

                <div className="mb-8">
                  <h3 className="font-bold mb-4">Preferences</h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="receiveEmails"
                        checked={receiveEmails}
                        onCheckedChange={(value) => setReceiveEmails(value === true)}
                      />
                      <Label htmlFor="receiveEmails">
                        Receive newsletter and updates via email
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dailyReminders"
                        checked={dailyReminders}
                        onCheckedChange={(value) => setDailyReminders(value === true)}
                      />
                      <Label htmlFor="dailyReminders">
                        Send me daily movie reminders
                      </Label>
                    </div>
                  </div>
                </div>

                {successMessage && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                    {error}
                  </div>
                )}

                <div className="flex flex-col space-y-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/profile">
                        Back to Profile
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      type="button"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
