// Server-Sent Events broadcaster — in-memory pub/sub for real-time updates
type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, SSEClient>();

export function addClient(id: string, controller: ReadableStreamDefaultController) {
  clients.set(id, { id, controller });
}

export function removeClient(id: string) {
  clients.delete(id);
}

export function broadcast(data: unknown) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.controller.enqueue(message);
    } catch {
      clients.delete(client.id);
    }
  });
}
