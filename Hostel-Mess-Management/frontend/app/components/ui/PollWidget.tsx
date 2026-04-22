"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PollWidgetProps {
  pollId: string;
  title: string;
  description?: string;
  options: string[];
  onVote?: (pollId: string, choice: string) => Promise<void>;
  hasVoted?: boolean;
  results?: Record<string, number>;
}

export function PollWidget({ 
  pollId, 
  title, 
  description, 
  options, 
  onVote, 
  hasVoted = false,
  results 
}: PollWidgetProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = async () => {
    if (!selectedOption || voted) return;
    setIsVoting(true);
    try {
      await onVote?.(pollId, selectedOption);
      setVoted(true);
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const getTotalVotes = () => {
    if (!results) return 0;
    return Object.values(results).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (count: number) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent>
        {!voted ? (
          <div className="space-y-3">
            {options.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === option
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`poll-${pollId}`}
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
            <Button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className="w-full"
            >
              {isVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Voting...
                </>
              ) : (
                "Submit Vote"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {results && options.map((option) => (
              <div key={option}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{option}</span>
                  <span>{results[option] || 0} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getPercentage(results[option] || 0)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-gray-500 mt-2">
              Total votes: {getTotalVotes()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}