"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertAdmin } from "@/lib/adminAuth";

export interface UpPostInput {
  id?: string;
  title: string;
  tag: string;
  description: string;
  link_url: string;
  post_date: string;
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
