import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { getDB } from "@/lib/db/store";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || (user.profile.role !== "FACULTY" && user.profile.role !== "HOD")) {
    redirect("/login");
  }

  const db = getDB();
  const unreadCount = db.notifications.filter(
    (n) => n.user_id === user.profile.id && !n.read_at
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        role={user.profile.role}
        userName={user.profile.full_name}
        departmentName={user.faculty?.department?.name || "Faculty Reviewer"}
        unreadNotifications={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar
          role={user.profile.role}
          userName={user.profile.full_name}
          unreadCount={unreadCount}
          title={`${user.faculty?.department?.code || "Dept"} Faculty Verification Portal`}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>

        <MobileNav role={user.profile.role} unreadNotifications={unreadCount} />
      </div>
    </div>
  );
}
