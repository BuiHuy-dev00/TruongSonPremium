"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminIcon } from "@/components/admin/admin-icon";

export type CategoryAdminRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  _count: { products: number };
};

type ModalProps = {
  categories: CategoryAdminRow[];
};

export function CategoriesAdminClient({ categories: initial }: ModalProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);

  useEffect(() => {
    setCategories(initial);
  }, [initial]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryAdminRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(0);
    setIsVisible(true);
    setEditing(null);
    setError(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(c: CategoryAdminRow) {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description ?? "");
    setSortOrder(c.sortOrder);
    setIsVisible(c.isVisible);
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        sortOrder,
        isVisible,
        description: description.trim() || null,
      };
      const slugTrim = slug.trim();
      if (slugTrim) body.slug = slugTrim;

      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: unknown;
      };

      if (!res.ok || !json.success) {
        setError(json.message ?? "Có lỗi xảy ra");
        setLoading(false);
        return;
      }

      closeModal();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(c: CategoryAdminRow) {
    if (
      !confirm(
        `Xóa danh mục "${c.name}"? Không xóa được nếu còn sản phẩm liên quan.`
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) {
        alert(json.message ?? "Không xóa được");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Thêm, sửa hoặc xóa danh mục hiển thị trên trang chủ.
        </p>
        <button
          type="button"
          onClick={openCreate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-5 py-2.5 text-sm font-bold text-[#001a63] shadow-lg shadow-[#95aaff]/15 disabled:opacity-50"
        >
          <AdminIcon name="plus" size={18} />
          Thêm danh mục
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/60 text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-semibold">Tên</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Hiển thị</th>
                <th className="px-6 py-4 font-semibold">Thứ tự</th>
                <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {c.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        c.isVisible
                          ? "text-xs font-bold text-primary"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {c.isVisible ? "Bật" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground tabular-nums">
                    {c.sortOrder}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground tabular-nums">
                    {c._count.products}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 disabled:opacity-50"
                      >
                        <AdminIcon name="pencil" size={16} />
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                      >
                        <AdminIcon name="trash" size={16} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 [background:var(--overlay)] backdrop-blur-sm">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !loading && closeModal()}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </h3>
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tên *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Slug (tuỳ chọn)
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Để trống để tự tạo"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(Number.parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Hiển thị</span>
                </label>
              </div>

              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !loading && closeModal()}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-5 py-2 text-sm font-bold text-[#001a63] disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
