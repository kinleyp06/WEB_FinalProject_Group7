"use client";

import Navbar from "@/components/navbar/Navbar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    meal: "Monday",
    rating: 4,
  },
  {
    meal: "Tuesday",
    rating: 5,
  },
  {
    meal: "Wednesday",
    rating: 3,
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-8">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-3xl font-bold mb-6">
            Meal Ratings Overview
          </h2>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="meal" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}