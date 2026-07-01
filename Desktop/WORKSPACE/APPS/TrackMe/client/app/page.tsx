import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="relative flex min-h-[82svh] items-center overflow-hidden">
        <Image
          src="/trackme-hero.png"
          alt="TrackMe habit dashboard preview"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Habit tracking with natural language
            </p>
            <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-7xl">TrackMe</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Log habits the way you talk, confirm the structured result, and watch your daily progress turn into clear charts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 py-10 md:grid-cols-3">
        {[
          {
            icon: BrainCircuit,
            title: "NLP entries",
            body: "Type entries like I ran 2 miles today and review the parsed habit before saving."
          },
          {
            icon: BarChart3,
            title: "Progress charts",
            body: "Weekly bars, monthly trends, streaks, and category distribution stay tied to real logs."
          },
          {
            icon: ShieldCheck,
            title: "Secure accounts",
            body: "JWT auth, hashed passwords, user ownership checks, and an admin analytics role are built in."
          }
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{feature.body}</CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
