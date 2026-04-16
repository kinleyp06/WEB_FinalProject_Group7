import { useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function History() {
  // 🔹 Dummy data (replace with API later)
  const [records] = useState([
    {
      id: 1,
      type: "feedback",
      message: "Breakfast should include fruits",
      date: "2026-04-10",
    },
    {
      id: 2,
      type: "suggestion",
      message: "Add momo day on weekends",
      date: "2026-04-11",
    },
    {
      id: 3,
      type: "feedback",
      message: "Dinner timing is too late",
      date: "2026-04-12",
    },
  ]);

  const [filter, setFilter] = useState("all");

  // 🔹 Filtering logic
  const filteredData =
    filter === "all"
      ? records
      : records.filter((item) => item.type === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My History</h1>

      {/* 🔹 Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <Button onClick={() => setFilter("all")}>All</Button>
        <Button onClick={() => setFilter("feedback")} variant="primary">
          Feedback
        </Button>
        <Button onClick={() => setFilter("suggestion")} variant="success">
          Suggestions
        </Button>
      </div>

      {/* 🔹 History List */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <Card key={item.id}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.message}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>

                <Badge
                  text={item.type}
                  color={item.type === "feedback" ? "blue" : "green"}
                />
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No records found.</p>
        )}
      </div>
    </div>
  );
}