"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import apiClient from "@/libs/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ButtonLead = ({ extraStyle }: { extraStyle?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setIsLoading(true);
    try {
      await apiClient.post("/lead", { email });

      toast.success("Thanks for joining the waitlist!");

      inputRef.current?.blur();
      setEmail("");
      setIsDisabled(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={`w-full max-w-xs space-y-3 ${extraStyle ?? ""}`}
      onSubmit={handleSubmit}
    >
      <Input
        required
        type="email"
        value={email}
        ref={inputRef}
        autoComplete="email"
        placeholder="tom@cruise.com"
        className="h-11"
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isDisabled}
      >
        Join waitlist
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
};

export default ButtonLead;
