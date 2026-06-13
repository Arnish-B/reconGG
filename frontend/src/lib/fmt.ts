export const fmt = {
  dateRange(s: string, e: string): string {
    const o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const ds = new Date(s + "T00:00:00").toLocaleDateString("en-US", o);
    const de = new Date(e + "T00:00:00").toLocaleDateString("en-US", o);
    return `${ds} – ${de}`;
  },
};
