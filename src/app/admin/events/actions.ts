"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ADMIN_COOKIE_NAME, expectedAdminCookieValue } from "@/lib/adminAuth";
import type { EventCategory } from "@/lib/events";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

async function assertAdmin() {
  const expected = await expectedAdminCookieValue();
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!expected || cookie !== expected) {
    throw new Error("관리자 인증이 필요합니다.");
  }
}

export async function uploadImageAction(formData: FormData) {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "파일이 없습니다." };
  if (!file.type.startsWith("image/")) return { ok: false as const, error: "이미지 파일만 업로드할 수 있어요." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false as const, error: "파일이 너무 커요 (최대 5MB)." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase가 설정되지 않았습니다." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("images").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) return { ok: false as const, error: error.message };

  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

export interface EventInput {
  id?: string;
  event_code: string;
  title: string;
  category: EventCategory;
  start_date: string;
  end_date: string;
  sido: string;
  sigungu: string;
  place: string;
  image_url: string;
  source_url: string;
  intro: string;
  verify_status: string;
  published: boolean;
  featured: boolean;
}

export async function saveEventAction(input: EventInput) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase가 설정되지 않았습니다." };
  if (!input.title.trim()) return { ok: false as const, error: "행사명을 입력해주세요." };

  const row = {
    event_code: input.event_code || null,
    title: input.title.trim(),
    category: input.category,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    sido: input.sido || null,
    sigungu: input.sigungu || null,
    place: input.place || null,
    image_url: input.image_url || null,
    source_url: input.source_url || null,
    intro: input.intro || null,
    verify_status: input.verify_status || "확인 필요",
    published: input.published,
    featured: input.featured,
  };

  const query = input.id
    ? supabase.from("events").update(row).eq("id", input.id)
    : supabase.from("events").insert(row);

  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/events");
  return { ok: true as const };
}

export async function deleteEventAction(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase가 설정되지 않았습니다." };

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/events");
  return { ok: true as const };
}
