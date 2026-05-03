"use client";
import { useState, useEffect } from "react";
import { toast } from "./Toast";

type Task = {
  id: string; title: string; description?: string; status: string;
  priority: string; dueDate?: string; tags: string; createdAt: string;
};

type Props = {
  task?: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
};

const defaultForm = { title: "", description: "", status: "todo", priority: "medium", dueDate: "", tags: "" };

export default function TaskModal({ task, onClose, onSaved }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        tags: JSON.parse(task.tags || "[]").join(", "),
      });
    } else {
      setForm(defaultForm);
    }
  }, [task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast("Title is required", "error"); return; }
    setLoading(true);
    const body = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      dueDate: form.dueDate || null,
    };
    const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
    const method = task ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast(data.error || "Something went wrong", "error"); return; }
    toast(task ? "Task updated!" : "Task created! 🎉", "success");
    onSaved(data);
    onClose();
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontWeight:700,fontSize:18}}>{task ? "Edit Task" : "New Task"}</h2>
          <button id="close-modal-btn" onClick={onClose} className="btn btn-ghost btn-icon" style={{color:"var(--text2)"}}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label className="label">Title *</label>
            <input id="task-title" className="input" placeholder="What needs to be done?" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea id="task-desc" className="input" placeholder="Add details…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{resize:"vertical"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <label className="label">Status</label>
              <select id="task-status" className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select id="task-priority" className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input id="task-due" className="input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
          </div>
          <div>
            <label className="label">Tags <span style={{color:"var(--text3)",fontWeight:400}}>(comma separated)</span></label>
            <input id="task-tags" className="input" placeholder="design, backend, urgent" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:4}}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{width:14,height:14}}/> Saving…</> : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
