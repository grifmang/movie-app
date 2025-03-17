"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

export default function LoginForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showOptionalSettings, setShowOptionalSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    try {
      setIsLoading(true);
      await login(name, email || undefined);
      router.push("/movie");
    } catch (err) {
      setError("Failed to sign up. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-6">Start Your Journey</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="name" className="block font-bold mb-2 text-left">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            className="mb-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <small className="block text-zinc-600 text-sm text-left">
            A name for your project. Be sure to remember it.
          </small>
        </div>

        <div className="mb-6">
          <Label htmlFor="email" className="block font-bold mb-2 text-left">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email (optional)"
            className="mb-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <small className="block text-zinc-600 text-sm text-left">
            Optional. Enter your email to receive your project name and daily reminders.
          </small>
        </div>

        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={() => setShowOptionalSettings(!showOptionalSettings)}
            disabled={isLoading}
          >
            {showOptionalSettings ? "Hide" : "Expand"} more optional settings
          </Button>

          {showOptionalSettings && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center space-x-2 mb-4 justify-start">
                <Checkbox id="dailyReminder" />
                <Label htmlFor="dailyReminder">Send me daily reminders</Label>
              </div>

              <div className="flex items-center space-x-2 justify-start">
                <Checkbox id="newsletter" />
                <Label htmlFor="newsletter">Sign me up for the newsletter</Label>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 mb-4 text-left">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Go"}
        </Button>
      </form>
    </Card>
  );
}
