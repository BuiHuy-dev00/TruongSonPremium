"use client";

import { useEffect, useState } from "react";

type Contact = {
  telegramUrl: string | null;
  telegramHandle: string | null;
  zaloDisplay: string | null;
  zaloUrl: string | null;
  facebookUrl: string | null;
  facebookLabel: string | null;
  phone: string | null;
  note: string | null;
};

export function SellerContactForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<Contact>({
    telegramUrl: "",
    telegramHandle: "",
    zaloDisplay: "",
    zaloUrl: "",
    facebookUrl: "",
    facebookLabel: "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/seller-contact", {
        credentials: "include",
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: Contact;
      };
      if (!cancelled && json.success && json.data) {
        setForm({
          telegramUrl: json.data.telegramUrl ?? "",
          telegramHandle: json.data.telegramHandle ?? "",
          zaloDisplay: json.data.zaloDisplay ?? "",
          zaloUrl: json.data.zaloUrl ?? "",
          facebookUrl: json.data.facebookUrl ?? "",
          facebookLabel: json.data.facebookLabel ?? "",
          phone: json.data.phone ?? "",
          note: json.data.note ?? "",
        });
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/seller-contact", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegramUrl: form.telegramUrl || "",
        telegramHandle: form.telegramHandle || null,
        zaloDisplay: form.zaloDisplay || null,
        zaloUrl: form.zaloUrl || "",
        facebookUrl: form.facebookUrl || "",
        facebookLabel: form.facebookLabel || null,
        phone: form.phone || null,
        note: form.note || null,
      }),
    });
    const json = (await res.json()) as { success: boolean; message?: string };
    setSaving(false);
    setMessage(
      json.success ? "Đã lưu thông tin liên hệ." : json.message ?? "Lỗi lưu"
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Đang tải...</p>;
  }

  return (
    <form className="max-w-2xl space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Telegram URL"
          value={form.telegramUrl ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, telegramUrl: v }))}
        />
        <Field
          label="Telegram hiển thị (@handle)"
          value={form.telegramHandle ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, telegramHandle: v }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Zalo hiển thị"
          value={form.zaloDisplay ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, zaloDisplay: v }))}
        />
        <Field
          label="Zalo URL / SĐT"
          value={form.zaloUrl ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, zaloUrl: v }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Facebook / Messenger URL"
          value={form.facebookUrl ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, facebookUrl: v }))}
        />
        <Field
          label="Facebook nhãn"
          value={form.facebookLabel ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, facebookLabel: v }))}
        />
      </div>
      <Field
        label="Điện thoại"
        value={form.phone ?? ""}
        onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
      />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
          Ghi chú
        </label>
        <textarea
          value={form.note ?? ""}
          onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#95aaff]"
        />
      </div>

      {message ? (
        <p className="text-sm text-[#00e3fd]" role="status">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-6 py-3 font-bold text-[#001a63] disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#95aaff]"
      />
    </div>
  );
}
