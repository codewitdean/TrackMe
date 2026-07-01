"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Flame, Loader2, Percent } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { CategoryDistributionChart } from "@/components/charts/CategoryDistributionChart";
import { MonthlyProgressChart } from "@/components/charts/MonthlyProgressChart";
import { WeeklyProgressChart } from "@/components/charts/WeeklyProgressChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { DashboardStats } from "@/types";

function StatCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    setLoading(true);
    setError("");

    try {
      const response = await api.logs.stats();
      setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Your habit activity, streaks, and NLP entry history.</p>
          </div>
          <Button onClick={loadStats} variant="outline">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : stats ? (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={CheckCircle2}
                label="Today completed"
                value={stats.todayCompleted}
                detail={`${stats.totalHabits} active habits`}
              />
              <StatCard
                icon={Percent}
                label="Completion"
                value={`${stats.completionPercentage}%`}
                detail="Unique habits completed today"
              />
              <StatCard
                icon={Flame}
                label="Best streak"
                value={Math.max(0, ...stats.streaks.map((streak) => streak.currentStreak))}
                detail="Current daily streak"
              />
              <StatCard
                icon={Activity}
                label="NLP entries"
                value={stats.recentEntries.length}
                detail="Recent parsed entries"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly progress</CardTitle>
                  <CardDescription>Completed habits over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeeklyProgressChart data={stats.weeklyProgress} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Distribution across your habit list.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryDistributionChart data={stats.categoryDistribution} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly progress</CardTitle>
                <CardDescription>Completion percentage across the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyProgressChart data={stats.monthlyProgress} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current streaks</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {stats.streaks.length ? (
                    stats.streaks.map((streak) => (
                      <div key={streak.habitId} className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">{streak.habitName}</span>
                        <Badge variant={streak.currentStreak > 0 ? "success" : "secondary"}>
                          {streak.currentStreak} days
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Create habits to start streak tracking.</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent NLP entries</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {stats.recentEntries.length ? (
                    stats.recentEntries.map((entry) => (
                      <div key={entry.id ?? entry.rawText} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{entry.rawText}</p>
                          <Badge variant={entry.needsConfirmation ? "warning" : "success"}>
                            {Math.round(entry.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {entry.habitName ?? "Unknown habit"} {entry.quantity ?? ""} {entry.unit ?? ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Parsed entries will appear here.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </AppShell>
    </ProtectedPage>
  );
}
