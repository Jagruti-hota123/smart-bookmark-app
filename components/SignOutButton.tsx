"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className={cn(
        "p-2 rounded-lg text-muted-foreground",
        "hover:text-foreground hover:bg-accent transition-colors"
      )}
      aria-label="Sign out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}