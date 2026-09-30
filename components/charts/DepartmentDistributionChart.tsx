"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface DepartmentMetric {
  department: string;
  approved: number;
  underReview: number;
  totalPoints: number;
}

interface DepartmentDistributionChartProps {
  data: DepartmentMetric[];
  title?: string;
  subtitle?: string;
}

export function DepartmentDistributionChart({
  data,
  title = "Department Achievement Distribution",
  subtitle = "Approved certificates and points earned across academic departments",
}: DepartmentDistributionChartProps) {
  return (
    <Card className="p-5 border-slate-200 bg-white">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              dataKey="approved"
              name="Approved Certs"
              fill="#0284c7"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="underReview"
              name="In Verification"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalPoints"
              name="Points Awarded"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
