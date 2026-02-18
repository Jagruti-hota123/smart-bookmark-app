import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bookmark, Zap, Search, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ThemeToggle from "@/components/ThemeToggle";
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/bookmarks");

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-primary-foreground" />

            </div>

            <span className="font-semibold text-foreground tracking-tight">SmartMark</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16 py-20 lg:py-28">

          {/* LEFT */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs font-medium text-muted-foreground tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Intelligent Organization
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-foreground">
              Your bookmarks,{" "}
              <br />
              organized by{" "}
              <br />
              <span className="text-primary">intelligence.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              A minimalist manager for the links that matter. SmartMark
              automatically tags and categorizes your content so you can find
              anything in seconds.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {[
                { icon: Zap, label: "Auto-Tagging" },
                { icon: Search, label: "Semantic Search" },
                { icon: Smartphone, label: "Device Sync" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Login Card */}
          <div className="w-full lg:w-105 shrink-0">
            <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold text-card-foreground">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Join over 10,000+ users organizing the web.
                </p>
              </div>

              <GoogleSignInButton />

              {/* Feature hints */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { icon: "⚡", label: "Instant sync" },
                  { icon: "🔒", label: "Private by default" },
                  { icon: "🌐", label: "Any device" },
                  { icon: "🗂️", label: "Auto-organized" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground"
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>


            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {["🧑‍💻", "👩‍🔬", "🧑‍🎨"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                Trusted by 10k+ researchers
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "🧠",
                title: "Neural Sorting",
                desc: "Our AI understands context, automatically grouping research papers, recipes, and tools without you lifting a finger.",
              },
              {
                icon: "⚡",
                title: "Instant Recall",
                desc: 'Search through your bookmarks using natural language. "Find that design article from last Tuesday about color theory."',
              },
              {
                icon: "🧩",
                title: "Seamless Workflow",
                desc: "Native extensions for Chrome, Safari, and Firefox. One-click save, instant sync across mobile and desktop.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <h3 className="font-bold text-foreground text-lg">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">SmartMark</p>
              <p className="text-xs text-muted-foreground">The last bookmark manager you'll ever need.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            © 2026 SmartMark. All rights reserved. Built for organized minds. By Jagruti Hota❤️

          </div>
        </div>

      </footer>
    </div>
  );
}