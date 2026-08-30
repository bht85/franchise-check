import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">
            FC-CHECK <span className="text-indigo-400">ADMIN</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg text-white">
            <LayoutDashboard size={20} className="text-indigo-400" />
            <span className="font-medium">대시보드</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors mt-8">
            <LogOut size={20} />
            <span className="font-medium">사용자 모드로 돌아가기</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between md:hidden">
          <h1 className="text-lg font-bold">FC-CHECK ADMIN</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 underline">나가기</Link>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
