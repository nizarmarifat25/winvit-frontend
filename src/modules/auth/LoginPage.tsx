import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { loginApi, getMeApi } from "@/lib/api"
import { useWinvit } from "@/context/WinvitContext"
import { DEFAULT_INVITATION } from "@/data/themes"

export default function LoginPage() {
  const navigate = useNavigate()
  const { setInvitation } = useWinvit()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const authRes = await loginApi(email.trim(), password)

      let role = authRes.user?.role || authRes.claims?.role || "user"

      if (authRes.user) {
        setInvitation({
          ...DEFAULT_INVITATION,
          customer: {
            ...DEFAULT_INVITATION.customer,
            userId: authRes.user.id,
            orderName: authRes.user.name || "",
            email: authRes.user.email || email.trim(),
          },
        })
      } else {
        try {
          const me = await getMeApi()
          if (me) {
            if (me.role) role = me.role
            setInvitation({
              ...DEFAULT_INVITATION,
              customer: {
                ...DEFAULT_INVITATION.customer,
                userId: me.id || authRes.claims?.uid,
                orderName: me.name || "",
                email: me.email || email.trim(),
              },
            })
          }
        } catch {
          // Fallback to JWT claims if /users/me fails
        }
      }

      if (role === "admin") {
        navigate("/admin")
      } else {
        navigate("/customer")
      }
    } catch (err: any) {
      setError(err?.message || "")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF6F1] text-[#2C2018] flex flex-col justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B5B4E] hover:text-[#2C2018]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="rounded-3xl border border-[#E5DDD5] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1.5">
            <Link to="/" className="font-serif text-2xl font-bold text-[#2C2018]">
              In<span className="text-[#C89B57]">vitaa</span>
            </Link>
            <h1 className="text-xl font-bold">Masuk ke Akun Anda</h1>
            <p className="text-xs text-[#6B5B4E]">
              Kelola detail undangan digital Anda di dashboard Invitaa
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs text-[#6B5B4E]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                className={`mt-1 h-11 rounded-xl ${
                  error ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs text-[#6B5B4E]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError("")
                }}
                className={`mt-1 h-11 rounded-xl ${
                  error ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="gold"
              disabled={loading}
              className="w-full h-11 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
