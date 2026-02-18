"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Globe, ExternalLink, Shield, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Bookmark } from "@/types";
import AddBookmark from "./AddBookmark";

const FILTERS = ["All", "General", "Recently Added", "Work", "Reference"];

const TINTS = [
  "bg-blue-100 dark:bg-blue-950",
  "bg-orange-100 dark:bg-orange-950",
  "bg-green-100 dark:bg-green-950",
  "bg-purple-100 dark:bg-purple-950",
  "bg-yellow-100 dark:bg-yellow-950",
  "bg-pink-100 dark:bg-pink-950",
];

function getTint(url: string) {
  let hash = 0;
  for (let i = 0; i < url.length; i++)
    hash = url.charCodeAt(i) + ((hash << 5) - hash);
  return TINTS[Math.abs(hash) % TINTS.length];
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return "Last week";
}

function getFaviconUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch { return null; }
}

interface BookmarkListProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

export default function BookmarkList({ initialBookmarks, userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const handleQuickAdd = async () => {
    const url = prompt("Paste URL");
    if (!url) return;

    const title = prompt("Title") || url;

    const res = await fetch("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ url, title }),
    });

    const data = await res.json();
    handleAdd(data);
  };



  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bookmarks-realtime")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setBookmarks((prev) => {
          if (prev.find((b) => b.id === payload.new.id)) return prev;
          return [payload.new as Bookmark, ...prev];
        });
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleAdd = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) => [bookmark, ...prev]);
    toast.success("Bookmark saved!");
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/bookmarks?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Bookmark deleted");
    } catch {
      toast.error("Failed to delete bookmark");
      const { bookmarks: fresh } = await (await fetch("/api/bookmarks")).json();
      setBookmarks(fresh);
    } finally {
      setDeleting(null);
    }
  };

  // Filter + search logic
  const filtered = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase());

    if (activeFilter === "Recently Added") {
      const hrs = (Date.now() - new Date(b.created_at).getTime()) / 3600000;
      return matchesSearch && hrs < 24;
    }
    if(activeFilter === "General") return matchesSearch && b.category ==="general"; 
    if (activeFilter === "Work") return matchesSearch && b.category === "work";
    if (activeFilter === "Reference") return matchesSearch && b.category === "reference";
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <AddBookmark onAdd={handleAdd} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your bookmarks..."
          className={cn(
            "w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-muted",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          )}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Library header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Library</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize your digital library in seconds.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
          {bookmarks.length} Saved
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl">
          <Globe className="w-10 h-10 text-muted-foreground mb-3" />
          {search ? (
            <>
              <p className="text-foreground font-medium">No results for "{search}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term.</p>
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-xs text-primary underline underline-offset-2"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p className="text-foreground font-medium">No bookmarks yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first link above.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={handleDelete}
              deleting={deleting === bookmark.id}
            />
          ))}
          {/* Quick Bookmark CTA */}
          <div onClick={handleQuickAdd}
            className="rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground hover:bg-accent/50 transition-colors cursor-pointer min-h-[160px]"
          >
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center">
              <span className="text-xl leading-none mb-0.5">+</span>
            </div>
            <span className="text-sm">Quick Bookmark</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border mt-16 pt-10 pb-10 flex flex-col items-center gap-1">
        <p className="text-xs text-muted-foreground">© 2026 SmartMark. All rights reserved. Created By Jagruti❤️</p>
      </div>
    </div>
  );
}

function BookmarkCard({ bookmark, onDelete, deleting }: {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const faviconUrl = getFaviconUrl(bookmark.url);
  const domain = getDomain(bookmark.url);
  const tint = getTint(bookmark.url);
  const [faviconError, setFaviconError] = useState(false);

  return (
    <div>
      <div className={cn(
        "group rounded-xl border border-border bg-card p-5 flex flex-col gap-4",
        "hover:shadow-md transition-all duration-200",
        deleting && "opacity-50 pointer-events-none"
      )}>
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0",
            tint
          )}>
            {faviconUrl && !faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-6 h-6 object-contain"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-2 flex items-start gap-1 group/link"
          >
            {bookmark.title}
            <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
          <p className="text-xs text-muted-foreground mt-1 truncate">{domain}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-accent uppercase tracking-wide text-[10px] font-medium">
            {bookmark.category || "general"}
          </span>
          <span>{timeAgo(bookmark.created_at)}</span>
        </div>
      </div>
    </div>
  );
}