"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TaskModal from "@/components/TaskModal";
import TaskCard from "@/components/TaskCard";

type Task = { id:string;title:string;description?:string;status:string;priority:string;dueDate?:string;tags:string;createdAt:string; };

function StatCard({ label, value, color, icon }: { label:string;value:number;color:string;icon:string }) {
  return (
    <div className="stat-card">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontSize:24}}>{icon}</div>
        <div style={{width:36,height:36,borderRadius:"50%",background:`${color}20`,display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:14}}>{value}</div>
      </div>
      <div style={{fontSize:28,fontWeight:800,marginBottom:4}}>{value}</div>
      <div style={{color:"var(--text2)",fontSize:13,fontWeight:500}}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task|null>(null);

  useEffect(() => {
    fetch("/api/tasks").then(r=>r.json()).then(d=>{ setTasks(Array.isArray(d)?d:[]); setLoading(false); });
  }, []);

  // SSE real-time
  useEffect(() => {
    const es = new EventSource("/api/sse");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "TASK_CREATED") setTasks(p => [data.task, ...p]);
      if (data.type === "TASK_UPDATED") setTasks(p => p.map(t => t.id === data.task.id ? data.task : t));
      if (data.type === "TASK_DELETED") setTasks(p => p.filter(t => t.id !== data.taskId));
    };
    return () => es.close();
  }, []);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t=>t.status==="todo").length,
    inprogress: tasks.filter(t=>t.status==="inprogress").length,
    done: tasks.filter(t=>t.status==="done").length,
  };
  const completionRate = stats.total > 0 ? Math.round((stats.done/stats.total)*100) : 0;
  const recent = tasks.slice(0,6);

  function handleSaved(task: Task) {
    setTasks(p => {
      const exists = p.find(t=>t.id===task.id);
      return exists ? p.map(t=>t.id===task.id?task:t) : [task,...p];
    });
  }

  return (
    <div style={{padding:"28px 28px 40px",maxWidth:1200}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>
            Good {new Date().getHours()<12?"morning":"afternoon"}, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{color:"var(--text2)",fontSize:14}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        <button id="new-task-btn" onClick={()=>{setEditTask(null);setShowModal(true);}} className="btn btn-primary">
          + New Task
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{marginBottom:28}}>
        <StatCard label="Total Tasks" value={stats.total} color="#8b5cf6" icon="📋"/>
        <StatCard label="To Do" value={stats.todo} color="#94a3b8" icon="○"/>
        <StatCard label="In Progress" value={stats.inprogress} color="#06b6d4" icon="◑"/>
        <StatCard label="Completed" value={stats.done} color="#10b981" icon="✓"/>
      </div>

      {/* Progress */}
      <div className="card" style={{marginBottom:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <h2 style={{fontWeight:700,fontSize:15,marginBottom:2}}>Overall Progress</h2>
            <p style={{color:"var(--text2)",fontSize:13}}>{stats.done} of {stats.total} tasks completed</p>
          </div>
          <div style={{fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#8b5cf6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{completionRate}%</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width:`${completionRate}%`}}/>
        </div>
      </div>

      {/* Recent tasks */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h2 style={{fontWeight:700,fontSize:18}}>Recent Tasks</h2>
        <a href="/tasks" style={{color:"var(--primary-light)",fontSize:13,fontWeight:500,textDecoration:"none"}}>View all →</a>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:60}}><div className="spinner" style={{margin:"0 auto",width:32,height:32}}/></div>
      ) : recent.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:48,marginBottom:16}}>📭</div>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started</p>
          <button onClick={()=>setShowModal(true)} className="btn btn-primary" style={{marginTop:20}}>+ Create Task</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
          {recent.map(t=>(
            <TaskCard key={t.id} task={t} onEdit={t=>{setEditTask(t);setShowModal(true);}} onDelete={id=>setTasks(p=>p.filter(x=>x.id!==id))}/>
          ))}
        </div>
      )}

      {showModal && <TaskModal task={editTask} onClose={()=>setShowModal(false)} onSaved={handleSaved}/>}
    </div>
  );
}
