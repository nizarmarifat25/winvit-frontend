import { useState, useMemo } from "react"
import {
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Search,
  Shield,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createUserApi, updateUserApi } from "@/lib/api"

interface AdminUsersTabProps {
  usersList: any[]
  loadingUsers: boolean
  userSearch: string
  setUserSearch: (val: string) => void
  onSearchSubmit: () => void
  onRefresh: () => Promise<void>
}

function getInitials(name?: string) {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U"
}

function formatDate(iso?: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function AdminUsersTab({
  usersList,
  loadingUsers,
  userSearch,
  setUserSearch,
  onSearchSubmit,
  onRefresh,
}: AdminUsersTabProps) {
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  )

  // Modal Create / Edit State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formRole, setFormRole] = useState<"user" | "admin">("user")
  const [formIsActive, setFormIsActive] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [userError, setUserError] = useState("")
  const [userNotice, setUserNotice] = useState("")

  const stats = useMemo(() => {
    const active = usersList.filter((u) => Boolean(u.is_active ?? true)).length
    const admins = usersList.filter(
      (u) => String(u.role || "").toLowerCase() === "admin"
    ).length
    return {
      total: usersList.length,
      active,
      admins,
      customers: usersList.length - admins,
    }
  }, [usersList])

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    return usersList.filter((u) => {
      const role = String(u.role || "user").toLowerCase()
      const isAct = Boolean(u.is_active ?? true)
      const matchRole = roleFilter === "all" || role === roleFilter
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isAct) ||
        (statusFilter === "inactive" && !isAct)
      const matchQuery =
        !q ||
        String(u.name || "")
          .toLowerCase()
          .includes(q) ||
        String(u.email || "")
          .toLowerCase()
          .includes(q)
      return matchRole && matchStatus && matchQuery
    })
  }, [usersList, roleFilter, statusFilter, userSearch])

  const openCreateModal = () => {
    setEditingUserId(null)
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setShowPassword(false)
    setFormRole("user")
    setFormIsActive(true)
    setUserError("")
    setModalOpen(true)
  }

  const openEditModal = (u: any) => {
    setEditingUserId(u.id)
    setFormName(u.name || "")
    setFormEmail(u.email || "")
    setFormPassword("")
    setShowPassword(false)
    setFormRole(
      String(u.role || "user").toLowerCase() === "admin" ? "admin" : "user"
    )
    setFormIsActive(Boolean(u.is_active ?? true))
    setUserError("")
    setModalOpen(true)
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingUser(true)
    setUserError("")
    setUserNotice("")

    try {
      if (editingUserId) {
        await updateUserApi(editingUserId, {
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          is_active: formIsActive,
          ...(formPassword.trim() ? { password: formPassword } : {}),
        })
        setUserNotice(`Akun "${formName.trim()}" berhasil diperbarui.`)
      } else {
        await createUserApi({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
        })
        setUserNotice(`Akun "${formName.trim()}" berhasil dibuat.`)
      }

      setModalOpen(false)
      await onRefresh()
      window.setTimeout(() => setUserNotice(""), 3000)
    } catch (err: any) {
      setUserError(err?.message || "")
    } finally {
      setSavingUser(false)
    }
  }

  const handleToggleUserActive = async (u: any) => {
    setTogglingId(u.id)
    setUserError("")
    try {
      await updateUserApi(u.id, {
        name: u.name,
        email: u.email,
        role: u.role,
        is_active: !u.is_active,
      })
      await onRefresh()
    } catch (err: any) {
      setUserError(err?.message || "")
    } finally {
      setTogglingId(null)
    }
  }

  const userColumns: DataTableColumn<any>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => {
        const isAdmin = String(u.role || "").toLowerCase() === "admin"
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAdmin
                  ? "bg-[#2C2018] text-[#E5C27A]"
                  : "bg-[#FAF6F1] border border-[#E5DDD5] text-[#A8763E]"
                }`}
            >
              {getInitials(u.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#2C2018] truncate">
                {u.name || "-"}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "text-xs text-[#6B5B4E]",
      render: (u) => (
        <span className="inline-flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#A8763E]/70 shrink-0" />
          {u.email || "-"}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => {
        const isAdmin = String(u.role || "").toLowerCase() === "admin"
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isAdmin
                ? "bg-[#2C2018] text-[#E5C27A]"
                : "bg-[#FAF6F1] text-[#6B5B4E] border border-[#E5DDD5]"
              }`}
          >
            {isAdmin ? (
              <Shield className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            {isAdmin ? "Admin" : "Customer"}
          </span>
        )
      },
    },
    {
      key: "created_at",
      header: "Terdaftar",
      cellClassName: "text-xs text-[#6B5B4E] whitespace-nowrap",
      render: (u) => formatDate(u.created_at),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => {
        const isAct = Boolean(u.is_active ?? true)
        return (
          <div className="flex items-center gap-2">
            <Switch
              disabled={togglingId === u.id}
              checked={isAct}
              onCheckedChange={() => handleToggleUserActive(u)}
            />
            <span
              className={`text-xs font-medium ${isAct ? "text-emerald-700" : "text-[#8C7868]"
                }`}
            >
              {isAct ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        )
      },
    },
    {
      key: "action",
      header: "Aksi",
      align: "right",
      render: (u) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-xl px-3 text-xs gap-1.5 border-[#E5DDD5] hover:border-[#2C2018]"
          onClick={() => openEditModal(u)}
        >
          <Edit2 className="w-3.5 h-3.5 text-[#A8763E]" />
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div className="w-full space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#2C2018]">
            Kelola Users
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4E]">
            Kelola akun customer dan admin, ubah role, serta atur status aktif
            akun.
          </p>
        </div>
        <Button
          type="button"
          variant="gold"
          size="sm"
          className="h-10 rounded-xl px-4 gap-1.5 self-start sm:self-auto"
          onClick={openCreateModal}
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">Total Users</p>
          <p className="text-2xl font-bold text-[#2C2018] mt-0.5">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">Akun Aktif</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">
            {stats.active}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">Customer</p>
          <p className="text-2xl font-bold text-[#A8763E] mt-0.5">
            {stats.customers}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4">
          <p className="text-[11px] font-medium text-[#6B5B4E]">Admin</p>
          <p className="text-2xl font-bold text-[#2C2018] mt-0.5">
            {stats.admins}
          </p>
        </div>
      </div>

      {/* Notice / Error */}
      {userNotice && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{userNotice}</span>
        </div>
      )}
      {userError && !modalOpen && (
        <p className="text-xs font-medium text-red-600">{userError}</p>
      )}

      {/* Search + Role + Status Filter Toolbar */}
      <div className="bg-white border border-[#E5DDD5] rounded-2xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C7868] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
              placeholder="Cari nama atau email..."
              className="pl-9 h-9 text-xs rounded-xl bg-[#FAF6F1] border-[#E5DDD5]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs px-3 border-[#E5DDD5]"
            onClick={onSearchSubmit}
          >
            Cari
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F2ECE4] p-1 rounded-xl">
            {(
              [
                { id: "all", label: "Semua Role" },
                { id: "user", label: "Customer" },
                { id: "admin", label: "Admin" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${roleFilter === tab.id
                    ? "bg-white text-[#2C2018] shadow-2xs"
                    : "text-[#6B5B4E] hover:text-[#2C2018]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#F2ECE4] p-1 rounded-xl">
            {(
              [
                { id: "all", label: "Semua" },
                { id: "active", label: "Aktif" },
                { id: "inactive", label: "Nonaktif" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${statusFilter === tab.id
                    ? "bg-white text-[#2C2018] shadow-2xs"
                    : "text-[#6B5B4E] hover:text-[#2C2018]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unified Reusable DataTable */}
      <DataTable
        columns={userColumns}
        data={filteredUsers}
        getRowKey={(u) => u.id}
        loading={loadingUsers}
        loadingText="Memuat daftar user..."
        emptyIcon={<Users className="w-5 h-5" />}
        emptyTitle="Tidak ada user ditemukan"
        emptyDescription="Coba ubah filter atau tambah akun baru."
      />

      {/* Create / Edit User Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2C2018]">
              {editingUserId ? "Edit Akun User" : "Tambah User Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B5B4E]">
              {editingUserId
                ? "Perbarui informasi nama, email, role, atau status aktif akun."
                : "Buat akun customer atau admin baru untuk mengakses dashboard."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#6B5B4E] mb-1">
                Nama Lengkap
              </label>
              <Input
                required
                placeholder="Contoh: Budi Santoso"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value)
                  if (userError) setUserError("")
                }}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B5B4E] mb-1">
                Email
              </label>
              <Input
                required
                type="email"
                placeholder="budi@example.com"
                value={formEmail}
                onChange={(e) => {
                  setFormEmail(e.target.value)
                  if (userError) setUserError("")
                }}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B5B4E] mb-1">
                {editingUserId ? "Password Baru (Opsional)" : "Password"}
              </label>
              <div className="relative">
                <Input
                  required={!editingUserId}
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    editingUserId
                      ? "Kosongkan jika tidak mengubah password"
                      : "Minimal 6 karakter"
                  }
                  value={formPassword}
                  onChange={(e) => {
                    setFormPassword(e.target.value)
                    if (userError) setUserError("")
                  }}
                  className="h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7868] hover:text-[#2C2018] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B5B4E] mb-1.5">
                Role Akun
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    {
                      id: "user" as const,
                      title: "Customer",
                      desc: "Kelola undangan sendiri",
                      Icon: User,
                    },
                    {
                      id: "admin" as const,
                      title: "Admin",
                      desc: "Akses penuh backoffice",
                      Icon: Shield,
                    },
                  ] as const
                ).map(({ id, title, desc, Icon }) => {
                  const selected = formRole === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormRole(id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${selected
                          ? "border-[#2C2018] bg-[#FAF6F1] ring-1 ring-[#2C2018]"
                          : "border-[#E5DDD5] bg-white hover:border-[#C89B57]"
                        }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C2018]">
                        <Icon
                          className={`w-3.5 h-3.5 ${selected ? "text-[#A8763E]" : "text-[#8C7868]"
                            }`}
                        />
                        {title}
                      </div>
                      <p className="text-[10px] text-[#6B5B4E] mt-0.5">
                        {desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {editingUserId && (
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-[#E5DDD5] bg-[#FAF6F1]">
                <div>
                  <p className="text-xs font-semibold text-[#2C2018]">
                    Status Aktif Akun
                  </p>
                  <p className="text-[11px] text-[#6B5B4E]">
                    User nonaktif tidak dapat login ke dashboard
                  </p>
                </div>
                <Switch
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            )}

            {userError && (
              <p className="text-xs font-medium text-red-600">{userError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DDD5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={savingUser}
                className="h-10 rounded-xl px-5 gap-1.5"
              >
                {savingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingUserId ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah User"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
