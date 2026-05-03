import { createClient } from "@/lib/supabase/server"

export interface MediaFile {
  name: string
  fullPath: string
  folder: string
  publicUrl: string
  sizeBytes: number | null
  mimeType: string | null
  createdAt: string | null
}

export interface MediaFolderListing {
  folder: string
  files: MediaFile[]
}

export interface MediaListing {
  byFolder: MediaFolderListing[]
  totalFiles: number
  bucketMissing: boolean
  rootError: string | null
}

const COMMON_FOLDERS = [
  "logos",
  "hero-slides",
  "services",
  "blog",
  "provider-logos",
  "uploads",
]

export async function listMediaFiles(): Promise<MediaListing> {
  try {
    const supabase = await createClient()

    // Discover folders by listing the bucket root + always include the
    // common-folders allow-list (so empty folders still show up as headings).
    const { data: rootEntries, error: rootError } = await supabase.storage
      .from("media")
      .list("", { limit: 500, sortBy: { column: "name", order: "asc" } })

    if (rootError) {
      const bucketMissing = /not\s*found|does\s*not\s*exist/i.test(rootError.message)
      return {
        byFolder: [],
        totalFiles: 0,
        bucketMissing,
        rootError: rootError.message,
      }
    }

    const folderNames = new Set<string>(COMMON_FOLDERS)
    for (const entry of rootEntries || []) {
      // Storage represents folders as entries with no metadata
      if (!entry.metadata && entry.name) folderNames.add(entry.name)
    }

    const byFolder: MediaFolderListing[] = []
    let totalFiles = 0

    for (const folder of Array.from(folderNames).sort()) {
      try {
        const { data: items } = await supabase.storage
          .from("media")
          .list(folder, {
            limit: 200,
            sortBy: { column: "created_at", order: "desc" },
          })
        const files: MediaFile[] = []
        for (const item of items || []) {
          if (!item.metadata) continue // sub-folder, skip for v1
          const fullPath = `${folder}/${item.name}`
          const { data: pub } = supabase.storage.from("media").getPublicUrl(fullPath)
          files.push({
            name: item.name,
            fullPath,
            folder,
            publicUrl: pub.publicUrl,
            sizeBytes: (item.metadata.size as number) ?? null,
            mimeType: (item.metadata.mimetype as string) ?? null,
            createdAt: (item.created_at as string) ?? null,
          })
        }
        if (files.length > 0) totalFiles += files.length
        byFolder.push({ folder, files })
      } catch {
        byFolder.push({ folder, files: [] })
      }
    }

    return { byFolder, totalFiles, bucketMissing: false, rootError: null }
  } catch (e) {
    return {
      byFolder: [],
      totalFiles: 0,
      bucketMissing: false,
      rootError: e instanceof Error ? e.message : "Unknown error",
    }
  }
}
