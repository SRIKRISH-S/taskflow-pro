"use client";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "@/components/Toast";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="app-layout">
        <Sidebar/>
        <div className="main-content">{children}</div>
      </div>
      <ToastContainer/>
    </SessionProvider>
  );
}
