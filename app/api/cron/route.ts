import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    // Basic security for the cron route (in production, use a secure secret token)
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Find tasks that are due within 24 hours, not done, and no reminder sent
    const upcomingTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lte: tomorrow,
          gt: now, // Must be in the future
        },
        status: { not: "done" },
        reminderSent: false,
      },
      include: {
        user: true,
      },
    });

    if (upcomingTasks.length === 0) {
      return NextResponse.json({ message: "No reminders to send" });
    }

    // Configure Nodemailer
    // You MUST set EMAIL_USER and EMAIL_PASS in your .env file
    // For Gmail, EMAIL_PASS should be a 16-character App Password, not your regular password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const sentEmails = [];

    for (const task of upcomingTasks) {
      if (!task.user || !task.user.email) continue;

      try {
        await transporter.sendMail({
          from: `"TaskFlow Pro" <${process.env.EMAIL_USER}>`,
          to: task.user.email,
          subject: `⏰ Reminder: Task "${task.title}" is due soon!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; color: #111827;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
                <h2 style="margin: 0; color: #7c3aed;">TaskFlow Pro Reminder</h2>
              </div>
              <p style="font-size: 16px;">Hi ${task.user.name?.split(" ")[0] || "there"},</p>
              <p style="font-size: 16px;">This is a friendly reminder that your task is approaching its deadline:</p>
              
              <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px;">${task.title}</h3>
                ${task.description ? `<p style="margin: 0 0 12px 0; color: #4b5563;">${task.description}</p>` : ""}
                <p style="margin: 0; font-weight: 600; color: #06b6d4;">Due Date: ${task.dueDate?.toLocaleString()}</p>
                <p style="margin: 8px 0 0 0; font-weight: 600;">Priority: <span style="text-transform: uppercase;">${task.priority}</span></p>
              </div>

              <p style="font-size: 16px;">Make sure to jump into TaskFlow Pro and move it to the <strong>Done</strong> column once you finish it!</p>
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="http://localhost:3000/dashboard" style="background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
              </div>
            </div>
          `,
        });

        // Mark as sent
        await prisma.task.update({
          where: { id: task.id },
          data: { reminderSent: true },
        });

        sentEmails.push({ taskId: task.id, email: task.user.email });
      } catch (err) {
        console.error(`Failed to send email for task ${task.id}:`, err);
      }
    }

    return NextResponse.json({ message: `Sent ${sentEmails.length} reminders`, details: sentEmails });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
