"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/components/auth/UserProvider";

export function ContactForm() {
  const toast = useToast();
  const { user, profile, isAuthenticated, isLoading } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasPopulatedRef = useRef(false);

  // Pre-populate email and name when user is authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !hasPopulatedRef.current) {
      // Pre-populate email from user account
      if (user.email) {
        setEmail(user.email);
      }
      
      // Pre-populate name from profile or email
      const displayName = profile?.display_name || user.email?.split("@")[0] || "";
      if (displayName) {
        setName(displayName);
      }
      
      hasPopulatedRef.current = true;
    } else if (!isAuthenticated && hasPopulatedRef.current) {
      // Reset flag when user logs out
      hasPopulatedRef.current = false;
    }
  }, [isLoading, isAuthenticated, user, profile]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = 
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    isEmailValid &&
    message.trim().length > 0 &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Success - clear form and show success message
      toast.success(data.message || "Your message has been sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="contact-name" className="label-botanical">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="input-botanical"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="label-botanical">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="input-botanical"
          required
          disabled={isSubmitting}
        />
        {email.trim() && !isEmailValid && (
          <p className="text-xs text-red-600 mt-1">
            Please enter a valid email address
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="label-botanical">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind..."
          className="input-botanical min-h-[160px] resize-y"
          required
          disabled={isSubmitting}
          maxLength={5000}
        />
      </div>

      <Button
        type="submit"
        disabled={!isFormValid}
        className="w-full"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner border-cream/30 border-t-cream" />
            Sending...
          </span>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
