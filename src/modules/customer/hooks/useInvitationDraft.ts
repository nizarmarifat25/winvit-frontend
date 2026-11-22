import { useState, useEffect, useRef } from "react"
import type { ChangeEvent, Dispatch, SetStateAction } from "react"
import type {
  InvitationData,
  EventItem,
  StoryItem,
  GalleryItem,
  GiftBankAccount,
} from "@/types/winvit"
import { DEFAULT_INVITATION } from "@/data/themes"
import {
  getAccessToken,
  uploadMediaFile,
  getInvitationsApi,
  updateInvitationApi,
  getEventsApi,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  getStoriesApi,
  createStoryApi,
  updateStoryApi,
  deleteStoryApi,
  getGalleriesApi,
  createGalleryApi,
  deleteGalleryApi,
  getGiftsApi,
  createGiftApi,
  deleteGiftApi,
} from "@/lib/api"

function toIsoDateTime(dateStr: string, timeStr: string): string {
  const d = dateStr || new Date().toISOString().slice(0, 10)
  const t = timeStr && timeStr.length >= 5 ? timeStr.slice(0, 5) : "09:00"
  return `${d}T${t}:00+07:00`
}

function parseIsoToDateAndTime(isoStr?: string | null): { date: string; time: string } {
  if (!isoStr) return { date: "", time: "" }
  const match = isoStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (match) {
    return { date: match[1], time: match[2] }
  }
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return { date: "", time: "" }
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  }
}

export function useInvitationDraft(
  invitation: InvitationData,
  setInvitation: Dispatch<SetStateAction<InvitationData>>
) {
  const [draft, setDraft] = useState<InvitationData>(invitation)
  const [renderKey, setRenderKey] = useState(0)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [generatedNotice, setGeneratedNotice] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Track server IDs so we can DELETE removed items on Generate Undangan
  const serverEventIdsRef = useRef<string[]>([])
  const serverStoryIdsRef = useRef<string[]>([])
  const serverGalleryIdsRef = useRef<string[]>([])
  const serverGiftIdsRef = useRef<string[]>([])

  // Fetch initial data from Backend if authenticated
  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    let isMounted = true

    async function loadFromBackend() {
      try {
        const invRes = await getInvitationsApi()
        const invItem = Array.isArray(invRes)
          ? invRes[0]
          : invRes?.items?.[0] || invRes?.invitations?.[0] || invRes

        if (!isMounted) return

        if (!invItem || !invItem.id) {
          setDraft(DEFAULT_INVITATION)
          setInvitation(DEFAULT_INVITATION)
          return
        }

        const invId: string = invItem.id

        const [eventsRes, storiesRes, galleriesRes, giftsRes] = await Promise.all([
          getEventsApi(invId).catch(() => []),
          getStoriesApi(invId).catch(() => []),
          getGalleriesApi(invId).catch(() => []),
          getGiftsApi(invId).catch(() => []),
        ])

        if (!isMounted) return

        const rawEvents = Array.isArray(eventsRes) ? eventsRes : []
        const mappedEvents: EventItem[] = rawEvents.map((ev: any, idx: number) => {
          const start = parseIsoToDateAndTime(ev.start_time)
          const end = parseIsoToDateAndTime(ev.end_time)
          return {
            id: ev.id,
            name: ev.name || `Acara ${idx + 1}`,
            date: start.date,
            startTime: start.time,
            endTime: end.time,
            locationName: ev.location_name || "",
            locationAddress: ev.location_address || "",
            locationUrl: ev.location_url || "",
            sortOrder: ev.sort_order ?? idx + 1,
          }
        })
        serverEventIdsRef.current = mappedEvents.map((e) => e.id!).filter(Boolean)

        const rawStories = Array.isArray(storiesRes) ? storiesRes : []
        const mappedStories: StoryItem[] = rawStories.map((st: any, idx: number) => ({
          id: st.id,
          title: st.title || "",
          badge: st.date_label || "",
          storyDate: st.story_date || null,
          content: st.story || "",
          photo: st.image_url || "",
          sortOrder: st.sort_order ?? idx + 1,
        }))
        serverStoryIdsRef.current = mappedStories.map((s) => s.id!).filter(Boolean)

        const rawGalleries = Array.isArray(galleriesRes) ? galleriesRes : []
        const mappedGalleries: GalleryItem[] = rawGalleries.map(
          (g: any, idx: number) => ({
            id: g.id,
            mediaType: g.media_type || "image/png",
            mediaUrl: g.media_url || "",
            sortOrder: g.sort_order ?? idx + 1,
          })
        )
        serverGalleryIdsRef.current = mappedGalleries.map((g) => g.id!).filter(Boolean)

        const rawGifts = Array.isArray(giftsRes) ? giftsRes : []
        const mappedGifts: GiftBankAccount[] = rawGifts.map((gf: any, idx: number) => ({
          id: gf.id,
          bankName: gf.account_name || "",
          accountNumber: gf.account_number || "",
          accountHolder: gf.on_behalf_of || "",
          sortOrder: gf.sort_order ?? idx + 1,
        }))
        serverGiftIdsRef.current = mappedGifts.map((g) => g.id!).filter(Boolean)

        const akadEv = mappedEvents[0]
        const resepsiEv = mappedEvents[1]

        const updated: InvitationData = {
          ...DEFAULT_INVITATION,
          id: invId,
          slug: invItem.slug || "",
          themeId: invItem.theme_id || DEFAULT_INVITATION.themeId,
          isPublished: Boolean(invItem.is_published),
          status: invItem.is_published ? "PUBLISHED" : "ACTIVE_DRAFT",
          meta: {
            ...DEFAULT_INVITATION.meta,
            coverPhoto: invItem.cover_photo_url || "",
            audio: {
              ...DEFAULT_INVITATION.meta.audio,
              url: invItem.music_url || "",
            },
          },
          couple: {
            bride: {
              ...DEFAULT_INVITATION.couple.bride,
              fullName: invItem.bride_name || "",
              nickname: invItem.bride_name?.split(" ")[0] || "",
              info: invItem.bride_info || "",
              photo: invItem.bride_photo_url || "",
            },
            groom: {
              ...DEFAULT_INVITATION.couple.groom,
              fullName: invItem.groom_name || "",
              nickname: invItem.groom_name?.split(" ")[0] || "",
              info: invItem.groom_info || "",
              photo: invItem.groom_photo_url || "",
            },
          },
          eventList:
            mappedEvents.length > 0
              ? mappedEvents
              : DEFAULT_INVITATION.eventList,
          events: {
            ...DEFAULT_INVITATION.events,
            akad: akadEv
              ? {
                title: akadEv.name,
                date: akadEv.date,
                startTime: akadEv.startTime,
                endTime: akadEv.endTime,
                locationName: akadEv.locationName,
                address: akadEv.locationAddress,
                mapsUrl: akadEv.locationUrl,
              }
              : DEFAULT_INVITATION.events.akad,
            resepsi: resepsiEv
              ? {
                title: resepsiEv.name,
                date: resepsiEv.date,
                startTime: resepsiEv.startTime,
                endTime: resepsiEv.endTime,
                locationName: resepsiEv.locationName,
                address: resepsiEv.locationAddress,
                mapsUrl: resepsiEv.locationUrl,
              }
              : DEFAULT_INVITATION.events.resepsi,
          },
          stories: mappedStories,
          galleryItems: mappedGalleries,
          media: {
            ...DEFAULT_INVITATION.media,
            gallery: mappedGalleries.map((g) => g.mediaUrl),
          },
          gifts: {
            ...DEFAULT_INVITATION.gifts,
            bankAccounts: mappedGifts,
          },
        }
        setDraft(updated)
        setInvitation(updated)
      } catch (err: any) {
        if (isMounted) {
          setSyncError(
            `Gagal mengambil data undangan dari server: ${err?.message || "Terjadi kesalahan jaringan"}`
          )
        }
      }
    }

    loadFromBackend()
    return () => {
      isMounted = false
    }
  }, [setInvitation])

  const uploadOrLocalUrl = async (file: File, fieldKey: string): Promise<string> => {
    if (!getAccessToken()) {
      return URL.createObjectURL(file)
    }
    setUploadingField(fieldKey)
    try {
      const uploadedUrl = await uploadMediaFile(file)
      return uploadedUrl
    } catch {
      return URL.createObjectURL(file)
    } finally {
      setUploadingField(null)
    }
  }

  const handleBridePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = await uploadOrLocalUrl(file, "bride_photo")
    setDraft((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        bride: { ...prev.couple.bride, photo: url },
      },
    }))
  }

  const handleGroomPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = await uploadOrLocalUrl(file, "groom_photo")
    setDraft((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        groom: { ...prev.couple.groom, photo: url },
      },
    }))
  }

  const handleCoverPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = await uploadOrLocalUrl(file, "cover_photo")
    setDraft((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        coverPhoto: url,
      },
    }))
  }

  const handleMusicUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = await uploadOrLocalUrl(file, "music_url")
    setDraft((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        audio: {
          ...prev.meta.audio,
          url,
        },
      },
    }))
  }

  const handleStoryPhotoUpload = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = await uploadOrLocalUrl(file, `story_photo_${index}`)
    setDraft((prev) => {
      const next = [...prev.stories]
      if (next[index]) {
        next[index] = { ...next[index], photo: url }
      }
      return { ...prev, stories: next }
    })
  }

  const handleGalleryPhotosUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    const fileList = Array.from(files)
    event.target.value = ""

    const uploadedItems: GalleryItem[] = []
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i]
      const url = await uploadOrLocalUrl(f, "gallery")
      uploadedItems.push({
        mediaType: f.type || "image/png",
        mediaUrl: url,
        sortOrder: (draft.galleryItems?.length || draft.media.gallery.length) + i + 1,
      })
    }

    setDraft((prev) => {
      const existingItems: GalleryItem[] =
        prev.galleryItems ??
        prev.media.gallery.map((u, idx) => ({
          mediaType: "image/png",
          mediaUrl: u,
          sortOrder: idx + 1,
        }))
      const combined = [...existingItems, ...uploadedItems]
      return {
        ...prev,
        galleryItems: combined,
        media: {
          ...prev.media,
          gallery: combined.map((item) => item.mediaUrl),
        },
      }
    })
  }

  // Batch sync all sections to Backend on clicking "Generate Undangan"
  const handleGenerateInvitation = async (onMobilePreview: () => void) => {
    setSyncError(null)
    setIsGenerating(true)

    // Keep legacy events.akad & events.resepsi synced with eventList for preview renderer
    const list = draft.eventList || []
    const akadItem = list[0]
    const resepsiItem = list[1]
    const syncedDraft: InvitationData = {
      ...draft,
      events: {
        ...draft.events,
        akad: akadItem
          ? {
            title: akadItem.name,
            date: akadItem.date,
            startTime: akadItem.startTime,
            endTime: akadItem.endTime,
            locationName: akadItem.locationName,
            address: akadItem.locationAddress,
            mapsUrl: akadItem.locationUrl,
          }
          : draft.events.akad,
        resepsi: resepsiItem
          ? {
            title: resepsiItem.name,
            date: resepsiItem.date,
            startTime: resepsiItem.startTime,
            endTime: resepsiItem.endTime,
            locationName: resepsiItem.locationName,
            address: resepsiItem.locationAddress,
            mapsUrl: resepsiItem.locationUrl,
          }
          : draft.events.resepsi,
      },
    }

    try {
      const token = getAccessToken()
      let invId = syncedDraft.id

      if (token && !invId) {
        try {
          const invRes = await getInvitationsApi()
          const first = Array.isArray(invRes)
            ? invRes[0]
            : invRes?.items?.[0] || invRes?.invitations?.[0] || invRes
          if (first?.id) {
            invId = first.id
          }
        } catch {
          // ignore if no invitation on server yet
        }
      }

      if (token && !invId) {
        setSyncError(
          "Akun yang sedang login belum memiliki data undangan (invitation_id kosong dari GET /api/v1/invitations). Gunakan akun customer yang ordernya sudah di-approve Admin (contoh: budi.santoso@example.com / rahasia123)."
        )
      }

      if (token && invId) {
        const groomInfo =
          syncedDraft.couple.groom.info?.trim() ||
          [
            syncedDraft.couple.groom.fatherName &&
            `Bapak ${syncedDraft.couple.groom.fatherName}`,
            syncedDraft.couple.groom.motherName &&
            `Ibu ${syncedDraft.couple.groom.motherName}`,
          ]
            .filter(Boolean)
            .join(" & ")
        const brideInfo =
          syncedDraft.couple.bride.info?.trim() ||
          [
            syncedDraft.couple.bride.fatherName &&
            `Bapak ${syncedDraft.couple.bride.fatherName}`,
            syncedDraft.couple.bride.motherName &&
            `Ibu ${syncedDraft.couple.bride.motherName}`,
          ]
            .filter(Boolean)
            .join(" & ")

        // 1. Update Main Invitation (Couple + Cover + Music + Slug)
        await updateInvitationApi(invId, {
          slug: syncedDraft.slug,
          groom_name:
            syncedDraft.couple.groom.fullName || syncedDraft.couple.groom.nickname,
          groom_info: groomInfo,
          groom_photo_url: syncedDraft.couple.groom.photo || "",
          bride_name:
            syncedDraft.couple.bride.fullName || syncedDraft.couple.bride.nickname,
          bride_info: brideInfo,
          bride_photo_url: syncedDraft.couple.bride.photo || "",
          cover_photo_url: syncedDraft.meta.coverPhoto || "",
          music_url: syncedDraft.meta.audio.url || "",
          is_published: Boolean(
            syncedDraft.isPublished || syncedDraft.status === "PUBLISHED"
          ),
        })

        // 2. Sync Events (Create / Update / Delete)
        const currentEventIds = new Set(
          (syncedDraft.eventList || []).map((e) => e.id).filter(Boolean) as string[]
        )
        for (const oldId of serverEventIdsRef.current) {
          if (!currentEventIds.has(oldId)) {
            await deleteEventApi(oldId).catch(() => { })
          }
        }
        const updatedEvents: EventItem[] = []
        for (let i = 0; i < (syncedDraft.eventList || []).length; i++) {
          const ev = syncedDraft.eventList![i]
          if (!ev.name.trim() && !ev.locationAddress.trim() && !ev.date) continue
          const payload = {
            name: ev.name || `Acara ${i + 1}`,
            start_time: toIsoDateTime(ev.date, ev.startTime),
            end_time: toIsoDateTime(ev.date, ev.endTime),
            location_name: ev.locationName || ev.name || "-",
            location_address: ev.locationAddress || "-",
            location_url: ev.locationUrl || "https://maps.google.com",
            sort_order: i + 1,
          }
          if (ev.id) {
            await updateEventApi(ev.id, payload)
            updatedEvents.push({ ...ev, sortOrder: i + 1 })
          } else {
            const created = await createEventApi({
              invitation_id: invId,
              ...payload,
            })
            updatedEvents.push({
              ...ev,
              id: created?.id,
              sortOrder: i + 1,
            })
          }
        }
        serverEventIdsRef.current = updatedEvents
          .map((e) => e.id!)
          .filter(Boolean)
        syncedDraft.eventList =
          updatedEvents.length > 0 ? updatedEvents : syncedDraft.eventList

        // 3. Sync Love Stories (Create / Update / Delete)
        const currentStoryIds = new Set(
          syncedDraft.stories.map((s) => s.id).filter(Boolean) as string[]
        )
        for (const oldId of serverStoryIdsRef.current) {
          if (!currentStoryIds.has(oldId)) {
            await deleteStoryApi(oldId).catch(() => { })
          }
        }
        const updatedStories: StoryItem[] = []
        for (let i = 0; i < syncedDraft.stories.length; i++) {
          const st = syncedDraft.stories[i]
          if (!st.title.trim() && !st.content.trim()) continue
          const payload = {
            title: st.title || `Bab ${i + 1}`,
            story: st.content || "-",
            story_date: st.storyDate || null,
            date_label: st.badge || `Momen ${i + 1}`,
            image_url: st.photo || "placeholder.png",
            sort_order: i + 1,
          }
          if (st.id) {
            await updateStoryApi(st.id, payload)
            updatedStories.push({ ...st, sortOrder: i + 1 })
          } else {
            const created = await createStoryApi({
              invitation_id: invId,
              ...payload,
            })
            updatedStories.push({
              ...st,
              id: created?.id,
              sortOrder: i + 1,
            })
          }
        }
        serverStoryIdsRef.current = updatedStories
          .map((s) => s.id!)
          .filter(Boolean)
        syncedDraft.stories = updatedStories

        // 4. Sync Galleries (Create new / Delete removed)
        const galleryItems: GalleryItem[] =
          syncedDraft.galleryItems ??
          syncedDraft.media.gallery.map((url, idx) => ({
            mediaType: "image/png",
            mediaUrl: url,
            sortOrder: idx + 1,
          }))
        const currentGalleryIds = new Set(
          galleryItems.map((g) => g.id).filter(Boolean) as string[]
        )
        for (const oldId of serverGalleryIdsRef.current) {
          if (!currentGalleryIds.has(oldId)) {
            await deleteGalleryApi(oldId).catch(() => { })
          }
        }
        const updatedGalleries: GalleryItem[] = []
        for (let i = 0; i < galleryItems.length; i++) {
          const g = galleryItems[i]
          if (!g.mediaUrl) continue
          if (g.id) {
            updatedGalleries.push({ ...g, sortOrder: i + 1 })
          } else {
            const created = await createGalleryApi({
              invitation_id: invId,
              media_type: g.mediaType || "image/png",
              media_url: g.mediaUrl,
              sort_order: i + 1,
            })
            updatedGalleries.push({
              ...g,
              id: created?.id,
              sortOrder: i + 1,
            })
          }
        }
        serverGalleryIdsRef.current = updatedGalleries
          .map((g) => g.id!)
          .filter(Boolean)
        syncedDraft.galleryItems = updatedGalleries

        // 5. Sync Gifts / Rekening (Create new / Delete removed)
        const currentGiftIds = new Set(
          syncedDraft.gifts.bankAccounts.map((g) => g.id).filter(Boolean) as string[]
        )
        for (const oldId of serverGiftIdsRef.current) {
          if (!currentGiftIds.has(oldId)) {
            await deleteGiftApi(oldId).catch(() => { })
          }
        }
        const updatedGifts: GiftBankAccount[] = []
        for (let i = 0; i < syncedDraft.gifts.bankAccounts.length; i++) {
          const gf = syncedDraft.gifts.bankAccounts[i]
          if (!gf.bankName.trim() && !gf.accountNumber.trim()) continue
          if (gf.id) {
            updatedGifts.push({ ...gf, sortOrder: i + 1 })
          } else {
            const created = await createGiftApi({
              invitation_id: invId,
              account_name: gf.bankName,
              account_number: gf.accountNumber,
              on_behalf_of: gf.accountHolder,
              sort_order: i + 1,
            })
            updatedGifts.push({
              ...gf,
              id: created?.id,
              sortOrder: i + 1,
            })
          }
        }
        serverGiftIdsRef.current = updatedGifts
          .map((g) => g.id!)
          .filter(Boolean)
        syncedDraft.gifts.bankAccounts = updatedGifts
      }

      setDraft(syncedDraft)
      setInvitation(syncedDraft)
      setHasGenerated(true)
      setRenderKey((prev) => prev + 1)
      setGeneratedNotice(true)
      window.setTimeout(() => setGeneratedNotice(false), 3000)
      if (window.innerWidth < 1024) onMobilePreview()
    } catch (err: any) {
      setSyncError(
        err?.message || "Gagal menyinkronkan sebagian data ke server, namun preview lokal tetap diperbarui."
      )
      setDraft(syncedDraft)
      setInvitation(syncedDraft)
      setHasGenerated(true)
      setRenderKey((prev) => prev + 1)
    } finally {
      setIsGenerating(false)
    }
  }

    const handleSetPublishStatus = async (nextPublished: boolean) => {
      setSyncError(null)
      setIsPublishing(true)

      const token = getAccessToken()
      const invId = draft.id || invitation.id

      const groomInfo =
        draft.couple.groom.info?.trim() ||
        [
          draft.couple.groom.fatherName && `Bapak ${draft.couple.groom.fatherName}`,
          draft.couple.groom.motherName && `Ibu ${draft.couple.groom.motherName}`,
        ]
          .filter(Boolean)
          .join(" & ")
      const brideInfo =
        draft.couple.bride.info?.trim() ||
        [
          draft.couple.bride.fatherName && `Bapak ${draft.couple.bride.fatherName}`,
          draft.couple.bride.motherName && `Ibu ${draft.couple.bride.motherName}`,
        ]
          .filter(Boolean)
          .join(" & ")

      try {
        if (token && invId) {
          await updateInvitationApi(invId, {
            slug: draft.slug,
            groom_name: draft.couple.groom.fullName || draft.couple.groom.nickname,
            groom_info: groomInfo,
            groom_photo_url: draft.couple.groom.photo || "",
            bride_name: draft.couple.bride.fullName || draft.couple.bride.nickname,
            bride_info: brideInfo,
            bride_photo_url: draft.couple.bride.photo || "",
            cover_photo_url: draft.meta.coverPhoto || "",
            music_url: draft.meta.audio.url || "",
            is_published: nextPublished,
          })
        }
        const nextStatus = nextPublished ? "PUBLISHED" : "ACTIVE_DRAFT"
        setDraft((prev) => ({
          ...prev,
          status: nextStatus,
          isPublished: nextPublished,
        }))
        setInvitation((prev) => ({
          ...prev,
          status: nextStatus,
          isPublished: nextPublished,
        }))
      } catch (err: any) {
        setSyncError(
          err?.message ||
          (nextPublished
            ? "Gagal mem-publish undangan ke server."
            : "Gagal mengubah status undangan ke draft.")
        )
      } finally {
        setIsPublishing(false)
      }
    }

    return {
      draft,
      setDraft,
      renderKey,
      hasGenerated,
      generatedNotice,
      isGenerating,
      isPublishing,
      uploadingField,
      syncError,
      handleBridePhotoUpload,
      handleGroomPhotoUpload,
      handleCoverPhotoUpload,
      handleMusicUpload,
      handleStoryPhotoUpload,
      handleGalleryPhotosUpload,
      handleGenerateInvitation,
      handleSetPublishStatus,
    }
  }
