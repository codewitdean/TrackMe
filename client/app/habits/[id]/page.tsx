"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/services/api";
import type { Habit, HabitLog } from "@/types";

export default function HabitDetailPage() {
  const params = useParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [form, setForm] = useState<Partial<Habit>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError("");

      try {
        const [habitResponse, logsResponse] = await Promise.all([api.habits.get(params.id), api.logs.list()]);
        setHabit(habitResponse.habit);
        setForm(habitResponse.habit);
        setLogs(
          logsResponse.logs.filter((log) => {
            const habitId = typeof log.habitId === "string" ? log.habitId : log.habitId._id;
            return habitId === params.id;
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load habit");
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [params.id]);

  const totalQuantity = useMemo(() => logs.reduce((sum, log) => sum + log.quantity, 0), [logs]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.habits.update(params.id, form);
      setHabit(response.habit);
      setForm(response.habit);
      setSuccess("Habit updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save habit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedPage>
      <AppShell>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/habits">
            <ArrowLeft className="h-4 w-4" />
            Back to habits
          </Link>
        </Button>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : habit ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{habit.name}</CardTitle>
                <CardDescription>Edit the target and frequency for this habit.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSave}>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name ?? ""}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category ?? ""}
                      onChange={(event) => setForm({ ...form, category: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="targetValue">Target</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.targetValue ?? 1}
                      onChange={(event) => setForm({ ...form, targetValue: Number(event.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={form.unit ?? ""}
                      onChange={(event) => setForm({ ...form, unit: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      id="frequency"
                      value={form.frequency ?? "daily"}
                      onChange={(event) => setForm({ ...form, frequency: event.target.value as Habit["frequency"] })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </div>
                  {success ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Target</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {habit.targetValue} {habit.unit}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Logged</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {totalQuantity} {habit.unit}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{habit.category}</Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent logs</CardTitle>
                  <CardDescription>Entries saved for this habit.</CardDescription>
                </CardHeader>
                <CardContent>
                  {logs.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Entry</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log._id}>
                            <TableCell>{log.rawText}</TableCell>
                            <TableCell>
                              {log.quantity} {log.unit}
                            </TableCell>
                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No logs saved for this habit yet.
                    </p>
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
