import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-node";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { title, description, status, priority, dueDate, tags } = body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description !== undefined ? description : existing.description,
        status: status ?? existing.status,
        priority: priority ?? existing.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
        tags: tags !== undefined ? JSON.stringify(tags) : existing.tags,
      },
    });

    broadcast({ type: "TASK_UPDATED", task });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  broadcast({ type: "TASK_DELETED", taskId: id });

  return NextResponse.json({ success: true });
}
