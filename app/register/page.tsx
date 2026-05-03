"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.08),transparent)",bottom:-100,right:-100,pointerEvents:"none"}}/>
      <div className="glass" style={{width:"100%",maxWidth:420,borderRadius:"var(--radius)",padding:"40px 36px",animation:"scaleIn .3s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🚀</div>
          </div>
          <h1 style={{fontSize:26,fontWeight:800,marginBottom:6}}>Create account</h1>
          <p style={{color:"var(--text2)",fontSize:14}}>Start managing tasks like a pro</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label className="label">Full Name</label>
            <input id="name" className="input" type="text" placeholder="John Doe" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          </div>
          <div>
            <label className="label">Email</label>
            <input id="reg-email" className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div>
            <label className="label">Password</label>
            <input id="reg-password" className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          </div>
          {error && <p style={{color:"var(--danger)",fontSize:13,background:"rgba(239,68,68,0.08)",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,0.15)"}}>{error}</p>}
          <button id="register-btn" type="submit" className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}}/> Creating…</> : "Create account →"}
          </button>
        </form>
        <p style={{textAlign:"center",marginTop:24,color:"var(--text2)",fontSize:14}}>
          Already have an account?{" "}
          <Link href="/login" style={{color:"var(--primary-light)",fontWeight:600}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
