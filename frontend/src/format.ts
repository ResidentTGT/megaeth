export const numberFormatter = new Intl.NumberFormat("en-US");

export const averageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const formatUpdatedAt = (value?: string) => {
  if (!value) return "-";

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "-";

  const date = new Date(timestamp);
  const now = new Date();
  const time = timeFormatter.format(date);

  if (isSameDay(date, now)) {
    return `Today ${time}`;
  }

  return `${dateFormatter.format(date)} ${time}`;
};
