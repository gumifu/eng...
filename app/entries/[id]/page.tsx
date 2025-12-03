"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CorrectionResponse } from "@/lib/types";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("Invalid entry ID");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "entries", params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Entry not found");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setEntry({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate() || data.date,
          createdAt: data.createdAt?.toDate() || data.createdAt,
          updatedAt: data.updatedAt?.toDate() || data.updatedAt,
        });
      } catch (err) {
        console.error("Error loading entry:", err);
        setError("Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <p className="text-red-900 dark:text-red-100">{error || "Entry not found"}</p>
          </div>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Home
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {entry.title || "Untitled"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(entry.date)}
            {entry.mood && <span className="ml-2 text-2xl">{entry.mood}</span>}
          </p>
          {entry.cefrLevel && (
            <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              CEFR Level: {entry.cefrLevel}
            </span>
          )}
        </div>

        {/* Original Text */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Original Text
          </h2>
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700">
            <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
              {entry.originalText}
            </p>
          </div>
        </div>

        {/* Corrected Text */}
        {entry.correctedText && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Corrected Text
            </h2>
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {entry.correctedText}
              </p>
            </div>
          </div>
        )}

        {/* Upgraded Text */}
        {entry.upgradedText && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Upgraded Text (One Level Higher)
            </h2>
            <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {entry.upgradedText}
              </p>
            </div>
          </div>
        )}

        {/* Error Summary */}
        {entry.errorSummary && Object.keys(entry.errorSummary).length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Error Analysis
            </h2>
            <div className="space-y-2">
              {Object.entries(entry.errorSummary).map(([type, count]) => {
                if (typeof count === "number" && count > 0) {
                  const typeLabels: Record<string, string> = {
                    article: "Articles",
                    preposition: "Prepositions",
                    tense: "Tense",
                    word_order: "Word Order",
                    vocabulary: "Vocabulary",
                    spelling: "Spelling",
                    other: "Other",
                  };
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {typeLabels[type] || type}
                      </span>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {count} times
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

