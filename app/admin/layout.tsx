"use client"

import { ReactNode } from "react"
import AdminRoute from "@/components/admin-router"
import AdminHeader from "@/components/admin/header"
import AdminSidebar from "@/components/admin/sidebar"
import AdminCenter from "@/components/admin/center"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <AdminHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main content */}
          <AdminCenter>
            {children}
          </AdminCenter>
        </div>
      </div>
    </AdminRoute>
  )
}
