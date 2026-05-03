"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import confetti from "canvas-confetti";

type Task = { id:string;title:string;description?:string;status:string;priority:string;dueDate?:string;tags:string;createdAt:string; };
type View = "kanban"|"list";

const COLUMNS = [
  { id:"todo", label:"To Do", color:"#94a3b8", dot:"○" },
  { id:"inprogress", label:"In Progress", color:"#06b6d4", dot:"◑" },
  { id:"done", label:"Done", color:"#10b981", dot:"●" },
];

function TasksContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("kanban");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task|null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterPriority !== "all") params.set("priority", filterPriority);
    if (search) params.set("search", search);
    const r = await fetch(`/api/tasks?${params}`);
    const d = await r.json();
    setTasks(Array.isArray(d) ? d : []);
    setLoading(false);
  }, [filterStatus, filterPriority, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTasks(); }, [loadTasks]);

  // SSE
  useEffect(() => {
    const es = new EventSource("/api/sse");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "TASK_CREATED") setTasks(p => [data.task,...p]);
      if (data.type === "TASK_UPDATED") setTasks(p => p.map(t=>t.id===data.task.id?data.task:t));
      if (data.type === "TASK_DELETED") setTasks(p => p.filter(t=>t.id!==data.taskId));
    };
    return () => es.close();
  }, []);

  function handleSaved(task: Task) {
    setTasks(p=>{
      const exists=p.find(t=>t.id===task.id);
      return exists ? p.map(t=>t.id===task.id?task:t) : [task,...p];
    });
  }

  function handleCompleteFast(task: Task) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#06b6d4', '#7c3aed'] });
    setTasks(p => p.map(t => t.id === task.id ? task : t));
  }

  const filteredTasks = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    
    // Celebration!
    if (newStatus === "done") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#06b6d4', '#7c3aed'] });
    }

    // Optimistic update
    setTasks(p => p.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

    // Persist
    await fetch(`/api/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
  };

  return (
    <div style={{padding:"28px 28px 60px",maxWidth:1300}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>All Tasks</h1>
          <p style={{color:"var(--text2)",fontSize:13}}>{filteredTasks.length} task{filteredTasks.length!==1?"s":""} found</p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          {/* View toggle */}
          <div style={{display:"flex",background:"var(--card2)",borderRadius:"var(--radius-sm)",padding:3,border:"1px solid var(--border)"}}>
            {(["kanban","list"] as View[]).map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"6px 14px",borderRadius:6,border:"none",background:view===v?"var(--primary)":"transparent",color:view===v?"#fff":"var(--text2)",cursor:"pointer",fontWeight:500,fontSize:13,transition:"all .15s"}}>
                {v==="kanban"?"⊞ Board":"≡ List"}
              </button>
            ))}
          </div>
          <button id="add-task-btn" onClick={()=>{setEditTask(null);setShowModal(true);}} className="btn btn-primary">+ New Task</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <input id="search-input" className="input" placeholder="🔍  Search tasks…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:14}}/>
        </div>
        <select id="filter-status" className="input" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:"auto",minWidth:130}}>
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select id="filter-priority" className="input" value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} style={{width:"auto",minWidth:140}}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:80}}><div className="spinner" style={{margin:"0 auto",width:36,height:36}}/></div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:56,marginBottom:16}}>🔍</div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task</p>
          <button onClick={()=>setShowModal(true)} className="btn btn-primary" style={{marginTop:20}}>+ Create Task</button>
        </div>
      ) : view === "kanban" ? (
        /* Kanban Board */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban">
            {COLUMNS.map(col=>{
              const colTasks = filteredTasks.filter(t=>t.status===col.id);
              return (
                <div key={col.id} className="kanban-col">
                  <div className="kanban-col-header">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:col.color,fontSize:16}}>{col.dot}</span>
                      <span style={{fontWeight:700,fontSize:14}}>{col.label}</span>
                      <span style={{background:"var(--card2)",color:"var(--text2)",borderRadius:99,padding:"1px 8px",fontSize:12,fontWeight:600}}>{colTasks.length}</span>
                    </div>
                    <button onClick={()=>{setEditTask(null);setShowModal(true);}} style={{background:"transparent",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:18,lineHeight:1}} title="Add task">+</button>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div className="task-list" ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: "150px", background: snapshot.isDraggingOver ? "rgba(255,255,255,0.03)" : "transparent", borderRadius: 8, transition: "background 0.2s" }}>
                        {colTasks.length===0 && !snapshot.isDraggingOver ? (
                          <div style={{textAlign:"center",padding:"32px 12px",color:"var(--text3)",fontSize:13,border:"1px dashed var(--border)",borderRadius:"var(--radius-sm)"}}>
                            No tasks here
                          </div>
                        ) : colTasks.map((t, index)=>(
                          <Draggable key={t.id} draggableId={t.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}>
                                <TaskCard task={t} onEdit={t=>{setEditTask(t);setShowModal(true);}} onDelete={id=>setTasks(p=>p.filter(x=>x.id!==id))} onComplete={handleCompleteFast}/>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        /* List View */
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filteredTasks.map(t=>(
            <div key={t.id} className="card" style={{display:"flex",alignItems:"center",gap:16,padding:"14px 18px",cursor:"pointer",transition:"all .2s",borderLeft:`3px solid ${t.priority==="urgent"||t.priority==="high"?"var(--danger)":t.priority==="medium"?"var(--warning)":"var(--success)"}`}}
              onClick={()=>{setEditTask(t);setShowModal(true);}}
              onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="var(--primary)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="";}}
            >
              <div style={{flex:1,overflow:"hidden"}}>
                <h3 style={{fontWeight:600,fontSize:14,marginBottom:3,textDecoration:t.status==="done"?"line-through":"none",color:t.status==="done"?"var(--text3)":"var(--text)"}}>{t.title}</h3>
                {t.description && <p style={{color:"var(--text3)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</p>}
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                <span className={`badge badge-${t.status}`}>{t.status==="inprogress"?"In Progress":t.status==="todo"?"To Do":"Done"}</span>
                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                {t.dueDate && <span style={{fontSize:12,color:"var(--text3)"}}>{new Date(t.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <TaskModal task={editTask} onClose={()=>setShowModal(false)} onSaved={handleSaved}/>}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div style={{padding:80,textAlign:"center"}}><div className="spinner" style={{margin:"0 auto",width:36,height:36}}/></div>}>
      <TasksContent />
    </Suspense>
  );
}
