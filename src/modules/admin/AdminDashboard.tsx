import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  CheckSquare,
  Upload,
  Wallet,
  Users,
  Loader2,
  LogOut,
  Search,
  Edit2,
} from "lucide-react"
import { useWinvit } from "@/context/WinvitContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  getAccessToken,
  clearTokens,
  getOrdersApi,
  approvalOrderApi,
  getAdminThemesApi,
  createThemeApi,
  updateThemeApi,
  getUsersApi,
  createUserApi,
  updateUserApi,
  uploadMediaFile,
} from "@/lib/api"
import { DEFAULT_INVITATION } from "@/data/themes"
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog"

type AdminTab = "approval" | "template" | "users" | "revenue"

export function AdminDashboard() {
  const navigate = useNavigate()
  const { themes, refreshPublicThemes, orders: localOrders, setInvitation } = useWinvit()
  const [activeTab, setActiveTab] = useState<AdminTab>("approval")
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  // 1. ORDERS STATE
  const [backendOrders, setBackendOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("")
  const [orderError, setOrderError] = useState("")
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)

  // 2. THEMES STATE
  const [adminThemes, setAdminThemes] = useState<any[]>([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [themeName, setThemeName] = useState("")
  const [themeTag, setThemeTag] = useState("tropical-boho")
  const [themePrice, setThemePrice] = useState("198000")
  const [themeThumbUrl, setThemeThumbUrl] = useState("")
  const [themeIsActive, setThemeIsActive] = useState(true)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [savingTheme, setSavingTheme] = useState(false)
  const [themeNotice, setThemeNotice] = useState("")
  const [themeError, setThemeError] = useState("")

  // 3. USERS STATE
  const [usersList, setUsersList] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user")
  const [savingUser, setSavingUser] = useState(false)
  const [userError, setUserError] = useState("")
  const [userNotice, setUserNotice] = useState("")

  const fetchOrders = async () => {
    if (!getAccessToken()) return
    setLoadingOrders(true)
    setOrderError("")
    try {
      const res = await getOrdersApi({
        page: 1,
        per_page: 25,
        search: orderSearch.trim() || undefined,
        status: orderStatusFilter || undefined,
      })
      const list = Array.isArray(res)
        ? res
        : res?.items || res?.orders || res?.data || []
      setBackendOrders(Array.isArray(list) ? list : [])
    } catch (err: any) {
      setOrderError(err?.message || "")
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchAdminThemes = async () => {
    if (!getAccessToken()) return
    setLoadingThemes(true)
    try {
      const res = await getAdminThemesApi({ page: 1, per_page: 50 })
      const list = Array.isArray(res)
        ? res
        : res?.items || res?.themes || res?.data || []
      setAdminThemes(Array.isArray(list) ? list : [])
    } catch {
      // ignore
    } finally {
      setLoadingThemes(false)
    }
  }

  const fetchUsers = async () => {
    if (!getAccessToken()) return
    setLoadingUsers(true)
    try {
      const res = await getUsersApi({
        page: 1,
        per_page: 25,
        search: userSearch.trim() || undefined,
      })
      const list = Array.isArray(res)
        ? res
        : res?.items || res?.users || res?.data || []
      setUsersList(Array.isArray(list) ? list : [])
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchAdminThemes()
    fetchUsers()
  }, [])

  const handleApprovalOrder = async (
    orderId: string,
    status: "approved" | "rejected"
  ) => {
    setProcessingOrderId(orderId)
    setOrderError("")
    try {
      await approvalOrderApi(orderId, { status, reason: "-" })
      await fetchOrders()
    } catch (err: any) {
      setOrderError(err?.message || "")
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    setThemeError("")
    try {
      const url = await uploadMediaFile(file)
      setThemeThumbUrl(url)
    } catch (err: any) {
      setThemeError(err?.message || "")
    } finally {
      setUploadingThumb(false)
    }
  }

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingTheme(true)
    setThemeError("")
    setThemeNotice("")

    try {
      const payload = {
        name: themeName.trim(),
        thumbnail_url: themeThumbUrl.trim() || "placeholder.png",
        price: Number(themePrice) || 198000,
        tag: themeTag.trim() || "tropical-boho",
        ...(editingThemeId ? { is_active: themeIsActive } : {}),
      }

      if (editingThemeId) {
        await updateThemeApi(editingThemeId, payload)
        setThemeNotice("Tema berhasil diperbarui.")
      } else {
        await createThemeApi(payload)
        setThemeNotice("Tema baru berhasil ditambahkan.")
      }

      setEditingThemeId(null)
      setThemeName("")
      setThemePrice("198000")
      setThemeThumbUrl("")
      setThemeIsActive(true)
      await fetchAdminThemes()
      await refreshPublicThemes()
    } catch (err: any) {
      setThemeError(err?.message || "")
    } finally {
      setSavingTheme(false)
    }
  }

  const handleToggleThemeActive = async (themeItem: any) => {
    try {
      await updateThemeApi(themeItem.id, {
        name: themeItem.name,
        thumbnail_url: themeItem.thumbnail_url || "placeholder.png",
        price: Number(themeItem.price) || 198000,
        tag: themeItem.tag || "tropical-boho",
        is_active: !themeItem.is_active,
      })
      await fetchAdminThemes()
      await refreshPublicThemes()
    } catch (err: any) {
      setThemeError(err?.message || "")
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingUser(true)
    setUserError("")
    setUserNotice("")
    try {
      await createUserApi({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
      })
      setNewUserName("")
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRole("user")
      setUserNotice("User berhasil dibuat.")
      await fetchUsers()
    } catch (err: any) {
      setUserError(err?.message || "")
    } finally {
      setSavingUser(false)
    }
  }

  const handleToggleUserActive = async (u: any) => {
    try {
      await updateUserApi(u.id, {
        name: u.name,
        email: u.email,
        role: u.role,
        is_active: !u.is_active,
      })
      await fetchUsers()
    } catch (err: any) {
      setUserError(err?.message || "")
    }
  }

  const handleLogout = () => {
    clearTokens()
    setInvitation(DEFAULT_INVITATION)
    navigate("/login")
  }

  // Merge backend orders with local fallback if backend is empty
  const displayedOrders =
    backendOrders.length > 0
      ? backendOrders
      : localOrders.map((lo) => ({
          id: lo.id,
          customer_name: lo.orderName,
          email: lo.email,
          whatsapp: lo.phone,
          theme_name: lo.themeTitle,
          price: lo.amount,
          status:
            lo.status === "APPROVED" || lo.status === "PUBLISHED"
              ? "approved"
              : lo.status === "REJECTED"
                ? "rejected"
                : "pending",
        }))

  const resolveThemeById = (themeId?: string) => {
    if (!themeId) return null
    return (
      adminThemes.find((t) => t.id === themeId) ||
      themes.find((t) => t.backendId === themeId || t.id === themeId) ||
      null
    )
  }

  const pendingOrdersCount = displayedOrders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "waiting_approval" ||
      o.status === "WAITING_APPROVAL"
  ).length

  const approvedOrdersList = displayedOrders.filter(
    (o) => o.status === "approved" || o.status === "APPROVED"
  )

  const totalRevenue = approvedOrdersList.reduce((acc, o) => {
    const matchedTheme = resolveThemeById(o.theme_id || o.themeId)
    const priceVal =
      Number(
        o.price ||
          o.amount ||
          o.theme?.price ||
          matchedTheme?.price ||
          matchedTheme?.priceNumber
      ) || 198000
    return acc + priceVal
  }, 0)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F1] text-[#2C2018]">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E5DDD5] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-serif text-lg font-bold text-[#2C2018]">
            Win<span className="text-[#C89B57]">vitaa</span>
          </Link>
          <span className="text-xs text-[#6B5B4E]">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs font-medium text-[#A8763E]">
            Katalog
          </Link>
          <button
            type="button"
            onClick={() => setLogoutDialogOpen(true)}
            className="text-xs font-medium text-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-[#E5DDD5] bg-white flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          <div>
            <Link to="/" className="font-serif text-xl font-bold text-[#2C2018]">
              Win<span className="text-[#C89B57]">vitaa</span>
            </Link>
            <p className="text-xs text-[#6B5B4E] mt-0.5">Admin Panel</p>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("approval")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "approval"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              <span>Approval Order</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#C89B57] text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "template"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              Kelola Tema
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "users"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              Kelola User
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("revenue")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "revenue"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              Pendapatan
            </button>
          </nav>
        </div>

        <div className="space-y-1.5 pt-4 border-t border-[#E5DDD5] text-xs">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-[#6B5B4E] hover:bg-[#F2ECE4]"
          >
            Kembali ke Katalog
          </Link>
          <button
            type="button"
            onClick={() => setLogoutDialogOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        {/* TAB 1: APPROVAL ORDER */}
        {activeTab === "approval" && (
          <div className="max-w-5xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Approval Order</h1>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6B5B4E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                    placeholder="Cari nama / email..."
                    className="pl-8 h-9 text-xs rounded-xl bg-white w-44 sm:w-56"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value)
                    setTimeout(fetchOrders, 0)
                  }}
                  className="h-9 rounded-xl border border-[#E5DDD5] bg-white px-2.5 text-xs"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchOrders}
                  className="h-9 rounded-xl text-xs"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {orderError && (
              <p className="text-xs font-medium text-red-600">{orderError}</p>
            )}

            <Card>
              <CardContent className="p-0">
                {loadingOrders ? (
                  <div className="p-8 text-center text-sm text-[#6B5B4E] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar order...
                  </div>
                ) : displayedOrders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#6B5B4E]">
                    Belum ada data pesanan customer.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5DDD5] text-xs text-[#6B5B4E]">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Nama Customer</th>
                          <th className="py-3 px-4">Kontak</th>
                          <th className="py-3 px-4">Tema</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DDD5]">
                        {displayedOrders.map((ord) => {
                          const st = String(ord.status || "pending").toLowerCase()
                          const isPending =
                            st === "pending" || st === "waiting_approval"
                          const isApproved =
                            st === "approved" || st === "published"
                          const matchedTheme = resolveThemeById(
                            ord.theme_id || ord.themeId
                          )
                          return (
                            <tr key={ord.id}>
                              <td className="py-3 px-4 font-mono text-xs max-w-[160px] truncate">
                                {ord.order_number || ord.id}
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {ord.customer_name || ord.orderName || "-"}
                              </td>
                              <td className="py-3 px-4 text-xs text-[#6B5B4E]">
                                <div>{ord.whatsapp || ord.phone || "-"}</div>
                                <div>{ord.email || "-"}</div>
                              </td>
                              <td className="py-3 px-4">
                                {matchedTheme?.name ||
                                  matchedTheme?.title ||
                                  ord.theme?.name ||
                                  ord.theme_name ||
                                  ord.themeTitle ||
                                  ord.theme_id ||
                                  "-"}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    isApproved
                                      ? "success"
                                      : isPending
                                        ? "warning"
                                        : "outline"
                                  }
                                >
                                  {ord.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isPending && (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="gold"
                                      disabled={processingOrderId === ord.id}
                                      onClick={() =>
                                        handleApprovalOrder(ord.id, "approved")
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={processingOrderId === ord.id}
                                      onClick={() =>
                                        handleApprovalOrder(ord.id, "rejected")
                                      }
                                    >
                                      Tolak
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: KELOLA TEMA (POST / PATCH /api/v1/themes) */}
        {activeTab === "template" && (
          <div className="max-w-5xl space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">Kelola Tema Undangan</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <Card className="lg:col-span-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {editingThemeId ? "Edit Tema" : "Tambah Tema Baru"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <form onSubmit={handleSaveTheme} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        Nama Tema (name)
                      </label>
                      <Input
                        required
                        placeholder="Contoh: Sage Green Botanical"
                        value={themeName}
                        onChange={(e) => {
                          setThemeName(e.target.value)
                          if (themeError) setThemeError("")
                        }}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">
                          Tag Kategori (tag)
                        </label>
                        <Input
                          required
                          placeholder="cth: tropical-boho"
                          value={themeTag}
                          onChange={(e) => setThemeTag(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#6B5B4E]">
                          Harga (price)
                        </label>
                        <Input
                          required
                          type="number"
                          placeholder="198000"
                          value={themePrice}
                          onChange={(e) => setThemePrice(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        Thumbnail Tema (thumbnail_url)
                      </label>
                      <div className="mt-1 space-y-2">
                        <Input
                          placeholder="URL gambar atau upload di bawah"
                          value={themeThumbUrl}
                          onChange={(e) => setThemeThumbUrl(e.target.value)}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingThumb}
                          onChange={handleThumbUpload}
                          className="block w-full text-xs text-[#6B5B4E] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#E5DDD5] file:text-xs file:font-medium file:bg-[#FAF6F1] file:text-[#2C2018]"
                        />
                      </div>
                    </div>

                    {editingThemeId && (
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#E5DDD5] bg-[#FAF6F1] text-xs">
                        <span>Status Aktif (is_active)</span>
                        <Switch
                          checked={themeIsActive}
                          onCheckedChange={setThemeIsActive}
                        />
                      </div>
                    )}

                    {themeError && (
                      <p className="text-xs font-medium text-red-600">
                        {themeError}
                      </p>
                    )}
                    {themeNotice && (
                      <p className="text-xs font-medium text-emerald-700">
                        {themeNotice}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {editingThemeId && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10"
                          onClick={() => {
                            setEditingThemeId(null)
                            setThemeName("")
                            setThemePrice("198000")
                            setThemeThumbUrl("")
                            setThemeIsActive(true)
                          }}
                        >
                          Batal
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="gold"
                        disabled={savingTheme || uploadingThumb}
                        className="flex-1 h-10"
                      >
                        {savingTheme ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : editingThemeId ? (
                          "Update Tema"
                        ) : (
                          "Simpan Tema"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-7">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Daftar Tema Server ({adminThemes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingThemes ? (
                    <div className="p-6 text-center text-xs text-[#6B5B4E]">
                      Memuat daftar tema...
                    </div>
                  ) : adminThemes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6B5B4E]">
                      Belum ada tema dari endpoint /api/v1/themes.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5DDD5] max-h-[460px] overflow-y-auto">
                      {adminThemes.map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {t.name}
                            </p>
                            <p className="text-[#6B5B4E]">
                              Tag: <span className="font-mono">{t.tag}</span> • Rp{" "}
                              {Number(t.price || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Switch
                              checked={Boolean(t.is_active ?? true)}
                              onCheckedChange={() => handleToggleThemeActive(t)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5"
                              onClick={() => {
                                setEditingThemeId(t.id)
                                setThemeName(t.name || "")
                                setThemeTag(t.tag || "tropical-boho")
                                setThemePrice(String(t.price || 198000))
                                setThemeThumbUrl(t.thumbnail_url || "")
                                setThemeIsActive(Boolean(t.is_active ?? true))
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA USER (GET / POST / PATCH /api/v1/users) */}
        {activeTab === "users" && (
          <div className="max-w-5xl space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">Kelola User</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <Card className="lg:col-span-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Buat User Baru</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <form onSubmit={handleCreateUser} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        Nama Lengkap
                      </label>
                      <Input
                        required
                        placeholder="John Doe"
                        value={newUserName}
                        onChange={(e) => {
                          setNewUserName(e.target.value)
                          if (userError) setUserError("")
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        Email
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="john.doe@example.com"
                        value={newUserEmail}
                        onChange={(e) => {
                          setNewUserEmail(e.target.value)
                          if (userError) setUserError("")
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        Password
                      </label>
                      <Input
                        required
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={newUserPassword}
                        onChange={(e) => {
                          setNewUserPassword(e.target.value)
                          if (userError) setUserError("")
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6B5B4E]">
                        Role
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) =>
                          setNewUserRole(e.target.value as "user" | "admin")
                        }
                        className="mt-1 flex h-10 w-full rounded-lg border border-[#E5DDD5] bg-white px-3 py-2 text-sm"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>

                    {userError && (
                      <p className="text-xs font-medium text-red-600">
                        {userError}
                      </p>
                    )}
                    {userNotice && (
                      <p className="text-xs font-medium text-emerald-700">
                        {userNotice}
                      </p>
                    )}

                    <Button
                      type="submit"
                      variant="gold"
                      disabled={savingUser}
                      className="w-full h-10"
                    >
                      {savingUser ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Tambah User"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-7">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">
                    Daftar User ({usersList.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                      placeholder="Cari user..."
                      className="h-8 text-xs w-36"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={fetchUsers}
                    >
                      Cari
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingUsers ? (
                    <div className="p-6 text-center text-xs text-[#6B5B4E]">
                      Memuat daftar user...
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6B5B4E]">
                      Belum ada data user.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5DDD5] max-h-[460px] overflow-y-auto">
                      {usersList.map((u) => (
                        <div
                          key={u.id}
                          className="p-3.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {u.name}
                            </p>
                            <p className="text-[#6B5B4E] truncate">
                              {u.email} •{" "}
                              <span className="uppercase font-semibold">
                                {u.role}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-[#6B5B4E]">
                              {u.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                            <Switch
                              checked={Boolean(u.is_active ?? true)}
                              onCheckedChange={() => handleToggleUserActive(u)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: PENDAPATAN */}
        {activeTab === "revenue" && (
          <div className="max-w-5xl space-y-5">
            <h1 className="text-lg sm:text-xl font-bold">Pendapatan</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-[#6B5B4E]">Total Pendapatan</p>
                  <p className="text-xl font-bold mt-1">
                    Rp {totalRevenue.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-[#6B5B4E]">Order Disetujui</p>
                  <p className="text-xl font-bold mt-1">
                    {approvedOrdersList.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-[#6B5B4E]">Total Tema</p>
                  <p className="text-xl font-bold mt-1">
                    {adminThemes.length || themes.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                {approvedOrdersList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#6B5B4E]">
                    Belum ada data transaksi yang disetujui.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5DDD5] text-xs text-[#6B5B4E]">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Pemesan</th>
                          <th className="py-3 px-4">Tema</th>
                          <th className="py-3 px-4 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DDD5]">
                        {approvedOrdersList.map((o) => {
                          const matchedTheme = resolveThemeById(
                            o.theme_id || o.themeId
                          )
                          const nom =
                            Number(
                              o.price ||
                                o.amount ||
                                o.theme?.price ||
                                matchedTheme?.price ||
                                matchedTheme?.priceNumber
                            ) || 198000
                          return (
                            <tr key={o.id}>
                              <td className="py-3 px-4 font-mono text-xs">
                                {o.order_number || o.id}
                              </td>
                              <td className="py-3 px-4">
                                {o.customer_name || o.orderName || "-"}
                              </td>
                              <td className="py-3 px-4">
                                {matchedTheme?.name ||
                                  matchedTheme?.title ||
                                  o.theme?.name ||
                                  o.theme_name ||
                                  o.themeTitle ||
                                  "-"}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">
                                Rp {nom.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom App Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur-lg border border-[#E5DDD5] shadow-[0_8px_30px_rgba(44,32,24,0.14)] rounded-2xl grid grid-cols-4 p-1.5">
          {[
            { id: "approval" as AdminTab, label: "Approval", Icon: CheckSquare },
            { id: "template" as AdminTab, label: "Tema", Icon: Upload },
            { id: "users" as AdminTab, label: "Users", Icon: Users },
            { id: "revenue" as AdminTab, label: "Pendapatan", Icon: Wallet },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95 ${
                  active
                    ? "bg-[#2C2018] text-white shadow-sm"
                    : "text-[#6B5B4E] hover:text-[#2C2018]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[#C89B57]" : "text-[#6B5B4E]"
                  }`}
                />
                <span className="text-[11px] font-medium leading-none">
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </div>
  )
}
