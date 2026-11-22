import type { CustomerEditorStepProps } from "../types"
import type { StoryItem } from "@/types/winvit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, Loader2, Plus, Trash2 } from "lucide-react"

export default function StoryStep({
  detailTab,
  draft,
  setDraft,
  isLocked,
  setDetailTab,
  handleStoryPhotoUpload,
  uploadingField,
}: CustomerEditorStepProps) {
  if (detailTab !== "story") return null

  const updateStoryAt = (index: number, patch: Partial<StoryItem>) => {
    setDraft((prev) => {
      const next = prev.stories.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item
      )
      return { ...prev, stories: next }
    })
  }

  const addStoryItem = () => {
    setDraft((prev) => ({
      ...prev,
      stories: [
        ...prev.stories,
        {
          title: `Bab ${prev.stories.length + 1}`,
          badge: "Pertemuan Pertama",
          storyDate: null,
          content: "",
          photo: "",
          sortOrder: prev.stories.length + 1,
        },
      ],
    }))
  }

  const removeStoryItem = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      stories: prev.stories.filter((_, idx) => idx !== index),
    }))
  }

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">Perjalanan Cinta (Love Story)</h4>
            <p className="text-xs text-[#6B5B4E]">
              Ceritakan momen spesial dari awal pertemuan hingga lamaran
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl gap-1"
            disabled={isLocked}
            onClick={addStoryItem}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Cerita
          </Button>
        </div>

        {draft.stories.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-[#FAF6F1] border border-dashed border-[#E5DDD5] space-y-2">
            <p className="text-xs text-[#6B5B4E]">
              Belum ada kisah perjalanan cinta yang ditambahkan.
            </p>
            <Button
              type="button"
              size="sm"
              variant="gold"
              className="rounded-xl"
              disabled={isLocked}
              onClick={addStoryItem}
            >
              + Buat Cerita Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {draft.stories.map((st, idx) => {
              const isUploading = uploadingField === `story_photo_${idx}`
              return (
                <div
                  key={st.id || idx}
                  className="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A8763E]">
                      Cerita #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => removeStoryItem(idx)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      disabled={isLocked}
                      placeholder="Judul Bab (cth: Bab 1)"
                      className="h-11 sm:h-10 bg-white rounded-xl"
                      value={st.title}
                      onChange={(e) =>
                        updateStoryAt(idx, { title: e.target.value })
                      }
                    />
                    <Input
                      disabled={isLocked}
                      placeholder="Label Momen / Waktu (cth: Pertemuan Pertama)"
                      className="h-11 sm:h-10 bg-white rounded-xl"
                      value={st.badge}
                      onChange={(e) =>
                        updateStoryAt(idx, { badge: e.target.value })
                      }
                    />
                  </div>

                  <textarea
                    disabled={isLocked}
                    rows={3}
                    placeholder="Tulis isi cerita momen Anda berdua..."
                    className="w-full rounded-xl border border-[#E5DDD5] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B57]"
                    value={st.content}
                    onChange={(e) =>
                      updateStoryAt(idx, { content: e.target.value })
                    }
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <label className="flex items-center justify-center gap-2 h-10 px-3.5 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-[#C89B57]" />
                      )}
                      <span>
                        {isUploading ? "Mengupload..." : "Upload Foto Cerita"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isLocked || isUploading}
                        onChange={(e) => handleStoryPhotoUpload(idx, e)}
                        className="hidden"
                      />
                    </label>

                    {st.photo && (
                      <div className="flex items-center gap-2">
                        <img
                          src={st.photo}
                          alt={st.title}
                          className="w-12 h-12 rounded-lg object-cover border border-[#E5DDD5]"
                        />
                        <button
                          type="button"
                          onClick={() => updateStoryAt(idx, { photo: "" })}
                          className="text-xs text-red-600 underline"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="pt-2 border-t border-[#E5DDD5] flex gap-2 justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => setDetailTab("events")}
          >
            Kembali
          </Button>
          <Button
            type="button"
            variant="gold"
            className="h-11 rounded-xl"
            onClick={() => setDetailTab("media")}
          >
            Lanjut: Galeri Foto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

