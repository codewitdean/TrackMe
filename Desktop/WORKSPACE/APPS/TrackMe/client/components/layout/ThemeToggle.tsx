"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("trackme_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = saved ? saved === "dark" : prefersDark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  function toggle() {
    const nextDark = !dark;
    setDark(nextDark);
    window.localStorage.setItem("trackme_theme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextDark);
  }

  return (
    <Button aria-label="Toggle dark mode" size="icon" variant="outline" onClick={toggle}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
