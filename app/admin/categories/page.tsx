"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminCategoriesAction,
  createCategoryAction,
  toggleCategoryStatusAction,
} from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Award, Plus, CheckCircle2, XCircle, FolderTree } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = async () => {
    try {
      const res = await getAdminCategoriesAction();
      setCategories(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleToggle = async (catId: string) => {
    try {
      await toggleCategoryStatusAction(catId);
      await fetchCats();
    } catch (err: any) {
      alert(err?.message || "Failed to update category status");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await createCategoryAction({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to create category");
        setSaving(false);
        return;
      }

      setName("");
      setDescription("");
      setShowAdd(false);
      await fetchCats();
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Achievement Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure co-curricular and extra-curricular classification taxonomy for submissions.
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs h-10 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className={`p-5 border transition-all flex flex-col justify-between ${
                cat.is_active ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  {cat.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      Disabled
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {cat.description || "No specific guidelines provided."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {cat.certCount} Submitted
                </span>

                <button
                  onClick={() => handleToggle(cat.id)}
                  className={`text-xs font-semibold hover:underline ${
                    cat.is_active ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {cat.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <FolderTree className="h-5 w-5" />
              <DialogTitle>Add Achievement Category</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Industry Internship"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Criteria
              </label>
              <textarea
                placeholder="Explain what qualifies under this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs"
              >
                {saving ? "Creating..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
