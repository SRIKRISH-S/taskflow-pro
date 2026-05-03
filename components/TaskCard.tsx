"use client";
import { toast } from "./Toast";

type Task = {
  id: string; title: string; description?: string; status: string;
  priority: string; dueDate?: string; tags: string; createdAt: string;
};

const priorityLabels: Record<string, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
const statusLabels: Record<string, string> = { todo: "To Do", inprogress: "In Progress", done: "Done" };

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function isDueSoon(dueDate?: string) {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 24;
}

function getTimeLeft(dueDate?: string) {
  if (!dueDate) return "";
  const diffHours = (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (diffHours < 0) return "";
  if (diffHours < 1) return "< 1 hr left";
  return `${Math.floor(diffHours)} hrs left`;
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }: { task: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void; onComplete?: (t: Task) => void }) {
  const tags: string[] = JSON.parse(task.tags || "[]");
  const overdue = isOverdue(task.dueDate) && task.status !== "done";
  const dueSoon = isDueSoon(task.dueDate) && task.status !== "done";

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (res.ok) { onDelete(task.id); toast("Task deleted", "success"); }
    else toast("Failed to delete", "error");
  }

  async function handleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" })
    });
    if (res.ok) {
      if (onComplete) onComplete({ ...task, status: "done" });
      toast("Task completed! 🎉", "success");
    } else toast("Failed to complete task", "error");
  }

  return (
    <div className={`task-card priority-${task.priority} fade-in`} onClick={() => onEdit(task)}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10}}>
        <h3 style={{fontWeight:600,fontSize:14,lineHeight:1.4,flex:1,textDecoration:task.status==="done"?"line-through":"none",color:task.status==="done"?"var(--text3)":"var(--text)"}}>{task.title}</h3>
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          {task.status !== "done" && (
            <button onClick={handleComplete} className="btn btn-icon" style={{background:"transparent",color:"var(--success)",padding:4,fontSize:14}} title="Mark as Done">✓</button>
          )}
          <button onClick={handleDelete} className="btn btn-icon" style={{background:"transparent",color:"var(--text3)",padding:4,fontSize:12}} title="Delete">✕</button>
        </div>
      </div>

      {task.description && <p style={{color:"var(--text2)",fontSize:13,lineHeight:1.5,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{task.description}</p>}

      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        <span className={`badge badge-${task.status}`}>{statusLabels[task.status] || task.status}</span>
        <span className={`badge badge-${task.priority}`}>{priorityLabels[task.priority] || task.priority}</span>
      </div>

      {tags.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
          {tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
        </div>
      )}

      {task.dueDate && (
        <div style={{fontSize:12,color:overdue?"var(--danger)":dueSoon?"#f59e0b":"var(--text3)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:4,marginTop:6}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span>{overdue ? "⚠" : dueSoon ? "⏰" : "📅"}</span>
            <span>{overdue ? "Overdue · " : ""}{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          {dueSoon && (
            <span className="due-soon-badge" style={{background:"#fef3c7",color:"#d97706",padding:"2px 6px",borderRadius:4,fontWeight:700,fontSize:11,animation:"pulse 2s infinite"}}>
              {getTimeLeft(task.dueDate)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
