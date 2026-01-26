import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const userData = {
    id: user.id,
    email: user.email!,
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url,
    role: profile?.role,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={userData} />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
