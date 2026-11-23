import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  align?: "left" | "center" | "right"
  headerClassName?: string
  cellClassName?: string
  render: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T, index: number) => string | number
  loading?: boolean
  loadingText?: string
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  loadingText = "Memuat data...",
  emptyIcon,
  emptyTitle = "Belum ada data",
  emptyDescription,
}: DataTableProps<T>) {
  const alignClass = (align?: "left" | "center" | "right") => {
    if (align === "right") return "text-right"
    if (align === "center") return "text-center"
    return "text-left"
  }

  return (
    <Card className="rounded-2xl border-[#E5DDD5] overflow-hidden shadow-2xs">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-10 text-center text-sm text-[#6B5B4E] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#C89B57]" />
            <span>{loadingText}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            {emptyIcon && (
              <div className="w-11 h-11 rounded-2xl bg-[#FAF6F1] border border-[#E5DDD5] text-[#A8763E] mx-auto grid place-items-center">
                {emptyIcon}
              </div>
            )}
            <p className="text-sm font-semibold text-[#2C2018]">{emptyTitle}</p>
            {emptyDescription && (
              <p className="text-xs text-[#6B5B4E]">{emptyDescription}</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF6F1] border-b border-[#E5DDD5] text-[11px] uppercase tracking-wider text-[#6B5B4E]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "py-3 px-4 font-semibold whitespace-nowrap",
                        alignClass(col.align),
                        col.headerClassName
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DF]">
                {data.map((row, idx) => (
                  <tr
                    key={getRowKey(row, idx)}
                    className="hover:bg-[#FAF6F1]/75 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "py-3.5 px-4 align-middle",
                          alignClass(col.align),
                          col.cellClassName
                        )}
                      >
                        {col.render(row, idx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
