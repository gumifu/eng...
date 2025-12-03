"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getStreakDays } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// 日記データを取得（Firestoreから直接）
const fetchEntries = async () => {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, orderBy("date", "desc"), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate() || doc.data().updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching entries:", error);
    return [];
  }
};

const mockWeaknesses = [
  { type: "Prepositions", count: 8 },
  { type: "Articles", count: 5 },
  { type: "Word Order", count: 3 },
];

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [todayMessage, setTodayMessage] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 今日のメッセージ（モック）
    const messages = [
      "Today, try using past tense correctly.",
      "Focus on using articles (a, an, the) properly.",
      "Pay attention to prepositions today.",
    ];
    setTodayMessage(
      messages[Math.floor(Math.random() * messages.length)]
    );

    // 日記データを取得
    const loadEntries = async () => {
      setLoading(true);
      const fetchedEntries = await fetchEntries();
      setEntries(fetchedEntries);

      // 連続記録日数を計算
      setStreak(getStreakDays(fetchedEntries));
      setLoading(false);
    };

    loadEntries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* 今日のメッセージ */}
        <div className="mb-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <p className="text-lg text-blue-900 dark:text-blue-100">
            💡 {todayMessage}
          </p>
        </div>

        {/* 統計カード */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Streak
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {streak} days
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Consecutive days writing
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Entries
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : entries.length}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Entries written so far
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Level
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              B1
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Intermediate
            </p>
          </div>
        </div>

        {/* Top 3 Weaknesses */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Top 3 Weaknesses
          </h2>
          <div className="space-y-3">
            {mockWeaknesses.map((weakness, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700"
              >
                <span className="text-gray-900 dark:text-white">
                  {index + 1}. {weakness.type}
                </span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {weakness.count} times
                  </span>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-center">
          <Link
            href="/write"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Write Today's Diary
          </Link>
        </div>

        {/* Recent Entries */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Recent Entries
          </h2>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No entries yet. Write your first diary entry!
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {entry.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(entry.date)}
                      </p>
                      {entry.cefrLevel && (
                        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {entry.cefrLevel}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/entries/${entry.id}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
