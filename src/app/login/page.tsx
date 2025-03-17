"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError("Please enter your project name");
      return;
    }

    try {
      setIsLoading(true);
      await login(projectName);
      router.push("/profile");
    } catch (err) {
      setError("Failed to login. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 text-zinc-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Log In to Your 1001 Movies Project
          </h1>

          <Card className="p-6 w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <Label htmlFor="projectName" className="block font-bold mb-2">
                  Project Name
                </Label>
                <Input
                  id="projectName"
                  type="text"
                  placeholder="Enter your project name"
                  className="mb-1"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={isLoading}
                />
                <small className="block text-zinc-600 text-sm">
                  The name you used when creating your project.
                </small>
              </div>

              {error && (
                <div className="text-red-500 mb-4">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-zinc-600">
                  Don't have a project yet?{" "}
                  <Link href="/" className="text-blue-600 hover:underline">
                    Start a new one
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
