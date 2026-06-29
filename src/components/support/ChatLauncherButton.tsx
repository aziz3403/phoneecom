"use client";

import { useSupportChat } from "@/lib/support-chat-store";

/** Opens the global support chat. Used where a static "chat" CTA lived. */
export function ChatLauncherButton({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const setOpen = useSupportChat((s) => s.setOpen);
  return (
    <button type="button" className={className} style={style} onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}
