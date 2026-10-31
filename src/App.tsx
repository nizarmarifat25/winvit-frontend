import { BrowserRouter, Routes, Route } from "react-router-dom"
import { WinvitProvider } from "@/context/WinvitContext"
import LandingPage from "@/modules/landing/LandingPage"
import RegistrationPage from "@/modules/landing/RegistrationPage"
import { CustomerDashboard } from "@/modules/customer/CustomerDashboard"
import { AdminDashboard } from "@/modules/admin/AdminDashboard"
import InvitationRenderer from "@/modules/renderer/InvitationRenderer"

export function App() {
  return (
    <WinvitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/daftar" element={<RegistrationPage />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/u/:slug" element={<InvitationRenderer />} />
        </Routes>
      </BrowserRouter>
    </WinvitProvider>
  )
}

export default App
