import type { Dispatch, SetStateAction, ChangeEventHandler, ChangeEvent } from "react"
import type {
  InvitationData,
  ThemeCategory,
  ThemeItem,
} from "@/types/winvit"

export type DetailSubTab =
  | "couple"
  | "events"
  | "story"
  | "media"
  | "gift"
  | "confirm"

export type ThemeCategoryFilter = "all" | ThemeCategory

export interface CustomerEditorStepProps {
  detailTab: DetailSubTab
  draft: InvitationData
  setDraft: Dispatch<SetStateAction<InvitationData>>
  isLocked: boolean
  setDetailTab: Dispatch<SetStateAction<DetailSubTab>>
  handleBridePhotoUpload: ChangeEventHandler<HTMLInputElement>
  handleGroomPhotoUpload: ChangeEventHandler<HTMLInputElement>
  handleCoverPhotoUpload: ChangeEventHandler<HTMLInputElement>
  handleMusicUpload: ChangeEventHandler<HTMLInputElement>
  handleGalleryPhotosUpload: ChangeEventHandler<HTMLInputElement>
  handleStoryPhotoUpload: (index: number, event: ChangeEvent<HTMLInputElement>) => void
  uploadingField: string | null
  draftTheme: ThemeItem
  hasGenerated: boolean
  generatedNotice: boolean
  isGenerating: boolean
  isPublishing: boolean
  syncError: string | null
  onGenerateInvitation: () => void
  onPublishInvitation: () => void
  onUnpublishInvitation: () => void
  onGoToShare: () => void
}
