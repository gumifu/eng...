"use client";

import { useState } from "react";
import { CorrectionResponse, UpgradeResponse, Mood } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | "">("");
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<CorrectionResponse | null>(null);
  const [upgradedText, setUpgradedText] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCorrect = async () => {
    if (!text.trim()) {
      alert("Please enter your diary entry");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/correct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.error || `An error occurred (${response.status})`;

        // Convert quota errors to more user-friendly messages
        if (response.status === 402 || response.status === 429 || errorMessage.includes("quota") || errorMessage.includes("exceeded") || errorMessage.includes("insufficient_quota")) {
          errorMessage = "OpenAI API quota is insufficient.\n\nEven on the free tier, you need to:\n1. Set up a payment method (required even for Free tier)\n   → https://platform.openai.com/account/billing\n2. Add credits ($5+ usage will automatically move you to the next tier)\n   → https://platform.openai.com/account/billing\n\n※ Free tier may require payment method setup on first use.";
        } else if (errorMessage.includes("rate limit") && !errorMessage.includes("quota")) {
          errorMessage = "API rate limit reached. Please wait a moment and try again.";
        }

        throw new Error(errorMessage);
      }

      const data: CorrectionResponse = await response.json();
      setCorrection(data);
      setShowUpgrade(false);
      setUpgradedText(null);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during correction";
      alert(`Error: ${errorMessage}\n\nPlease check the browser console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!correction) return;

    setLoading(true);
    try {
      const response = await fetch("/api/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: correction.corrected_text,
          currentLevel: correction.cefr_level,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `An error occurred (${response.status})`;
        throw new Error(errorMessage);
      }

      const data: UpgradeResponse = await response.json();
      setUpgradedText(data.upgraded_text);
      setShowUpgrade(true);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during upgrade";
      alert(`Error: ${errorMessage}\n\nPlease check the browser console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      alert("Please enter your diary entry");
      return;
    }

    try {
      // TODO: Get userId when authentication is added
      const userId = "anonymous";

      const entryData = {
        userId,
        date: new Date(),
        title: title || null,
        originalText: text,
        correctedText: correction?.corrected_text || null,
        upgradedText: upgradedText || null,
        cefrLevel: correction?.cefr_level || null,
        mood: mood || null,
        errorSummary: correction?.error_summary || {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save directly to Firestore (client-side)
      const docRef = await addDoc(collection(db, "entries"), entryData);

      alert("Diary entry saved!");

      // Optionally redirect to home page after saving
      // window.location.href = "/";
    } catch (error) {
      console.error("Error saving entry:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while saving";
      alert(`Error: ${errorMessage}\n\nPlease check Firestore security rules.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Write Diary
        </h1>

        <div className="space-y-6">
          {/* Diary Input Form */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Today's title"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Content
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Write about today's events in English..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mood
              </label>
              <div className="mt-2 flex space-x-4">
                {(["🙂", "😐", "😭"] as Mood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`rounded-full p-3 text-2xl transition-all ${
                      mood === m
                        ? "bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900/30"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCorrect}
                disabled={loading || !text.trim()}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Correcting..." : "Correct"}
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Save
              </button>
            </div>
          </div>

          {/* 添削結果 */}
          {correction && (
            <div className="space-y-6">
              {/* Basic Correction */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Basic Correction (Corrected to your current level)
                </h2>
                <div className="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
                  <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                    {correction.corrected_text}
                  </p>
                </div>

                {/* CEFR Level */}
                <div className="mb-4">
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    CEFR Level: {correction.cefr_level}
                  </span>
                  {correction.comment && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {correction.comment}
                    </p>
                  )}
                </div>

                {/* Explanations */}
                {correction.explanations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                      Main Corrections:
                    </h3>
                    <div className="space-y-3">
                      {correction.explanations.map((exp, index) => (
                        <div
                          key={index}
                          className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                        >
                          <div className="mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Wrong:{" "}
                            </span>
                            <span className="text-red-600 dark:text-red-400">
                              {exp.original}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Correct:{" "}
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {exp.corrected}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="mb-1">
                              <strong>EN:</strong> {exp.reason_en}
                            </p>
                            <p>
                              <strong>JA:</strong> {exp.reason_ja}
                            </p>
                          </div>
                          <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {exp.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="mt-4 rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading ? "Generating..." : "Rewrite to Next Level"}
                </button>
              </div>

              {/* Upgrade Version */}
              {showUpgrade && upgradedText && (
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Upgrade Version (One Level Higher)
                  </h2>
                  <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
                    <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                      {upgradedText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

