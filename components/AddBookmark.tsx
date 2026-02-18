"use client";

import { useState } from "react";
import { Plus, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bookmark } from "@/types";

interface AddBookmarkProps {
  onAdd: (bookmark: Bookmark) => void;
}

export default function AddBookmark({ onAdd }: AddBookmarkProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim(), category }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onAdd(data.bookmark);
      setUrl("");
      setTitle("");
      setCategory("general");
    } catch (err: any) {
      setError(err.message || "Failed to save bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Link2 className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm text-foreground tracking-wide uppercase">
          Add New Bookmark
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Title */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Design Inspiration"
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border border-input bg-background",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              )}
            />
          </div>

          {/* URL */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://dribbble.com"
              required
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border border-input bg-background",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              )}
            />
          </div>

          {/* Category */}
          <div className="sm:w-36">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border border-input bg-background",
                "text-sm text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              )}
            >
              <option value="general">General</option>
              <option value="work">Work</option>
              <option value="reference">Reference</option>
            </select>
          </div>

          {/* Submit */}
          <div className="sm:self-end">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg",
                "bg-primary text-primary-foreground text-sm font-medium",
                "hover:opacity-90 transition-opacity",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "w-full sm:w-auto whitespace-nowrap"
              )}
            >
              <Plus className="w-4 h-4" />
              {loading ? "Saving…" : "Add"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}