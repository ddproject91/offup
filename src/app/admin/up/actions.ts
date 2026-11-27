"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertAdmin } from "@/lib/adminAuth";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadImageAction(formData: FormData) {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "파일이 없습니다." };
  if (!file.type.startsWith("image/")) return { ok: false as const, error: "이미지 파일만 업로드할 수 있어요." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false as const, error: "파일이 너무 커요 (최대 5MB)." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase가 설정되지 않았습니다." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `up/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("images").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) return { ok: false as const, error: error.message };

  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

export interface UpPostInput {
  id?: string;
  title: string;
  tag: string;
  description: string;
  link_url: string;
  post_date: string;
  image_url: string;
  starts_at: string;
  ends_at: string;
  published: boolean;
}

export async function saveUpPostAction(input: UpPostInput) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase가 설정되지 않았습니다." };
  if (!input.title.trim()) return { ok: false as const, error: "제목을 입력해주세요." };

  const row = {
    title: input.title.trim(),
    tag: input.tag || null,
    description: input.description || null,
    link_url: input.link_url || null,
    post_date: input.post_date || null,
    image_url: input.image_url || null,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    published: input.published,
  };

  const query = input.id
    ? supabase.from("up_posts").update(row).eq("id", input.id)
    : supabase.from("up_posts").insert(row);

  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/up");
  return { ok: true as const };
}

export async function deleteUpPostAction(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase가 설정되지 않았습니다." };

  const { error } = await supabase.from("up_posts").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/up");
  return { ok: true as const };
}
