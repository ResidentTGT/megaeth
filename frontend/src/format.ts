export const numberFormatter = new Intl.NumberFormat("en-US");

export const averageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export const formatUpdatedAt = (value?: string) => {
  if (!value) return "-";

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(timestamp);
};
