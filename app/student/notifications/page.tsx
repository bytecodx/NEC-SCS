"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Notification } from "@/types/database.types";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/formatters";
import {
  Bell,
  CheckCheck,
  Award,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
} from "lucide-react";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    const res = await getNotificationsAction();
    setNotifications(res.notifications);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    await fetchNotifs();
  };

  const handleMarkOne = async (id: string) => {
    await markNotificationReadAction(id);
    await fetchNotifs();
  };

  const getIcon = (type: string) => {
    if (type.includes("APPROVED")) return <Award className="h-5 w-5 text-emerald-600" />;
    if (type.includes("CORRECTION"))
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    return <FileCheck2 className="h-5 w-5 text-primary-600" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Notification Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding your submissions, verification progress, and points awards.
          </p>
        </div>

        {notifications.some((n) => !n.read_at) && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="text-xs font-semibold h-9 gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
          <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No notifications</p>
          <p className="text-xs text-slate-400 mt-1">
            You're all caught up! New notifications regarding your submissions will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-all border flex items-start gap-4 ${
                !n.read_at
                  ? "bg-white border-primary-200 shadow-xs"
                  : "bg-slate-50/70 border-slate-200"
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 shrink-0">{getIcon(n.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                <div className="mt-2 flex items-center gap-3">
                  {n.entity_id && (
                    <Link
                      href={`/student/certificates/${n.entity_id}`}
                      onClick={() => handleMarkOne(n.id)}
                      className="text-[11px] font-semibold text-primary-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Certificate</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {!n.read_at && (
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
