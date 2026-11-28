import type { CustomerEditorStepProps } from "../types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function GiftStep({
  detailTab,
  draft,
  setDraft,
  isLocked,
}: CustomerEditorStepProps) {
  if (detailTab !== "gift") return null

  return (
    <Card className="rounded-2xl shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold block">
              Daftar Rekening Amplop Digital
            </span>
            <span className="text-xs text-[#6B5B4E]">
              Tambahkan rekening bank atau e-wallet untuk amplop digital
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={isLocked}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                gifts: {
                  ...prev.gifts,
                  bankAccounts: [
                    ...prev.gifts.bankAccounts,
                    { bankName: "", accountNumber: "", accountHolder: "" },
                  ],
                },
              }))
            }
          >
            + Tambah Rekening
          </Button>
        </div>

        {draft.gifts.bankAccounts.length === 0 ? (
          <p className="text-xs text-[#6B5B4E] py-6 text-center rounded-2xl bg-[#FAF6F1] border border-dashed border-[#E5DDD5]">
            Belum ada nomor rekening yang ditambahkan.
          </p>
        ) : (
          draft.gifts.bankAccounts.map((acc, idx) => (
            <div
              key={acc.id || idx}
              className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5]"
            >
              <Input
                disabled={isLocked}
                placeholder="Nama Bank (cth: BCA)"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={acc.bankName}
                onChange={(e) => {
                  const next = [...draft.gifts.bankAccounts]
                  // Clear id if edited so backend re-creates via DELETE + POST
                  next[idx] = { ...next[idx], id: undefined, bankName: e.target.value }
                  setDraft((prev) => ({
                    ...prev,
                    gifts: { ...prev.gifts, bankAccounts: next },
                  }))
                }}
              />
              <Input
                disabled={isLocked}
                placeholder="No. Rekening"
                className="h-11 sm:h-10 bg-white rounded-xl"
                value={acc.accountNumber}
                onChange={(e) => {
                  const next = [...draft.gifts.bankAccounts]
                  next[idx] = {
                    ...next[idx],
                    id: undefined,
                    accountNumber: e.target.value,
                  }
                  setDraft((prev) => ({
                    ...prev,
                    gifts: { ...prev.gifts, bankAccounts: next },
                  }))
                }}
              />
              <div className="flex gap-1.5">
                <Input
                  disabled={isLocked}
                  placeholder="Atas Nama"
                  className="h-11 sm:h-10 bg-white rounded-xl"
                  value={acc.accountHolder}
                  onChange={(e) => {
                    const next = [...draft.gifts.bankAccounts]
                    next[idx] = {
                      ...next[idx],
                      id: undefined,
                      accountHolder: e.target.value,
                    }
                    setDraft((prev) => ({
                      ...prev,
                      gifts: { ...prev.gifts, bankAccounts: next },
                    }))
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-11 sm:h-10 px-3 rounded-xl"
                  disabled={isLocked}
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      gifts: {
                        ...prev.gifts,
                        bankAccounts: prev.gifts.bankAccounts.filter(
                          (_, i) => i !== idx
                        ),
                      },
                    }))
                  }
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
