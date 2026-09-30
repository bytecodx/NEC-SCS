"use client";

import React, { useState, useEffect } from "react";
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
} from "@/actions/admin";
import { DepartmentType } from "@/types/database.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MobileAppShowcase } from "@/components/mobile/MobileAppShowcase";
import {
  Building2,
  Plus,
  Users,
  GraduationCap,
  CheckCircle2,
  Pencil,
  Cpu,
  Radio,
  Zap,
  Cog,
  Globe,
  Compass,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Award,
  Layers,
  Search,
  BookOpen,
  Briefcase,
  TrendingUp,
  Laptop,
} from "lucide-react";

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  type?: DepartmentType;
  is_active: boolean;
  studentCount: number;
  facultyCount: number;
  hod?: {
    id: string;
    designation: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab Filtering & Search
  const [selectedTab, setSelectedTab] = useState<"ALL" | "UG" | "PG">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Department State
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addType, setAddType] = useState<DepartmentType>("UG");

  // Edit Department State
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editType, setEditType] = useState<DepartmentType>("UG");
  const [editActive, setEditActive] = useState(true);

  // Mobile App Showcase Modal State
  const [showMobileApp, setShowMobileApp] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDepts = async () => {
    try {
      const res = await getDepartmentsAction();
      setDepartments(res as DepartmentData[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addCode.trim()) {
      setError("Please fill in both department name and code.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await createDepartmentAction({
        name: addName.trim(),
        code: addCode.trim().toUpperCase(),
        type: addType,
      });
      if (!res.success) {
        setError(res.error || "Failed to create department");
        setSaving(false);
        return;
      }

      setAddName("");
      setAddCode("");
      setAddType("UG");
      setShowAdd(false);
      setSuccessMsg(`Department ${res.department?.code} (${res.department?.type}) created successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      await fetchDepts();
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (dept: DepartmentData) => {
    setEditingDept(dept);
    setEditName(dept.name);
    setEditCode(dept.code);
    setEditType(dept.type || "UG");
    setEditActive(dept.is_active);
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    if (!editName.trim() || !editCode.trim()) {
      setError("Department name and code cannot be blank.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await updateDepartmentAction(editingDept.id, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        type: editType,
        is_active: editActive,
      });

      if (!res.success) {
        setError(res.error || "Failed to update department");
        setSaving(false);
        return;
      }

      setEditingDept(null);
      setSuccessMsg(`Department ${res.department?.code} updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      await fetchDepts();
    } catch (err: any) {
      setError(err?.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to assign icons and vibrant theme per engineering discipline / program
  const getDeptDisciplineStyle = (code: string, type: DepartmentType = "UG") => {
    const c = code.toUpperCase();
    if (c === "CSE") {
      return {
        icon: Cpu,
        badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
        accentColor: "from-sky-500 to-blue-600",
        iconBg: "bg-sky-500/10 text-sky-600 border-sky-200/60",
        borderHover: "hover:border-sky-300",
      };
    }
    if (c === "IT") {
      return {
        icon: Globe,
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        accentColor: "from-indigo-500 to-purple-600",
        iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-200/60",
        borderHover: "hover:border-indigo-300",
      };
    }
    if (c === "ECE") {
      return {
        icon: Radio,
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        accentColor: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-500/10 text-amber-600 border-amber-200/60",
        borderHover: "hover:border-amber-300",
      };
    }
    if (c === "EEE") {
      return {
        icon: Zap,
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accentColor: "from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
        borderHover: "hover:border-emerald-300",
      };
    }
    if (c === "MECH") {
      return {
        icon: Cog,
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
        accentColor: "from-rose-500 to-red-600",
        iconBg: "bg-rose-500/10 text-rose-600 border-rose-200/60",
        borderHover: "hover:border-rose-300",
      };
    }
    if (c === "CIVIL") {
      return {
        icon: Compass,
        badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
        accentColor: "from-teal-500 to-emerald-600",
        iconBg: "bg-teal-500/10 text-teal-600 border-teal-200/60",
        borderHover: "hover:border-teal-300",
      };
    }
    if (c === "AIDS" || c === "AI&DS") {
      return {
        icon: Sparkles,
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        accentColor: "from-purple-500 to-indigo-600",
        iconBg: "bg-purple-500/10 text-purple-600 border-purple-200/60",
        borderHover: "hover:border-purple-300",
      };
    }
    // PG specific stylings
    if (c.includes("ME-CSE") || c.includes("M.E. CSE")) {
      return {
        icon: Cpu,
        badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
        accentColor: "from-teal-500 to-emerald-700",
        iconBg: "bg-teal-500/10 text-teal-600 border-teal-200/60",
        borderHover: "hover:border-teal-300",
      };
    }
    if (c.includes("ME-VLSI") || c.includes("VLSI")) {
      return {
        icon: Radio,
        badgeColor: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
        accentColor: "from-fuchsia-500 to-pink-600",
        iconBg: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200/60",
        borderHover: "hover:border-fuchsia-300",
      };
    }
    if (c.includes("MBA")) {
      return {
        icon: TrendingUp,
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        accentColor: "from-amber-500 to-yellow-600",
        iconBg: "bg-amber-500/10 text-amber-600 border-amber-200/60",
        borderHover: "hover:border-amber-300",
      };
    }
    if (c.includes("MCA")) {
      return {
        icon: Laptop,
        badgeColor: "bg-violet-50 text-violet-800 border-violet-200",
        accentColor: "from-violet-500 to-indigo-600",
        iconBg: "bg-violet-500/10 text-violet-600 border-violet-200/60",
        borderHover: "hover:border-violet-300",
      };
    }

    return {
      icon: type === "PG" ? BookOpen : Building2,
      badgeColor: type === "PG" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-700 border-slate-200",
      accentColor: type === "PG" ? "from-purple-600 to-indigo-700" : "from-slate-600 to-slate-800",
      iconBg: type === "PG" ? "bg-purple-500/10 text-purple-600 border-purple-200" : "bg-slate-100 text-slate-600 border-slate-200",
      borderHover: "hover:border-primary-300",
    };
  };

  // Groupings & Summary Metrics
  const ugDepartments = departments.filter((d) => (d.type || "UG") === "UG");
  const pgDepartments = departments.filter((d) => d.type === "PG");

  const ugStudents = ugDepartments.reduce((acc, d) => acc + (d.studentCount || 0), 0);
  const pgStudents = pgDepartments.reduce((acc, d) => acc + (d.studentCount || 0), 0);
  const totalFaculty = departments.reduce((acc, d) => acc + (d.facultyCount || 0), 0);

  // Filtered List based on Tab & Search
  const filteredDepts = departments
    .filter((d) => {
      if (selectedTab === "UG") return (d.type || "UG") === "UG";
      if (selectedTab === "PG") return d.type === "PG";
      return true;
    })
    .filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.hod?.profile?.full_name?.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-8">
      {/* Executive Engineering & Postgraduate Governance Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-500/30">
                <Building2 className="h-3.5 w-3.5 text-primary-400" />
                <span>Academic Programme Governance</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-500/30">
                <GraduationCap className="h-3 w-3" />
                <span>UG ({ugDepartments.length})</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                <BookOpen className="h-3 w-3" />
                <span>PG ({pgDepartments.length})</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                <span>NBA Tier-1 Accredited</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Nandha Engineering College (NEC)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Configure Undergraduate (B.E./B.Tech) and Postgraduate (M.E./MBA/MCA) departments, assign departmental HOD leadership, oversee reviewer workloads, and manage co-curricular credit allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowMobileApp(!showMobileApp)}
              variant="outline"
              className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold h-11 px-4 shadow-sm"
            >
              <Smartphone className="h-4 w-4 mr-2 text-primary-400" />
              <span>{showMobileApp ? "Hide Mobile App" : "View Mobile App"}</span>
            </Button>

            <Button
              onClick={() => {
                setAddName("");
                setAddCode("");
                setAddType(selectedTab === "PG" ? "PG" : "UG");
                setError(null);
                setShowAdd(true);
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs h-11 px-5 shadow-lg shadow-primary-900/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Department</span>
            </Button>
          </div>
        </div>

        {/* Dedicated Separate Metrics Strip for UG and PG */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">UG Disciplines</span>
              <GraduationCap className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-1">
              <span className="text-white font-black text-lg block">
                {ugDepartments.length} Branches
              </span>
              <span className="text-[11px] text-sky-400 font-semibold block mt-0.5">
                {ugStudents} Undergraduates
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">PG Programmes</span>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-1">
              <span className="text-white font-black text-lg block">
                {pgDepartments.length} Programmes
              </span>
              <span className="text-[11px] text-purple-400 font-semibold block mt-0.5">
                {pgStudents} Scholars & Masters
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">Faculty Evaluators</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-1">
              <span className="text-emerald-400 font-black text-lg block">
                {totalFaculty} Reviewers
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                Across {departments.length} departments
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">Institutional Status</span>
              <ShieldCheck className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1">
              <span className="text-amber-300 font-black text-lg block">
                Autonomous (NEC)
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                Anna University Affiliated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Embedded Mobile App Showcase Section (Toggled) */}
      {showMobileApp && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <MobileAppShowcase onClose={() => setShowMobileApp(false)} variant="embedded" />
        </div>
      )}

      {/* Interactive Separate Tabs & Search Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Segmented Filter for All / UG / PG */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setSelectedTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === "ALL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Departments</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {departments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("UG")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === "UG"
                ? "bg-white text-sky-900 shadow-sm ring-1 ring-sky-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
            <span>Undergraduate (UG)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === "UG"
                  ? "bg-sky-600 text-white"
                  : "bg-sky-100 text-sky-800"
              }`}
            >
              {ugDepartments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("PG")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === "PG"
                ? "bg-white text-purple-900 shadow-sm ring-1 ring-purple-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-600" />
            <span>Postgraduate (PG)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === "PG"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {pgDepartments.length}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search branch code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs rounded-xl bg-white border-slate-200 h-10 shadow-2xs"
          />
        </div>
      </div>

      {/* Engineering & PG Department Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {selectedTab === "ALL" && `All Academic Departments (${filteredDepts.length})`}
              {selectedTab === "UG" && `Undergraduate (UG) Branches (${filteredDepts.length})`}
              {selectedTab === "PG" && `Postgraduate (PG) Programmes (${filteredDepts.length})`}
            </h3>
            <p className="text-xs text-slate-500">
              Departmental point isolation, review workflow locks, and HOD leadership roster
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-52 bg-slate-200/60 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No departments match your filter.</p>
            <p className="text-xs text-slate-500">Try changing your search keywords or tab category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepts.map((dept) => {
              const deptType: DepartmentType = dept.type || "UG";
              const style = getDeptDisciplineStyle(dept.code, deptType);
              const Icon = style.icon;

              return (
                <Card
                  key={dept.id}
                  className={`p-6 bg-white border border-slate-200/90 rounded-3xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between group ${style.borderHover}`}
                >
                  {/* Top Subtle Discipline Accent Line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.accentColor}`}
                  />

                  <div>
                    {/* Header Row: Discipline Emblem + Code + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center border font-black text-sm shadow-2xs group-hover:scale-105 transition-transform ${style.iconBg}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-black text-slate-900">
                              {dept.code}
                            </span>

                            {/* Distinct UG / PG Badge */}
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                deptType === "PG"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-sky-50 text-sky-700 border-sky-200"
                              }`}
                            >
                              {deptType === "PG" ? "PG Degree" : "UG Degree"}
                            </span>

                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${style.badgeColor}`}
                            >
                              NBA Tier-1
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5" title={dept.name}>
                            {dept.name}
                          </h4>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          dept.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {dept.is_active ? "Active" : "Archived"}
                      </span>
                    </div>

                    {/* HOD Leadership Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 mb-4 text-xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Head of Department (HOD)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[180px]">
                          {dept.hod?.profile?.full_name || "Unassigned"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {dept.hod?.designation || "Prof & Head"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Edit Button Row */}
                  <div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {deptType === "PG" ? (
                          <BookOpen className="h-4 w-4 text-purple-600 shrink-0" />
                        ) : (
                          <GraduationCap className="h-4 w-4 text-sky-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">
                          {dept.studentCount} {deptType === "PG" ? "Scholars" : "Students"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {dept.facultyCount} Faculty
                        </span>
                      </div>
                    </div>

                    {/* Edit Department Button */}
                    <Button
                      onClick={() => openEditModal(dept)}
                      variant="outline"
                      className="w-full h-9 rounded-xl text-xs font-bold border-slate-200 hover:border-primary-400 hover:bg-primary-50/40 text-slate-700 hover:text-primary-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit Department</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Department Modal (with Programme Level: UG vs PG) */}
      <Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <Building2 className="h-5 w-5" />
              <DialogTitle className="text-base font-black text-slate-900">
                Add Academic Department
              </DialogTitle>
            </div>
            <p className="text-xs text-slate-500">
              Create a new Undergraduate or Postgraduate branch in Nandha Engineering College.
            </p>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {error}
              </div>
            )}

            {/* Programme Level Selector (UG vs PG) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Programme Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddType("UG")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    addType === "UG"
                      ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 text-sky-950"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className={`h-4 w-4 ${addType === "UG" ? "text-sky-600" : "text-slate-400"}`} />
                    <span className="text-xs font-black">Undergraduate (UG)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    4-Year B.E. / B.Tech Engineering Degree
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAddType("PG")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    addType === "PG"
                      ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 text-purple-950"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className={`h-4 w-4 ${addType === "PG" ? "text-purple-600" : "text-slate-400"}`} />
                    <span className="text-xs font-black">Postgraduate (PG)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    2-Year M.E. / MBA / MCA Advanced Degree
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder={
                  addType === "PG"
                    ? "e.g. Master of Business Administration or M.E. Embedded Systems"
                    : "e.g. Electrical and Electronics Engineering"
                }
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Code <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder={addType === "PG" ? "e.g. ME-ES or MBA" : "e.g. EEE"}
                value={addCode}
                onChange={(e) => setAddCode(e.target.value)}
                required
                className="uppercase text-xs font-mono rounded-xl font-bold"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdd(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                {saving ? "Creating..." : "Save Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal (with Programme Level: UG vs PG) */}
      <Dialog
        open={Boolean(editingDept)}
        onOpenChange={(open) => !open && setEditingDept(null)}
      >
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <Pencil className="h-5 w-5" />
              <DialogTitle className="text-base font-black text-slate-900">
                Edit Department
              </DialogTitle>
            </div>
            <p className="text-xs text-slate-500">
              Update branch title, degree level (UG/PG), and active enrollment status.
            </p>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {error}
              </div>
            )}

            {/* Programme Level Selector (UG vs PG) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Programme Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditType("UG")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    editType === "UG"
                      ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 text-sky-950"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className={`h-4 w-4 ${editType === "UG" ? "text-sky-600" : "text-slate-400"}`} />
                    <span className="text-xs font-black">Undergraduate (UG)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    4-Year B.E. / B.Tech Engineering Degree
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEditType("PG")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    editType === "PG"
                      ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 text-purple-950"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className={`h-4 w-4 ${editType === "PG" ? "text-purple-600" : "text-slate-400"}`} />
                    <span className="text-xs font-black">Postgraduate (PG)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    2-Year M.E. / MBA / MCA Advanced Degree
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Code <span className="text-rose-500">*</span>
              </label>
              <Input
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                required
                className="uppercase text-xs font-mono rounded-xl font-bold"
              />
            </div>

            {/* Active Status Checkbox */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Department Status
                </span>
                <span className="text-[11px] text-slate-500">
                  Allow students and faculty to submit and evaluate credentials
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingDept(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                {saving ? "Saving Changes..." : "Apply Updates"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
