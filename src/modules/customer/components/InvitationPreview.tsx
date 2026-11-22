import { Smartphone } from "lucide-react"
import type { InvitationData } from "@/types/winvit"
import type { ThemeItem } from "@/types/winvit"
import { Button } from "@/components/ui/button"
import InvitationRenderer from "@/modules/renderer/InvitationRenderer"

interface InvitationPreviewProps {
  mode: "desktop" | "mobile"
  invitation: InvitationData
  previewTheme: ThemeItem
  hasGenerated: boolean
  renderKey: number
  onEdit: () => void
}

export default function InvitationPreview({
  mode,
  invitation,
  previewTheme,
  hasGenerated,
  renderKey,
  onEdit,
}: InvitationPreviewProps) {
  const isMobile = mode === "mobile"

  return (
    <div
      className={
        isMobile
          ? "max-w-md mx-auto flex flex-col items-center space-y-3"
          : "hidden xl:block xl:col-span-5 xl:sticky xl:top-6"
      }
    >
      {isMobile && (
        <div className="w-full flex items-center justify-between">
          <h1 className="text-lg font-bold">Preview Undangan</h1>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={onEdit}
          >
            Kembali ke Detail
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div
          className={
            isMobile
              ? "relative w-full max-w-[330px] h-[640px] rounded-[50px] bg-[#1c1c1e] p-[10px] shadow-[0_20px_50px_rgba(44,32,24,0.25)] border-[3px] border-[#3a3a3c]"
              : "relative w-[330px] h-[660px] rounded-[52px] bg-[#1c1c1e] p-[11px] shadow-[0_24px_60px_rgba(44,32,24,0.28)] border-[3px] border-[#3a3a3c]"
          }
        >
          <div className="absolute -left-[5px] top-28 w-[3px] h-7 bg-[#3a3a3c] rounded-l-md" />
          <div className="absolute -left-[5px] top-40 w-[3px] h-12 bg-[#3a3a3c] rounded-l-md" />
          {!isMobile && (
            <div className="absolute -left-[5px] top-56 w-[3px] h-12 bg-[#3a3a3c] rounded-l-md" />
          )}
          <div className="absolute -right-[5px] top-44 w-[3px] h-16 bg-[#3a3a3c] rounded-r-md" />

          <div
            className={`relative w-full h-full ${
              isMobile ? "rounded-[40px]" : "rounded-[42px]"
            } overflow-hidden bg-[#FAF6F1] flex flex-col`}
          >
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-24 h-6 bg-black rounded-full flex items-center justify-end pr-2.5 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e] border border-white/10" />
            </div>

            {hasGenerated ? (
              <InvitationRenderer
                previewData={invitation}
                previewThemePath={previewTheme.path}
                embedded
                renderKey={renderKey}
              />
            ) : (
              <div className="relative w-full h-full flex flex-col justify-between p-5 pt-12 pb-8 bg-gradient-to-b from-[#FAF6F1] via-[#F2ECE4] to-[#E5DDD5] select-none">
                <div className="space-y-4 opacity-45 pointer-events-none">
                  <div className="w-20 h-3 mx-auto rounded-full bg-[#C89B57]/40" />
                  <div
                    className={`w-36 ${
                      isMobile ? "h-40" : "h-44"
                    } mx-auto rounded-t-full rounded-b-2xl bg-white/80 border border-[#C89B57]/30`}
                  />
                  <div className="w-44 h-5 mx-auto rounded-full bg-[#2C2018]/25" />
                  <div className="w-28 h-3 mx-auto rounded-full bg-[#6B5B4E]/30" />
                  {!isMobile && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="h-14 rounded-xl bg-white/70" />
                      <div className="h-14 rounded-xl bg-white/70" />
                      <div className="h-14 rounded-xl bg-white/70" />
                    </div>
                  )}
                </div>

                <div
                  className={`my-auto relative z-10 bg-white/95 backdrop-blur-md border border-[#E5DDD5] rounded-2xl p-5 text-center shadow-lg ${
                    isMobile ? "space-y-3" : "space-y-2.5"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#C89B57]/15 text-[#A8763E] flex items-center justify-center mx-auto">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-[#2C2018]">
                    Preview Belum Tersedia
                  </h3>
                  <p className="text-xs text-[#6B5B4E] leading-relaxed">
                    Lengkapi data undangan untuk melihat preview.
                  </p>
                  {isMobile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="gold"
                      className="w-full rounded-xl"
                      onClick={onEdit}
                    >
                      Isi Data Undangan
                    </Button>
                  )}
                </div>

                <div className="w-32 h-8 mx-auto rounded-full bg-[#2C2018]/15 opacity-40" />
              </div>
            )}

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-28 h-1 bg-[#2C2018]/40 rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
