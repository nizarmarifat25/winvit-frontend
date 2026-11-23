import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  CheckSquare,
  Palette,
  Wallet,
  Users,
  LogOut,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Receipt,
} from "lucide-react"
import { useWinvit } from "@/context/WinvitContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  getAccessToken,
  clearTokens,
  getOrdersApi,
  approvalOrderApi,
  getAdminThemesApi,
  getUsersApi,
} from "@/lib/api"
import { DEFAULT_INVITATION } from "@/data/themes"
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog"
import { AdminThemesTab } from "@/modules/admin/components/AdminThemesTab"
import { AdminUsersTab } from "@/modules/admin/components/AdminUsersTab"

type AdminTab = "approval" | "template" | "users" | "revenue"

export function AdminDashboard() {
  const navigate = useNavigate()
  const {
    themes,
    refreshPublicThemes,
    orders: localOrders,
    setInvitation,
  } = useWinvit()
  const [activeTab, setActiveTab] = useState<AdminTab>("approval")
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  // 1. ORDERS STATE
  const [backendOrders, setBackendOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("")
  const [orderError, setOrderError] = useState("")
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  )

  // 2. THEMES STATE
  const [adminThemes, setAdminThemes] = useState<any[]>([])
  const [loadingThemes, setLoadingThemes] = useState(false)

  // 3. USERS STATE
  const [usersList, setUsersList] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState("")

  const fetchOrders = async (statusOverride?: string) => {
    if (!getAccessToken()) return
    setLoadingOrders(true)
    setOrderError("")
    const activeStatus =
      statusOverride !== undefined ? statusOverride : orderStatusFilter
    try {
      const res = await getOrdersApi({
        page: 1,
        per_page: 25,
        search: orderSearch.trim() || undefined,
        status: activeStatus || undefined,
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

  const pendingOrdersCount = displayedOrders.filter((o) => {
    const st = String(o.status || "").toLowerCase()
    return st === "pending" || st === "waiting_approval"
  }).length

  const approvedOrdersList = displayedOrders.filter((o) => {
    const st = String(o.status || "").toLowerCase()
    return st === "approved" || st === "published"
  })

  const rejectedOrdersCount = displayedOrders.filter(
    (o) => String(o.status || "").toLowerCase() === "rejected"
  ).length

  const totalRevenue = approvedOrdersList.reduce((acc, o) => {
    const matched = resolveThemeById(o.theme_id || o.themeId)
    const priceVal =
      Number(
        o.price ||
          o.amount ||
          o.theme?.price ||
          matched?.price ||
          matched?.priceNumber
      ) || 198000
    return acc + priceVal
  }, 0)

  const orderColumns: DataTableColumn<any>[] = [
    {
      key: "id",
      header: "Order ID",
      cellClassName: "font-mono text-xs text-[#6B5B4E] max-w-[170px] truncate",
      render: (ord) => ord.order_number || ord.id,
    },
    {
      key: "customer",
      header: "Customer",
      render: (ord) => {
        const name = ord.customer_name || ord.orderName || "-"
        const initials =
          name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((p: string) => p[0] || "")
            .join("")
            .toUpperCase() || "C"
        return (
          <div className="flex items-center gap-3 min-w-[150px]">
            <div className="w-9 h-9 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-[#A8763E] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <span className="font-semibold text-[#2C2018] truncate">
              {name}
            </span>
          </div>
        )
      },
    },
    {
      key: "contact",
      header: "Kontak",
      cellClassName: "text-xs text-[#6B5B4E]",
      render: (ord) => (
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-[#A8763E]/70 shrink-0" />
            <span>{ord.whatsapp || ord.phone || "-"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#A8763E]/70 shrink-0" />
            <span className="truncate max-w-[200px]">{ord.email || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "theme",
      header: "Tema",
      render: (ord) => {
        const matchedTheme = resolveThemeById(ord.theme_id || ord.themeId)
        const themeLabel =
          ord.theme_name ||
          matchedTheme?.name ||
          matchedTheme?.title ||
          ord.themeTitle ||
          "-"
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-xs font-medium text-[#2C2018]">
            {themeLabel}
          </span>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (ord) => {
        const st = String(ord.status || "pending").toLowerCase()
        const isPending = st === "pending" || st === "waiting_approval"
        const isApproved = st === "approved" || st === "published"
        return (
          <Badge
            variant={
              isApproved ? "success" : isPending ? "warning" : "outline"
            }
          >
            {ord.status}
          </Badge>
        )
      },
    },
    {
      key: "action",
      header: "Aksi",
      align: "right",
      render: (ord) => {
        const st = String(ord.status || "pending").toLowerCase()
        const isPending = st === "pending" || st === "waiting_approval"
        if (!isPending) {
          return <span className="text-xs text-[#A89B8F]">Selesai</span>
        }
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="gold"
              className="h-8 rounded-xl px-3 text-xs"
              disabled={processingOrderId === ord.id}
              onClick={() => handleApprovalOrder(ord.id, "approved")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl px-3 text-xs border-[#E5DDD5]"
              disabled={processingOrderId === ord.id}
              onClick={() => handleApprovalOrder(ord.id, "rejected")}
            >
              Tolak
            </Button>
          </div>
        )
      },
    },
  ]

  const revenueColumns: DataTableColumn<any>[] = [
    {
      key: "id",
      header: "Order ID",
      cellClassName: "font-mono text-xs text-[#6B5B4E]",
      render: (o) => o.order_number || o.id,
    },
    {
      key: "customer",
      header: "Pemesan",
      cellClassName: "font-semibold text-[#2C2018]",
      render: (o) => o.customer_name || o.orderName || "-",
    },
    {
      key: "theme",
      header: "Tema",
      render: (o) => {
        const matchedTheme = resolveThemeById(o.theme_id || o.themeId)
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#E5DDD5] text-xs font-medium text-[#2C2018]">
            {matchedTheme?.name ||
              matchedTheme?.title ||
              o.theme?.name ||
              o.theme_name ||
              o.themeTitle ||
              "-"}
          </span>
        )
      },
    },
    {
      key: "amount",
      header: "Nominal",
      align: "right",
      cellClassName: "font-bold text-[#2C2018] whitespace-nowrap",
      render: (o) => {
        const matchedTheme = resolveThemeById(o.theme_id || o.themeId)
        const nom =
          Number(
            o.price ||
              o.amount ||
              o.theme?.price ||
              matchedTheme?.price ||
              matchedTheme?.priceNumber
          ) || 198000
        return `Rp ${nom.toLocaleString("id-ID")}`
      },
    },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F1] text-[#2C2018]">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E5DDD5] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-serif text-lg font-bold text-[#2C2018]">
            In<span className="text-[#C89B57]">vitaa</span>
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
              In<span className="text-[#C89B57]">vitaa</span>
            </Link>
            <p className="text-xs text-[#6B5B4E] mt-0.5">Admin Panel</p>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("approval")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === "approval"
                  ? "bg-[#2C2018] text-white"
                  : "text-[#6B5B4E] hover:bg-[#F2ECE4]"
              }`}
            >
              <span>Approval Order</span>
              {pendingOrdersCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#C89B57] text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
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
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
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
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
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
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left cursor-pointer"
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
          <div className="w-full space-y-5">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#2C2018]">
                  Approval Order
                </h1>
                <p className="text-xs sm:text-sm text-[#6B5B4E]">
                  Tinjau pesanan masuk dari calon pengantin dan aktivasi akun
                  undangan.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 gap-1.5 border-[#E5DDD5] bg-white self-start sm:self-auto"
                onClick={() => fetchOrders()}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#A8763E] ${
                    loadingOrders ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>

            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Total Order
                </p>
                <p className="text-2xl font-bold text-[#2C2018] mt-0.5">
                  {displayedOrders.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Menunggu Approval
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-0.5">
                  {pendingOrdersCount}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Disetujui
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                  {approvedOrdersList.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Ditolak
                </p>
                <p className="text-2xl font-bold text-[#8C7868] mt-0.5">
                  {rejectedOrdersCount}
                </p>
              </div>
            </div>

            {orderError && (
              <p className="text-xs font-medium text-red-600">{orderError}</p>
            )}

            {/* Unified Search + Status Pill Toolbar */}
            <div className="bg-white border border-[#E5DDD5] rounded-2xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8C7868] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                    placeholder="Cari nama, email, atau nomor order..."
                    className="pl-9 h-9 text-xs rounded-xl bg-[#FAF6F1] border-[#E5DDD5]"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl text-xs px-3 border-[#E5DDD5]"
                  onClick={() => fetchOrders()}
                >
                  Cari
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-[#F2ECE4] p-1 rounded-xl self-start lg:self-auto">
                {(
                  [
                    { id: "", label: "Semua" },
                    { id: "pending", label: "Pending" },
                    { id: "approved", label: "Approved" },
                    { id: "rejected", label: "Rejected" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id || "all"}
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter(tab.id)
                      fetchOrders(tab.id)
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      orderStatusFilter === tab.id
                        ? "bg-white text-[#2C2018] shadow-2xs"
                        : "text-[#6B5B4E] hover:text-[#2C2018]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unified Reusable DataTable */}
            <DataTable
              columns={orderColumns}
              data={displayedOrders}
              getRowKey={(ord) => ord.id}
              loading={loadingOrders}
              loadingText="Memuat daftar order..."
              emptyIcon={<Receipt className="w-5 h-5" />}
              emptyTitle="Belum ada pesanan ditemukan"
              emptyDescription="Pesanan customer yang masuk akan tampil di tabel ini."
            />
          </div>
        )}

        {/* TAB 2: KELOLA TEMA (POST / PATCH /api/v1/themes) */}
        {activeTab === "template" && (
          <AdminThemesTab
            adminThemes={adminThemes}
            loadingThemes={loadingThemes}
            onRefresh={async () => {
              await fetchAdminThemes()
              await refreshPublicThemes()
            }}
          />
        )}

        {/* TAB 3: KELOLA USER (GET / POST / PATCH /api/v1/users) */}
        {activeTab === "users" && (
          <AdminUsersTab
            usersList={usersList}
            loadingUsers={loadingUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            onSearchSubmit={fetchUsers}
            onRefresh={fetchUsers}
          />
        )}

        {/* TAB 4: PENDAPATAN */}
        {activeTab === "revenue" && (
          <div className="w-full space-y-5">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#2C2018]">
                Pendapatan
              </h1>
              <p className="text-xs sm:text-sm text-[#6B5B4E]">
                Ringkasan transaksi pesanan undangan yang sudah disetujui.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Total Pendapatan
                </p>
                <p className="text-2xl font-bold text-[#2C2018] mt-0.5">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Order Disetujui
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                  {approvedOrdersList.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
                <p className="text-[11px] font-medium text-[#6B5B4E]">
                  Total Tema
                </p>
                <p className="text-2xl font-bold text-[#A8763E] mt-0.5">
                  {adminThemes.length || themes.length}
                </p>
              </div>
            </div>

            <DataTable
              columns={revenueColumns}
              data={approvedOrdersList}
              getRowKey={(o) => o.id}
              loading={loadingOrders}
              loadingText="Memuat riwayat transaksi..."
              emptyIcon={<Wallet className="w-5 h-5" />}
              emptyTitle="Belum ada transaksi disetujui"
              emptyDescription="Order yang telah di-approve akan otomatis tercatat di sini."
            />
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom App Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur-lg border border-[#E5DDD5] shadow-[0_8px_30px_rgba(44,32,24,0.14)] rounded-2xl grid grid-cols-4 p-1.5">
          {[
            { id: "approval" as AdminTab, label: "Approval", Icon: CheckSquare },
            { id: "template" as AdminTab, label: "Tema", Icon: Palette },
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
