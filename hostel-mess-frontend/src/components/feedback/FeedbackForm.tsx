"use client";

export default function FeedbackForm() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Meal Feedback
      </h2>

      <div className="space-y-4">
        <select className="w-full border p-3 rounded-lg">
          <option>5 Stars</option>
          <option>4 Stars</option>
          <option>3 Stars</option>
          <option>2 Stars</option>
          <option>1 Star</option>
        </select>

        <textarea
          placeholder="Write feedback"
          className="w-full border p-3 rounded-lg"
        />

        <button className="bg-black text-white px-6 py-3 rounded-lg">
          Submit Feedback
        </button>
      </div>
    </div>
  );
}