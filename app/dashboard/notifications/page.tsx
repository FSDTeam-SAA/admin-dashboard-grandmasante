"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

type NotificationItem = {
  _id: string;
  title?: string;
  message?: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  relatedProduct?: any;
};

type PaginatedResponse = {
  docs: NotificationItem[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
};

export default function NotificationsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState<string>("");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/notifications", {
        params: { page, limit, ...(type ? { type } : {}) },
      });
      // your backend returns: { success, message, data }
      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    if (!ids.length) return;
    await apiClient.patch("/notifications/read", { ids });
    // refresh list after marking read
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type]);

  const notifications = data?.docs ?? [];
  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);

  return (
    <div className="px-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Notifications</h1>

        <div className="flex gap-3">
          <select
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
            className="border rounded-lg px-3 py-2 text-sm bg-white/60 border-white/30 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="order">Order</option>
            <option value="product">Product</option>
            <option value="system">System</option>
          </select>

          <Button
            disabled={!unreadIds.length || loading}
            onClick={() => markAsRead(unreadIds)}
          >
            Mark all read
          </Button>
        </div>
      </div>

      <div className="bg-white/60 border border-white/30 rounded-2xl p-4 space-y-3">
        {loading && <div className="text-slate-500">Loading...</div>}

        {!loading && notifications.length === 0 && (
          <div className="text-slate-500">No notifications found.</div>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              n.isRead
                ? "bg-white/50 border-white/30"
                : "bg-[#E9FFF0] border-[#BFE8CB]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-slate-800 font-medium">
                  {n.title ?? "Notification"}
                </p>
                {n.type && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-slate-600">
                    {n.type}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {n.message ?? "—"}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>

            {!n.isRead && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => markAsRead([n._id])}
              >
                Mark read
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages} • Total {data.totalDocs}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!data.hasPrevPage || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={!data.hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
