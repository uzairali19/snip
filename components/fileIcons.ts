export const fileIcons: Record<string, string> = {
  js: "📜",
  ts: "📘",
  jsx: "📄",
  tsx: "🧩",
  md: "📘",
  json: "🧾",
  folder: "📁",
  default: "📄",
};

export function getFileIcon(name: string, type: "file" | "folder") {
  if (type === "folder") return fileIcons.folder;
  const ext = name.split(".").pop() || "";
  return fileIcons[ext] || fileIcons.default;
}
