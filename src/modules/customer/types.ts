import type { Dispatch, SetStateAction, ChangeEventHandler, ChangeEvent } from "react"
import type { InvitationData, ThemeCategory } from "@/types/winvit"

export type DetailSubTab =
  | "couple"
  | "events"
  | "story"
  | "media"
  | "gift"

export type ThemeCategoryFilter = "all" | ThemeCategory

export interface CustomerEditorStepProps {
  detailTab: DetailSubTab
  draft: InvitationData
  setDraft: Dispatch<SetStateAction<InvitationData>>
  isLocked: boolean
  handleBridePhotoUpload: ChangeEventHandler<HTMLInputElement>
  handleGroomPhotoUpload: ChangeEventHandler<HTMLInputElement>
  handleCoverPhotoUpload: ChangeEventHandler<HTMLInputElement>
  handleMusicUpload: ChangeEventHandler<HTMLInputElement>
  handleGalleryPhotosUpload: ChangeEventHandler<HTMLInputElement>
  handleStoryPhotoUpload: (index: number, event: ChangeEvent<HTMLInputElement>) => void
  uploadingField: string | null
}
