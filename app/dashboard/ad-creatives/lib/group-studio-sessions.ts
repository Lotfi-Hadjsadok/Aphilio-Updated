import type { AdStudioSessionListItem } from "@/app/actions/ad-creative-studio-sessions";

const MILLIS_PER_DAY = 86_400_000;

export type StudioSessionGroupLabels = {
  today: string;
  yesterday: string;
  thisWeek: string;
  older: string;
};

export function groupStudioSessionsByRecency(
  sessions: AdStudioSessionListItem[],
  groupLabels: StudioSessionGroupLabels,
) {
  const now = Date.now();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  const groups: { label: string; items: AdStudioSessionListItem[] }[] = [
    { label: groupLabels.today, items: [] },
    { label: groupLabels.yesterday, items: [] },
    { label: groupLabels.thisWeek, items: [] },
    { label: groupLabels.older, items: [] },
  ];

  for (const sessionItem of sessions) {
    const time = new Date(sessionItem.updatedAt).getTime();
    if (time >= todayStart) groups[0]!.items.push(sessionItem);
    else if (time >= todayStart - MILLIS_PER_DAY) groups[1]!.items.push(sessionItem);
    else if (now - time < 7 * MILLIS_PER_DAY) groups[2]!.items.push(sessionItem);
    else groups[3]!.items.push(sessionItem);
  }

  return groups.filter((group) => group.items.length > 0);
}
