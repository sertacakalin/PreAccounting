import { Outlet } from 'react-router-dom'
import { CustomerSidebar } from './CustomerSidebar'
import { AIAssistant } from './AIAssistant'

export function CustomerLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CustomerSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  )
}
