"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, endOfMonth, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { HabitLog } from "@/types";

function getHabitName(log: HabitLog) {
  return typeof log.habitId === "string" ? log.parsedHabitName : log.habitId.name;
}

function exportCsv(logs: HabitLog[]) {
  const header = ["Date", "Habit", "Quantity", "Unit", "Category", "Raw Text"];
  const rows = logs.map((log) => [
    new Date(log.date).toLocaleDateString(),
    getHabitName(log),
    String(log.quantity),
    log.unit,
    log.category,
    log.rawText.replaceAll('"', '""')
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "trackme-habit-logs.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function CalendarPage() {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      setError("");

      try {
        const response = await api.logs.list();
        setLogs(response.logs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load logs");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  const days = useMemo(() => {
    const first = startOfMonth(new Date());
    const last = endOfMonth(new Date());
    const cursor = startOfWeek(first);
    const list: Date[] = [];
    let day = cursor;

    while (day <= last || list.length % 7 !== 0) {
      list.push(day);
      day = addDays(day, 1);
    }

    return list;
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Calendar</h1>
            <p className="mt-1 text-muted-foreground">Scan saved habit logs by day and export your history.</p>
          </div>
          <Button variant="outline" onClick={() => exportCsv(logs)} disabled={!logs.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{format(new Date(), "MMMM yyyy")}</CardTitle>
            <CardDescription>{logs.length} saved logs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <div className="grid grid-cols-7 overflow-hidden rounded-lg border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="border-b bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {days.map((day) => {
                  const dayLogs = logs.filter((log) => isSameDay(new Date(log.date), day));
                  return (
                    <div key={day.toISOString()} className="min-h-28 border-b border-r p-2">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">{format(day, "d")}</div>
                      <div className="grid gap-1">
                        {dayLogs.slice(0, 3).map((log) => (
                          <Badge key={log._id} variant="secondary" className="justify-start truncate">
                            {getHabitName(log)}
                          </Badge>
                        ))}
                        {dayLogs.length > 3 ? (
                          <span className="text-xs text-muted-foreground">+{dayLogs.length - 3} more</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedPage>
  );
}
