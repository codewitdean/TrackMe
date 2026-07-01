"use client";

import { FormEvent, useMemo, useState } from "react";
import { BrainCircuit, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import type { ParsedEntry } from "@/types";

const samples = [
  "I ran 2 miles today",
  "Drank 4 cups of water",
  "Studied JavaScript for 45 minutes",
  "Slept 7 hours last night",
  "Meditated for 10 minutes",
  "Read for 30 minutes",
  "Went to the gym for 1 hour"
];

function toInputDate(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

export default function NlpEntryPage() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedEntry | null>(null);
  const [form, setForm] = useState({
    parsedHabitName: "",
    quantity: 1,
    unit: "",
    date: new Date().toISOString().slice(0, 10),
    category: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSave = useMemo(() => {
    return form.parsedHabitName && form.quantity > 0 && form.unit && form.date && form.category;
  }, [form]);

  async function handleParse(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.nlp.parse(text);
      const result = response.parsed;
      setParsed(result);
      setForm({
        parsedHabitName: result.habitName ?? "",
        quantity: result.quantity ?? 1,
        unit: result.unit ?? "",
        date: toInputDate(result.date),
        category: result.category ?? ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse entry");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!parsed || !canSave) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.logs.create({
        rawText: parsed.rawText,
        parsedHabitName: form.parsedHabitName,
        quantity: Number(form.quantity),
        unit: form.unit,
        date: new Date(`${form.date}T00:00:00`).toISOString(),
        category: form.category
      });
      setSuccess("Log saved. Your dashboard is ready to refresh.");
      setText("");
      setParsed(null);
      setForm({
        parsedHabitName: "",
        quantity: 1,
        unit: "",
        date: new Date().toISOString().slice(0, 10),
        category: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save log");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-normal">NLP entry</h1>
          <p className="mt-1 text-muted-foreground">Type a natural habit entry, review the parse, and save it.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Natural language parser
              </CardTitle>
              <CardDescription>Rule-based parsing runs on the Express API.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleParse}>
                <div className="grid gap-2">
                  <Label htmlFor="entry">Entry</Label>
                  <Textarea
                    id="entry"
                    placeholder="I ran 2 miles today"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {samples.map((sample) => (
                    <Button
                      key={sample}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setText(sample);
                        setParsed(null);
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {sample}
                    </Button>
                  ))}
                </div>
                {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
                {success ? (
                  <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>
                ) : null}
                <Button type="submit" disabled={loading || text.trim().length < 2}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                  Parse entry
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confirmation preview</CardTitle>
              <CardDescription>Confirm or edit the structured habit data.</CardDescription>
            </CardHeader>
            <CardContent>
              {parsed ? (
                <div className="grid gap-4">
                  <div className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">Parser confidence</p>
                      <Badge variant={parsed.needsConfirmation ? "warning" : "success"}>
                        {Math.round(parsed.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{parsed.message}</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="habit">Habit</Label>
                    <Input
                      id="habit"
                      value={form.parsedHabitName}
                      onChange={(event) => setForm({ ...form, parsedHabitName: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.quantity}
                        onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input id="unit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(event) => setForm({ ...form, category: event.target.value })}
                    />
                  </div>
                  <Button onClick={handleSave} disabled={!canSave || saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirm and save
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Parsed habit data will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
