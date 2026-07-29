import { Ctx, Envelope } from './protocol';

/**
 * chrome.runtime.sendMessage rejects when no context happens to be listening -
 * routine during service-worker wake-up. Callers get `null` instead of an
 * unhandled rejection.
 */
export async function ask<T>(message: Envelope): Promise<T | null> {
  try {
    const reply = await chrome.runtime.sendMessage(message);
    return (reply ?? null) as T | null;
  } catch {
    return null;
  }
}

type Handler = (message: Envelope) => Promise<unknown>;

/**
 * Registers a listener that only answers envelopes addressed to `self`.
 * Returning `undefined` for foreign messages leaves the channel free for the
 * context that is actually meant to reply.
 */
export function listen(self: Ctx, handle: Handler): void {
  chrome.runtime.onMessage.addListener(
    (message: Envelope, _sender, respond) => {
      if (!message || message.to !== self) return undefined;
      handle(message).then(
        (result) => respond(result ?? null),
        (error) => {
          console.error(`[${self}] ${message.op} failed`, error);
          respond(null);
        }
      );
      return true; // keep the port open for the async respond above
    }
  );
}
