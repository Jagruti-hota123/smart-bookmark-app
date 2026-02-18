"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-lg text-muted-foreground",
        "hover:text-foreground hover:bg-accent transition-colors"
      )}
      aria-label="Toggle theme"
    >
      <Sun className="w-4 h-4 hidden dark:block" />
      <Moon className="w-4 h-4 block dark:hidden" />
    </button>
  );
}