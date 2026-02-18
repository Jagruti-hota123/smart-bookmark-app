import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bookmark, Settings, Bell } from "lucide-react";
import BookmarkList from "@/components/BookmarkList";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import type { Bookmark as BookmarkType } from "@/types";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string) || user.email || "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo + Live badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground tracking-tight block">
                SmartMark
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Syncing Live
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {/* <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Settings className="w-4 h-4" />
            </button> */}
            <SignOutButton />
            <div className="w-8 h-8 rounded-full bg-accent border border-border overflow-hidden flex items-center justify-center text-xs font-semibold text-foreground ml-1">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {name.split(" ")[0]}.
          </p>
        </div>
        <BookmarkList
          initialBookmarks={(bookmarks as BookmarkType[]) ?? []}
          userId={user.id}
        />
      </main>
    </div>
  );
}