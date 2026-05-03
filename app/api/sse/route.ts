import { addClient, removeClient } from "@/lib/sse";
import { auth } from "@/lib/auth-node";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = `${session.user.id}-${Date.now()}`;

  const stream = new ReadableStream({
    start(controller) {
      addClient(clientId, controller);
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);
    },
    cancel() {
      removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
