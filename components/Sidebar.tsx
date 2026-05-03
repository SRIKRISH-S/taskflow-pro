"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/tasks", label: "All Tasks", icon: "✓" },
  { href: "/tasks?status=todo", label: "To Do", icon: "○" },
  { href: "/tasks?status=inprogress", label: "In Progress", icon: "◑" },
  { href: "/tasks?status=done", label: "Completed", icon: "●" },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,paddingLeft:8}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
        </div>
        <span style={{fontWeight:800,fontSize:17,background:"linear-gradient(135deg,#a78bfa,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>TaskFlow Pro</span>
      </div>

      {/* User */}
      {session?.user && (
        <div style={{background:"var(--card2)",borderRadius:"var(--radius-sm)",padding:"12px 14px",marginBottom:24,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>
            {session.user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{session.user.name}</div>
            <div style={{color:"var(--text3)",fontSize:11,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{session.user.email}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8,paddingLeft:8}}>Menu</div>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]) && !item.href.includes("?") );
          return (
            <Link key={item.href} href={item.href} onClick={onClose} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:"var(--radius-sm)",marginBottom:2,textDecoration:"none",fontWeight:500,fontSize:14,color:isActive?"#fff":"var(--text2)",background:isActive?"linear-gradient(135deg,rgba(124,58,237,0.3),rgba(139,92,246,0.15))":"transparent",borderLeft:isActive?"2px solid var(--primary)":"2px solid transparent",transition:"all .15s"}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <button id="signout-btn" onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center",marginTop:16}}>
        Sign Out
      </button>
    </aside>
  );
}
