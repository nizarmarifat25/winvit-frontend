import type { CustomerEditorStepProps } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, ImagePlus, Music, Loader2, Quote, Check } from "lucide-react"
import { QUOTE_CATEGORIES, QUOTE_PRESETS, getQuotePreset } from "@/data/quotes"
import { buildCoupleSlug } from "@/lib/slug"

export default function CoupleStep({
  detailTab,
  draft,
  setDraft,
  isLocked,
  handleBridePhotoUpload,
  handleGroomPhotoUpload,
  handleCoverPhotoUpload,
  handleMusicUpload,
  uploadingField,
}: CustomerEditorStepProps) {
  if (detailTab !== "couple") return null

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6B5B4E] mb-1">
            Slug URL Undangan (/u/slug)
          </label>
          <Input
            disabled
            readOnly
            value={
              draft.slug ||
              buildCoupleSlug(
                draft.couple.groom.nickname,
                draft.couple.bride.nickname
              )
            }
            placeholder="otomatis dari nama panggilan pria & wanita"
            className="h-11 sm:h-10 rounded-xl bg-[#FAF6F1] text-[#6B5B4E] cursor-not-allowed"
          />
          <p className="text-[11px] text-[#8A796B] mt-1">
            Terisi otomatis dari gabungan nama panggilan mempelai pria dan wanita.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mempelai Pria */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <h4 className="font-semibold text-sm">Mempelai Pria</h4>
            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Nama Lengkap Mempelai Pria
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Budi Santoso"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.groom.fullName}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      groom: {
                        ...prev.couple.groom,
                        fullName: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Nama Panggilan Pria
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Budi"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.groom.nickname}
                onChange={(e) => {
                  const nextNick = e.target.value
                  setDraft((prev) => ({
                    ...prev,
                    slug: buildCoupleSlug(nextNick, prev.couple.bride.nickname),
                    couple: {
                      ...prev.couple,
                      groom: {
                        ...prev.couple.groom,
                        nickname: nextNick,
                      },
                    },
                  }))
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Info Orang Tua / Keterangan
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Putra Pertama dari Bapak Paijan & Ibu Warsi"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.groom.info ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      groom: {
                        ...prev.couple.groom,
                        info: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                {uploadingField === "groom_photo" ? (
                  <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-[#C89B57]" />
                )}
                <span>
                  {uploadingField === "groom_photo"
                    ? "Mengupload..."
                    : "Upload Foto Pria"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLocked || uploadingField === "groom_photo"}
                  onChange={handleGroomPhotoUpload}
                  className="hidden"
                />
              </label>
              {draft.couple.groom.photo && (
                <div className="mt-2 flex items-center gap-2.5">
                  <img
                    src={draft.couple.groom.photo}
                    alt="Groom"
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        couple: {
                          ...prev.couple,
                          groom: { ...prev.couple.groom, photo: "" },
                        },
                      }))
                    }
                    className="text-xs text-red-600 underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mempelai Wanita */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <h4 className="font-semibold text-sm">Mempelai Wanita</h4>
            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Nama Lengkap Mempelai Wanita
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Ani Wijaya"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.bride.fullName}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      bride: {
                        ...prev.couple.bride,
                        fullName: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Nama Panggilan Wanita
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Ani"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.bride.nickname}
                onChange={(e) => {
                  const nextNick = e.target.value
                  setDraft((prev) => ({
                    ...prev,
                    slug: buildCoupleSlug(prev.couple.groom.nickname, nextNick),
                    couple: {
                      ...prev.couple,
                      bride: {
                        ...prev.couple.bride,
                        nickname: nextNick,
                      },
                    },
                  }))
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B5B4E] mb-1">
                Info Orang Tua / Keterangan
              </label>
              <Input
                disabled={isLocked}
                placeholder="Contoh: Putri Bungsu dari Bapak Indra & Ibu Narti"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={draft.couple.bride.info ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    couple: {
                      ...prev.couple,
                      bride: {
                        ...prev.couple.bride,
                        info: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer active:scale-[0.99]">
                {uploadingField === "bride_photo" ? (
                  <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-[#C89B57]" />
                )}
                <span>
                  {uploadingField === "bride_photo"
                    ? "Mengupload..."
                    : "Upload Foto Wanita"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLocked || uploadingField === "bride_photo"}
                  onChange={handleBridePhotoUpload}
                  className="hidden"
                />
              </label>
              {draft.couple.bride.photo && (
                <div className="mt-2 flex items-center gap-2.5">
                  <img
                    src={draft.couple.bride.photo}
                    alt="Bride"
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        couple: {
                          ...prev.couple,
                          bride: { ...prev.couple.bride, photo: "" },
                        },
                      }))
                    }
                    className="text-xs text-red-600 underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cover Photo & Backsound Music (Sesuai PUT /api/v1/invitations/:id) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DDD5]">
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <label className="block text-xs font-semibold">
              Foto Sampul Undangan
            </label>
            <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer">
              {uploadingField === "cover_photo" ? (
                <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4 text-[#C89B57]" />
              )}
              <span>
                {uploadingField === "cover_photo"
                  ? "Mengupload..."
                  : "Upload Foto Cover"}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={isLocked || uploadingField === "cover_photo"}
                onChange={handleCoverPhotoUpload}
                className="hidden"
              />
            </label>
            {draft.meta.coverPhoto && (
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={draft.meta.coverPhoto}
                  alt="Cover"
                  className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD5]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      meta: { ...prev.meta, coverPhoto: "" },
                    }))
                  }
                  className="text-xs text-red-600 underline"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]">
            <label className="block text-xs font-semibold">
              Musik Latar / Backsound
            </label>
            <label className="flex items-center justify-center gap-2 w-full h-11 px-3 rounded-xl border border-dashed border-[#C89B57] bg-white text-xs font-medium text-[#2C2018] cursor-pointer">
              {uploadingField === "music_url" ? (
                <Loader2 className="w-4 h-4 text-[#C89B57] animate-spin" />
              ) : (
                <Music className="w-4 h-4 text-[#C89B57]" />
              )}
              <span>
                {uploadingField === "music_url"
                  ? "Mengupload..."
                  : "Upload File Musik (MP3)"}
              </span>
              <input
                type="file"
                accept="audio/*"
                disabled={isLocked || uploadingField === "music_url"}
                onChange={handleMusicUpload}
                className="hidden"
              />
            </label>
            <Input
              disabled={isLocked}
              placeholder="Atau tempel URL musik (misal: bgmusic.mp3)"
              className="h-9 bg-white rounded-xl text-xs"
              value={draft.meta.audio.url}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  meta: {
                    ...prev.meta,
                    audio: { ...prev.meta.audio, url: e.target.value },
                  },
                }))
              }
            />
          </div>
        </div>

        {/* Kutipan / Ayat Pembuka (quote_preset) */}
        {(() => {
          const activePreset = getQuotePreset(draft.quotePreset)
          const activeCategory = activePreset.category
          const categoryPresets = QUOTE_PRESETS.filter(
            (p) => p.category === activeCategory
          )

          return (
            <div className="space-y-3 pt-4 border-t border-[#E5DDD5]">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2C2018]">
                  <Quote className="w-3.5 h-3.5 text-[#A8763E]" />
                  Kutipan / Ayat Pembuka
                </label>
                <p className="text-[11px] text-[#6B5B4E] mt-0.5">
                  Pilih kategori lalu tentukan ayat atau kutipan favorit Anda. Pilihan non-Muslim otomatis menyembunyikan teks Arab dan menyesuaikan salam.
                </p>
              </div>

              {/* Step 1: Pilih Kategori (Islam, Kristen, Katolik, Hindu, Buddha, Umum, Tanpa Kutipan) */}
              <div className="flex flex-wrap gap-1.5">
                {QUOTE_CATEGORIES.map((cat) => {
                  const count = QUOTE_PRESETS.filter(
                    (p) => p.category === cat.id
                  ).length
                  const isCatActive = activeCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        const firstInCat = QUOTE_PRESETS.find(
                          (p) => p.category === cat.id
                        )
                        if (firstInCat) {
                          setDraft((prev) => ({
                            ...prev,
                            quotePreset: firstInCat.id,
                          }))
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer disabled:opacity-60 ${
                        isCatActive
                          ? "bg-[#2C2018] text-white border-[#2C2018]"
                          : "bg-white text-[#6B5B4E] border-[#E5DDD5] hover:border-[#C89B57] hover:text-[#2C2018]"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {cat.id !== "none" && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isCatActive
                              ? "bg-white/15 text-[#E5C27A]"
                              : "bg-[#FAF6F1] text-[#8A796B]"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Step 2: Pilih Opsi Kutipan dalam Kategori Aktif */}
              {categoryPresets.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categoryPresets.map((preset) => {
                    const selected = activePreset.id === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            quotePreset: preset.id,
                          }))
                        }
                        className={`text-left p-3 rounded-xl border transition cursor-pointer disabled:opacity-60 flex flex-col justify-between gap-1.5 ${
                          selected
                            ? "bg-[#2C2018] text-white border-[#2C2018] shadow-xs"
                            : "bg-[#FAF6F1] text-[#2C2018] border-[#E5DDD5] hover:border-[#C89B57]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {preset.label}
                            </span>
                            <span
                              className={`text-[10px] block truncate ${
                                selected ? "text-[#E5C27A]" : "text-[#A8763E]"
                              }`}
                            >
                              {preset.subtitle}
                            </span>
                          </div>
                          {selected && (
                            <Check className="w-3.5 h-3.5 text-[#E5C27A] shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] line-clamp-2 leading-relaxed ${
                            selected ? "text-white/75" : "text-[#6B5B4E]"
                          }`}
                        >
                          “{preset.translation}”
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Preview Lengkap Kutipan Terpilih */}
              <div className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-1.5 text-center">
                {activePreset.hidden ? (
                  <p className="text-xs text-[#6B5B4E] italic">
                    Section ayat/kutipan akan disembunyikan dari undangan, dengan salam netral (“{activePreset.openingGreeting}”).
                  </p>
                ) : (
                  <>
                    {activePreset.arabic && (
                      <p
                        dir="rtl"
                        className="text-sm leading-relaxed text-[#2C2018] font-serif"
                      >
                        {activePreset.arabic}
                      </p>
                    )}
                    <p className="text-xs text-[#6B5B4E] italic leading-relaxed max-w-2xl mx-auto">
                      “{activePreset.translation}”
                    </p>
                    <p className="text-[11px] font-semibold text-[#A8763E]">
                      {activePreset.source}
                    </p>
                  </>
                )}
              </div>
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}
