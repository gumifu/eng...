"use client";

import { useState, useEffect } from "react";
import { ErrorType, StudyRecommendation } from "@/lib/types";

// モックデータ（後でAPIから取得するように変更）
const mockErrorSummary: Record<ErrorType, number> = {
  article: 8,
  preposition: 5,
  tense: 3,
  word_order: 2,
  vocabulary: 1,
  spelling: 0,
  other: 1,
};

const errorTypeLabels: Record<ErrorType, string> = {
  article: "Articles",
  preposition: "Prepositions",
  tense: "Tense",
  word_order: "Word Order",
  vocabulary: "Vocabulary",
  spelling: "Spelling",
  other: "Other",
};

export default function WeaknessesPage() {
  const [recommendation, setRecommendation] =
    useState<StudyRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初期レコメンデーションを取得
    fetchRecommendation();
  }, []);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ errorSummary: mockErrorSummary }),
      });

      if (response.ok) {
        const data: StudyRecommendation = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  const topErrors = Object.entries(mockErrorSummary)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Weakness Analysis
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Error Statistics */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Error Statistics
            </h2>
            <div className="space-y-4">
              {Object.entries(mockErrorSummary)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {errorTypeLabels[type as ErrorType]}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count} times
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{
                          width: `${
                            (count /
                              Math.max(
                                ...Object.values(mockErrorSummary).filter(
                                  (c) => c > 0
                                )
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top 3 Common Mistakes */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Top 3 Common Mistakes
            </h2>
            <div className="space-y-3">
              {topErrors.map(([type, count], index) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-4 dark:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {errorTypeLabels[type as ErrorType]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Study Recommendation */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Today's Study Recommendation
          </h2>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : recommendation ? (
            <div className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  {recommendation.focus_point_ja}
                </p>
                <p className="mt-2 text-blue-800 dark:text-blue-200">
                  {recommendation.explanation_en}
                </p>
              </div>

              {/* Example Sentences */}
              <div>
                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Example Sentences:
                </h3>
                <ul className="list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
                  {recommendation.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>

              {/* Practice Questions */}
              <div>
                <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
                  Mini Practice:
                </h3>
                <div className="space-y-4">
                  {recommendation.practice_questions.map((q, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <p className="mb-3 font-medium text-gray-900 dark:text-white">
                        {index + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-center space-x-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={optIndex}
                              className="text-blue-600"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Could not fetch recommendation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

