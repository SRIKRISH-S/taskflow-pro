"use client";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "@/components/Toast";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <SessionProvider>
      <div className="app-layout">
        {/* Mobile overlay */}
        {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:199,display:"none"}} className="mobile-overlay"/>}
        <div className={sidebarOpen ? "sidebar open" : ""} style={{display:"contents"}}>
          <Sidebar onClose={()=>setSidebarOpen(false)}/>
        </div>
        <div className="main-content">
          {/* Mobile header */}
          <div style={{display:"none",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid var(--border)",background:"var(--bg2)"}} className="mobile-header">
            <button id="menu-btn" onClick={()=>setSidebarOpen(!sidebarOpen)} className="btn btn-ghost btn-icon" style={{marginRight:12}}>☰</button>
            <span style={{fontWeight:700,fontSize:16}}>TaskFlow Pro</span>
          </div>
          {children}
        </div>
      </div>
      <ToastContainer/>
      <style>{`
        @media(max-width:768px){
          .mobile-header{display:flex!important;}
          .sidebar{position:fixed!important;left:-260px!important;z-index:200!important;transition:left .3s ease!important;height:100vh!important;}
          .sidebar.open{left:0!important;}
          .mobile-overlay{display:block!important;}
        }
      `}</style>
    </SessionProvider>
  );
}
