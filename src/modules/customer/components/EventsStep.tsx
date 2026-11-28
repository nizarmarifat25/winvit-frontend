import type { CustomerEditorStepProps } from "../types"
import type { EventItem } from "@/types/winvit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

export default function EventsStep({
  detailTab,
  draft,
  setDraft,
  isLocked,
}: CustomerEditorStepProps) {
  if (detailTab !== "events") return null

  const eventList: EventItem[] = draft.eventList || [
    {
      name: "Akad Nikah",
      date: draft.events.akad.date || "",
      startTime: draft.events.akad.startTime || "08:00",
      endTime: draft.events.akad.endTime || "10:00",
      locationName: draft.events.akad.locationName || "",
      locationAddress: draft.events.akad.address || "",
      locationUrl: draft.events.akad.mapsUrl || "",
      sortOrder: 1,
    },
    {
      name: "Resepsi",
      date: draft.events.resepsi.date || "",
      startTime: draft.events.resepsi.startTime || "11:00",
      endTime: draft.events.resepsi.endTime || "14:00",
      locationName: draft.events.resepsi.locationName || "",
      locationAddress: draft.events.resepsi.address || "",
      locationUrl: draft.events.resepsi.mapsUrl || "",
      sortOrder: 2,
    },
  ]

  const updateEventAt = (index: number, patch: Partial<EventItem>) => {
    const next = eventList.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    )
    setDraft((prev) => ({
      ...prev,
      eventList: next,
    }))
  }

  const addEventItem = () => {
    const next: EventItem[] = [
      ...eventList,
      {
        name: "",
        date: "",
        startTime: "09:00",
        endTime: "12:00",
        locationName: "",
        locationAddress: "",
        locationUrl: "",
        sortOrder: eventList.length + 1,
      },
    ]
    setDraft((prev) => ({
      ...prev,
      eventList: next,
    }))
  }

  const removeEventItem = (index: number) => {
    const next = eventList.filter((_, i) => i !== index)
    setDraft((prev) => ({
      ...prev,
      eventList: next,
    }))
  }

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">Daftar Rangkaian Acara</h4>
            <p className="text-xs text-[#6B5B4E]">
              Sesuaikan jadwal Akad, Resepsi, atau acara tambahan lainnya
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl gap-1"
            disabled={isLocked}
            onClick={addEventItem}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Acara
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eventList.map((ev, idx) => (
            <div
              key={ev.id || idx}
              className="space-y-2.5 p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#A8763E]">
                  Acara #{idx + 1}
                </span>
                {eventList.length > 1 && (
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => removeEventItem(idx)}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
              </div>

              <Input
                disabled={isLocked}
                placeholder="Nama Acara (cth: Akad Nikah / Resepsi)"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={ev.name}
                onChange={(e) => updateEventAt(idx, { name: e.target.value })}
              />

              <Input
                disabled={isLocked}
                type="date"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={ev.date}
                onChange={(e) => updateEventAt(idx, { date: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#6B5B4E] mb-0.5">
                    Jam Mulai
                  </label>
                  <Input
                    disabled={isLocked}
                    type="time"
                    className="h-11 sm:h-10 bg-white rounded-xl"
                    value={ev.startTime}
                    onChange={(e) =>
                      updateEventAt(idx, { startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6B5B4E] mb-0.5">
                    Jam Selesai
                  </label>
                  <Input
                    disabled={isLocked}
                    type="time"
                    className="h-11 sm:h-10 bg-white rounded-xl"
                    value={ev.endTime}
                    onChange={(e) =>
                      updateEventAt(idx, { endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <Input
                disabled={isLocked}
                placeholder="Nama Gedung / Tempat"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={ev.locationName}
                onChange={(e) =>
                  updateEventAt(idx, { locationName: e.target.value })
                }
              />

              <Input
                disabled={isLocked}
                placeholder="Alamat Lengkap Lokasi"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={ev.locationAddress}
                onChange={(e) =>
                  updateEventAt(idx, { locationAddress: e.target.value })
                }
              />

              <Input
                disabled={isLocked}
                placeholder="Link Google Maps"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={ev.locationUrl}
                onChange={(e) =>
                  updateEventAt(idx, { locationUrl: e.target.value })
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
