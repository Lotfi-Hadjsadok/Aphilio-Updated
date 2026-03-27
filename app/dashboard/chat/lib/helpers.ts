import type { ConversationSummary } from "@/types/chat";

const MILLIS_PER_DAY = 86_400_000;

export function groupConversations(conversations: ConversationSummary[]) {
  const now = Date.now();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  const groups: { label: string; items: ConversationSummary[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Older", items: [] },
  ];

  for (const conversation of conversations) {
    const time = new Date(conversation.updatedAt).getTime();
    if (time >= todayStart) groups[0]!.items.push(conversation);
    else if (time >= todayStart - MILLIS_PER_DAY) groups[1]!.items.push(conversation);
    else if (now - time < 7 * MILLIS_PER_DAY) groups[2]!.items.push(conversation);
    else groups[3]!.items.push(conversation);
  }

  return groups.filter((group) => group.items.length > 0);
}

export function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const image = new window.Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
