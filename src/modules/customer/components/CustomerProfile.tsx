import { useState, useEffect } from "react"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { useWinvit } from "@/context/WinvitContext"
import type { InvitationData } from "@/types/winvit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, LogOut } from "lucide-react"
import {
  getAccessToken,
  decodeJwt,
  getMeApi,
  updateUserApi,
  clearTokens,
} from "@/lib/api"
import { DEFAULT_INVITATION } from "@/data/themes"
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog"

interface CustomerProfileProps {
  draft: InvitationData
  setDraft: Dispatch<SetStateAction<InvitationData>>
  isActive: boolean
}

export default function CustomerProfile({
  draft,
  setDraft,
  isActive,
}: CustomerProfileProps) {
  const navigate = useNavigate()
  const { setInvitation } = useWinvit()
  const [userId, setUserId] = useState<string>("")
  const [profileSaved, setProfileSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!isActive || !token) return

    const claims = decodeJwt(token)
    if (claims?.uid) setUserId(claims.uid)

    getMeApi()
      .then((me) => {
        if (!me) return
        if (me.id) setUserId(me.id)
        setDraft((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            userId: me.id || claims?.uid,
            orderName: me.name || prev.customer.orderName,
            email: me.email || prev.customer.email,
          },
        }))
      })
      .catch(() => {})
  }, [isActive, setDraft])

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMsg("")
    setSaving(true)

    try {
      const token = getAccessToken()
      const targetId =
        userId || draft.customer.userId || (token ? decodeJwt(token)?.uid : "")

      if (token && targetId) {
        await updateUserApi(targetId, {
          name: draft.customer.orderName,
          email: draft.customer.email,
        })
      }

      setInvitation((prev) => ({
        ...prev,
        customer: draft.customer,
      }))
      setProfileSaved(true)
      window.setTimeout(() => setProfileSaved(false), 2500)
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memperbarui profile ke server.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    clearTokens()
    setInvitation(DEFAULT_INVITATION)
    navigate("/login")
  }

  return (
    <div className={`${isActive ? "" : "hidden"} w-full space-y-4`}>
      <h1 className="text-lg sm:text-xl font-bold">Profile Akun</h1>
      <Card className="rounded-2xl shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {profileSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              Profile berhasil diperbarui.
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label
                htmlFor="profile-order-name"
                className="block text-xs font-medium text-[#6B5B4E] mb-1"
              >
                Nama Lengkap (name)
              </label>
              <Input
                id="profile-order-name"
                value={draft.customer.orderName}
                placeholder="Nama lengkap"
                className="h-11 sm:h-10 rounded-xl"
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    customer: {
                      ...prev.customer,
                      orderName: event.target.value,
                    },
                  }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-[#6B5B4E] mb-1"
              >
                Email
              </label>
              <Input
                id="profile-email"
                type="email"
                value={draft.customer.email}
                placeholder="email@domain.com"
                className="h-11 sm:h-10 rounded-xl"
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    customer: { ...prev.customer, email: event.target.value },
                  }))
                }
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              disabled={saving}
              className="w-full h-11 sm:h-10 rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Profile"
              )}
            </Button>
          </form>

          <div className="pt-3 border-t border-[#E5DDD5]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutDialogOpen(true)}
              className="w-full h-10 rounded-xl text-red-600 hover:text-red-700 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Keluar Akun (Logout)
            </Button>
          </div>
        </CardContent>
      </Card>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </div>
  )
}
