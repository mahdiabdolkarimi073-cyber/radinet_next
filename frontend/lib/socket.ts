export type SupportSocketEvents = {
  newMessage: (message: unknown) => void;
  chatClosed: (payload: unknown) => void;
  typing: (payload: unknown) => void;
};

export function createSupportSocket(): null {
  return null;
}
