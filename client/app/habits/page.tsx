"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/services/api";
import type { Habit } from "@/types";

const initialForm = {
  name: "",
  category: "",
  targetValue: 1,
  unit: "",
  frequency: "daily" as Habit["frequency"]
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadHabits() {
    setLoading(true);
    setError("");

    try {
      const response = await api.habits.list();
      setHabits(response.habits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load habits");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(habits.map((habit) => habit.category))).sort();
  }, [habits]);

  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesSearch = `${habit.name} ${habit.category} ${habit.unit}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || habit.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, habits, query]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.habits.create(form);
      setHabits((current) => [response.habit, ...current]);
      setForm(initialForm);
      setDialogOpen(false);
      setSuccess("Habit created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create habit");
    } finally {
      setSaving(false);
    }
  }

  async function deleteHabit(id: string) {
    setError("");
    setSuccess("");

    try {
      await api.habits.remove(id);
      setHabits((current) => current.filter((habit) => habit._id !== id));
      setSuccess("Habit deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete habit");
    }
  }

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Habits</h1>
            <p className="mt-1 text-muted-foreground">Create, search, filter, and manage your habit targets.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New habit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Habit list</CardTitle>
            <CardDescription>{filteredHabits.length} habits shown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
              <Input placeholder="Search habits" value={query} onChange={(event) => setQuery(event.target.value)} />
              <Select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>

            {error ? <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            {success ? <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}

            {loading ? (
              <div className="flex h-52 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredHabits.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHabits.map((habit) => (
                    <TableRow key={habit._id}>
                      <TableCell className="font-medium">{habit.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{habit.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {habit.targetValue} {habit.unit}
                      </TableCell>
                      <TableCell className="capitalize">{habit.frequency}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="icon" variant="outline" aria-label={`View ${habit.name}`}>
                            <Link href={`/habits/${habit._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => deleteHabit(habit._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No habits found.
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Create habit"
          description="Set the target TrackMe should use for progress calculations."
        >
          <form className="grid gap-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="targetValue">Target value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.targetValue}
                  onChange={(event) => setForm({ ...form, targetValue: Number(event.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                id="frequency"
                value={form.frequency}
                onChange={(event) => setForm({ ...form, frequency: event.target.value as Habit["frequency"] })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </Select>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save habit
            </Button>
          </form>
        </Dialog>
      </AppShell>
    </ProtectedPage>
  );
}
