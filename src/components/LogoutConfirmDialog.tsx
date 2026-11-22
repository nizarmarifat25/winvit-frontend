import { LogOut } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6 rounded-3xl">
        <DialogHeader className="items-center text-center sm:items-start sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-1">
            <LogOut className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg">Konfirmasi Logout</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Yakin ingin keluar dari akun ini? Anda perlu login kembali untuk
            mengakses dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5"
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Ya, Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

