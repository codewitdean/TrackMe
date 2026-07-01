"use client";

import { useEffect, useState } from "react";
import { BarChart3, Database, Loader2, Shield, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/services/api";
import type { AdminAnalytics } from "@/types";

function AdminStat({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const response = await api.admin.analytics();
        setAnalytics(response.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <ProtectedPage adminOnly>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-normal">Admin analytics</h1>
          <p className="mt-1 text-muted-foreground">Basic platform totals across all TrackMe users.</p>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : analytics ? (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AdminStat label="Total users" value={analytics.totalUsers} icon={Users} />
              <AdminStat label="Total habits" value={analytics.totalHabits} icon={BarChart3} />
              <AdminStat label="Total logs" value={analytics.totalLogs} icon={Database} />
              <AdminStat label="Parsed entries" value={analytics.totalParsedEntries} icon={Shield} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Role breakdown</CardTitle>
                <CardDescription>Current account counts by role.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.roleBreakdown.map((row) => (
                      <TableRow key={row.role}>
                        <TableCell className="capitalize">{row.role}</TableCell>
                        <TableCell>{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </AppShell>
    </ProtectedPage>
  );
}
