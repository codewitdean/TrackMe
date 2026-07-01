"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardStats } from "@/types";

const COLORS = ["#0f8f83", "#f28c28", "#4267d5", "#db4d6d", "#5d8f39", "#7b61ff"];

export function CategoryDistributionChart({
  data
}: {
  data: DashboardStats["categoryDistribution"];
}) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Add habits to see category distribution.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
