"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteMediaFileAction(fullPath: string) {
  if (!fullPath || fullPath.includes("..")) {
    return { error: "Invalid path" }
  }

  const supabase = await createClient()
  const { error } = await supabase.storage.from("media").remove([fullPath])
  if (error) return { error: error.message }

  revalidatePath("/admin/media")
  return { ok: true }
}
