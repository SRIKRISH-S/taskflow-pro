"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.12),transparent)",top:-100,left:-100,pointerEvents:"none"}}/>
      <div className="glass" style={{width:"100%",maxWidth:420,borderRadius:"var(--radius)",padding:"40px 36px",animation:"scaleIn .3s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            </div>
          </div>
          <h1 style={{fontSize:26,fontWeight:800,marginBottom:6}}>Welcome back</h1>
          <p style={{color:"var(--text2)",fontSize:14}}>Sign in to your TaskFlow Pro account</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label className="label">Email</label>
            <input id="email" className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div>
            <label className="label">Password</label>
            <input id="password" className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          </div>
          {error && <p style={{color:"var(--danger)",fontSize:13,background:"rgba(239,68,68,0.08)",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,0.15)"}}>{error}</p>}
          <button id="login-btn" type="submit" className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}}/> Signing in…</> : "Sign in →"}
          </button>
        </form>
        <p style={{textAlign:"center",marginTop:24,color:"var(--text2)",fontSize:14}}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{color:"var(--primary-light)",fontWeight:600}}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
