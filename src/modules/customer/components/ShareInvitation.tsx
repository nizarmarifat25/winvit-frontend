import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, Check, Send, Trash2, UserPlus, Loader2 } from "lucide-react"
import type { GuestItem, InvitationData } from "@/types/winvit"
import {
  getAccessToken,
  getGuestsApi,
  createGuestApi,
  deleteGuestApi,
} from "@/lib/api"

interface ShareInvitationProps {
  invitation: InvitationData
  slugPath: string
  isActive: boolean
}

export default function ShareInvitation({
  invitation,
  slugPath,
  isActive,
}: ShareInvitationProps) {
  const [guestName, setGuestName] = useState("")
  const [guests, setGuests] = useState<GuestItem[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [addingGuest, setAddingGuest] = useState(false)

  const baseInviteUrl = `${window.location.origin}/u/${slugPath}`

  useEffect(() => {
    if (!isActive || !invitation.id || !getAccessToken()) return
    setLoadingGuests(true)
    getGuestsApi(invitation.id)
      .then((res) => {
        if (Array.isArray(res)) {
          setGuests(res)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingGuests(false))
  }, [isActive, invitation.id])

  const buildGuestUrl = (name: string, guestSlug?: string) => {
    const param = guestSlug || name
    return param
      ? `${baseInviteUrl}?to=${encodeURIComponent(param)}`
      : baseInviteUrl
  }

  const getWaMessage = (name: string, url: string) => {
    const coupleTitle =
      invitation.couple.groom.nickname && invitation.couple.bride.nickname
        ? `${invitation.couple.groom.nickname} & ${invitation.couple.bride.nickname}`
        : invitation.couple.groom.fullName && invitation.couple.bride.fullName
          ? `${invitation.couple.groom.fullName} & ${invitation.couple.bride.fullName}`
          : "Kami"
    return `Kepada Yth. ${name || "Bapak/Ibu/Saudara/i"}\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan ${coupleTitle}.\n\nLink Undangan:\n${url}`
  }

  const handleCopy = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = guestName.trim()
    if (!trimmed) return

    setAddingGuest(true)
    try {
      if (getAccessToken() && invitation.id) {
        const created = await createGuestApi(invitation.id, trimmed)
        const newGuest: GuestItem = {
          id: created?.id || `local-${Date.now()}`,
          invitation_id: invitation.id,
          name: created?.name || trimmed,
          slug: created?.slug,
        }
        setGuests((prev) => [newGuest, ...prev])
      } else {
        setGuests((prev) => [
          {
            id: `local-${Date.now()}`,
            name: trimmed,
          },
          ...prev,
        ])
      }
      setGuestName("")
    } catch {
      setGuests((prev) => [
        {
          id: `local-${Date.now()}`,
          name: trimmed,
        },
        ...prev,
      ])
      setGuestName("")
    } finally {
      setAddingGuest(false)
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId))
    if (getAccessToken() && !guestId.startsWith("local-")) {
      await deleteGuestApi(guestId).catch(() => {})
    }
  }

  const quickPreviewUrl = buildGuestUrl(guestName.trim())

  return (
    <div className={`${isActive ? "" : "hidden"} w-full space-y-4`}>
      <h1 className="text-lg sm:text-xl font-bold">Sebar Undangan (Daftar Tamu)</h1>

      <Card className="rounded-2xl shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <form onSubmit={handleAddGuest} className="space-y-3">
            <label className="block text-xs font-medium text-[#6B5B4E]">
              Tambah Nama Tamu Undangan
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Contoh: Dewi Kartika Sari"
                className="h-11 sm:h-10 rounded-xl flex-1"
              />
              <Button
                type="submit"
                variant="gold"
                disabled={addingGuest || !guestName.trim()}
                className="h-11 sm:h-10 rounded-xl gap-1.5 shrink-0"
              >
                {addingGuest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Simpan Tamu
              </Button>
            </div>
          </form>

          {guestName.trim() && (
            <div className="p-3 rounded-xl bg-[#FAF6F1] border border-[#E5DDD5] space-y-2">
              <p className="text-[11px] text-[#6B5B4E]">
                Preview Link untuk <strong>{guestName}</strong>:
              </p>
              <p className="text-xs font-mono break-all text-[#2C2018]">
                {quickPreviewUrl}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs rounded-lg gap-1"
                  onClick={() => handleCopy("quick", quickPreviewUrl)}
                >
                  {copiedId === "quick" ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin Link
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="gold"
                  className="h-8 text-xs rounded-lg gap-1"
                  asChild
                >
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      getWaMessage(guestName.trim(), quickPreviewUrl)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send className="w-3.5 h-3.5" /> Kirim WA
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#E5DDD5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B5B4E]">
                Daftar Tamu Tersimpan ({guests.length})
              </span>
              {loadingGuests && (
                <span className="text-xs text-[#6B5B4E] inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
                </span>
              )}
            </div>

            {guests.length === 0 ? (
              <p className="text-xs text-[#6B5B4E] py-6 text-center rounded-2xl bg-[#FAF6F1] border border-dashed border-[#E5DDD5]">
                Belum ada tamu yang disimpan. Tambahkan nama tamu di atas untuk membuat link personal.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {guests.map((g) => {
                  const gUrl = buildGuestUrl(g.name, g.slug)
                  return (
                    <div
                      key={g.id}
                      className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{g.name}</p>
                        <p className="text-[11px] text-[#6B5B4E] truncate">{gUrl}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs rounded-lg gap-1"
                          onClick={() => handleCopy(g.id, gUrl)}
                        >
                          {copiedId === g.id ? (
                            <>
                              <Check className="w-3 h-3" /> Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Salin
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="gold"
                          className="h-8 px-2.5 text-xs rounded-lg gap-1"
                          asChild
                        >
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              getWaMessage(g.name, gUrl)
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Send className="w-3 h-3" /> WA
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs rounded-lg text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteGuest(g.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
