import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-node";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/sse";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "all") where.status = status;
  if (priority && priority !== "all") where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, status, priority, dueDate, tags } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: JSON.stringify(tags || []),
        userId: session.user.id,
      },
    });

    broadcast({ type: "TASK_CREATED", task });

    // Instantly send an email if the task is not done
    if (task.status !== "done" && session.user.email) {
      let timeHtml = "<p>Good luck completing this task!</p>";
      
      if (task.dueDate) {
        const now = new Date();
        const due = new Date(task.dueDate);
        const diffMs = due.getTime() - now.getTime();
        
        if (diffMs > 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          let timeLeftText = "";
          if (diffHours > 24) timeLeftText = `${Math.floor(diffHours / 24)} days and ${diffHours % 24} hours`;
          else if (diffHours > 0) timeLeftText = `${diffHours} hours and ${diffMinutes} minutes`;
          else timeLeftText = `${diffMinutes} minutes`;
          
          timeHtml = `<p style="margin: 0;">You have exactly <strong>${timeLeftText}</strong> to complete this task! Good luck!</p>`;
        }
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Don't await it so we don't block the API response
      transporter.sendMail({
        from: `"TaskFlow Pro" <${process.env.EMAIL_USER}>`,
        to: session.user.email,
        subject: `🎯 New Task: "${task.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <h2 style="color: #7c3aed;">New Task Assigned!</h2>
            <p>Hi ${session.user.name?.split(" ")[0] || "there"},</p>
            <p>You have just created a new task on your board:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px 0;">${task.title}</h3>
              ${timeHtml}
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
