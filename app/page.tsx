"use client";
import Link from "next/link";

const features = [
  {icon:"⚡",title:"Real-time Updates",desc:"Changes appear instantly across all devices with live Server-Sent Events."},
  {icon:"🎯",title:"Kanban Boards",desc:"Visualize workflow with Todo, In Progress, and Done columns."},
  {icon:"🔐",title:"Secure Auth",desc:"JWT-based authentication with bcrypt password hashing."},
  {icon:"📊",title:"Smart Analytics",desc:"Track completion rates, priorities, and team progress at a glance."},
  {icon:"🏷️",title:"Tags & Filters",desc:"Organize tasks with custom tags and powerful filter options."},
  {icon:"📱",title:"Fully Responsive",desc:"Works beautifully on desktop, tablet, and mobile devices."},
];

export default function LandingPage() {
  return (
    <main style={{minHeight:"100vh",background:"var(--bg)",overflow:"hidden",position:"relative"}}>
      {/* Gradient blobs */}
      <div style={{position:"fixed",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%)",top:-200,left:-100,pointerEvents:"none"}}/>
      <div style={{position:"fixed",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)",bottom:-100,right:-50,pointerEvents:"none"}}/>

      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 40px",borderBottom:"1px solid var(--border)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:10,background:"rgba(8,11,20,0.8)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#g1)"/>
            <path d="M9 16l5 5 9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#06b6d4"/></linearGradient></defs>
          </svg>
          <span style={{fontWeight:800,fontSize:20,background:"linear-gradient(135deg,#a78bfa,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>TaskFlow Pro</span>
        </div>
        <div style={{display:"flex",gap:12}}>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      <section style={{textAlign:"center",padding:"100px 20px 60px",maxWidth:800,margin:"0 auto",animation:"fadeIn .6s ease"}}>
        <div className="badge badge-inprogress" style={{marginBottom:24,fontSize:12,display:"inline-flex"}}>✨ Real-time Task Management</div>
        <h1 style={{fontSize:"clamp(40px,8vw,72px)",fontWeight:800,lineHeight:1.1,marginBottom:24}}>
          Organize work,<br/>
          <span style={{background:"linear-gradient(135deg,#8b5cf6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ship faster.</span>
        </h1>
        <p style={{fontSize:18,color:"var(--text2)",marginBottom:40,maxWidth:520,margin:"0 auto 40px",lineHeight:1.7}}>
          A premium task manager with real-time collaboration, Kanban boards, priority tracking, and beautiful analytics — all in one place.
        </p>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <Link href="/register" className="btn btn-primary" style={{padding:"14px 32px",fontSize:16}}>Start for free →</Link>
          <Link href="/login" className="btn btn-ghost" style={{padding:"14px 32px",fontSize:16}}>Sign in</Link>
        </div>
      </section>

      <section style={{maxWidth:1100,margin:"0 auto",padding:"60px 20px 100px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
        {features.map((f)=>(
          <div key={f.title} className="card" style={{transition:"all .3s",cursor:"default"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)";(e.currentTarget as HTMLDivElement).style.borderColor="var(--border2)";}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="";(e.currentTarget as HTMLDivElement).style.borderColor=""}}>
            <div style={{fontSize:32,marginBottom:12}}>{f.icon}</div>
            <h3 style={{fontWeight:700,marginBottom:8}}>{f.title}</h3>
            <p style={{color:"var(--text2)",fontSize:14,lineHeight:1.6}}>{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
