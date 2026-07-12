/* ------------------------------------------------------------------ */
/* Design tokens: dispatch-terminal aesthetic — deep ink sidebar,      */
/* warm paper canvas, amber signal accent, license-plate data chips.   */
/* ------------------------------------------------------------------ */
export const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');";

export const COLORS = {
  ink: "#12161F",
  inkSoft: "#1C2230",
  paper: "#F3F1EA",
  paperDeep: "#EAE7DC",
  line: "#DAD5C6",
  amber: "#E29A3C",
  amberDeep: "#C67F26",
  teal: "#2E6E68",
  green: "#3C7A4C",
  red: "#B8463C",
  slate: "#5B6472",
  ink70: "rgba(18,22,31,0.7)",
};

export const STATUS_STYLES = {
  AVAILABLE: { c: COLORS.green, label: "Available" },
  ON_TRIP: { c: COLORS.teal, label: "On Trip" },
  IN_SHOP: { c: COLORS.amberDeep, label: "In Shop" },
  RETIRED: { c: COLORS.slate, label: "Retired" },
  OFF_DUTY: { c: COLORS.slate, label: "Off Duty" },
  SUSPENDED: { c: COLORS.red, label: "Suspended" },
  DRAFT: { c: COLORS.slate, label: "Draft" },
  DISPATCHED: { c: COLORS.teal, label: "Dispatched" },
  COMPLETED: { c: COLORS.green, label: "Completed" },
  CANCELLED: { c: COLORS.red, label: "Cancelled" },
  OPEN: { c: COLORS.amberDeep, label: "Open" },
  CLOSED: { c: COLORS.green, label: "Closed" },
};

export const ROLES = {
  FLEET_MANAGER: { label: "Fleet Manager", tabs: ["dashboard", "vehicles", "drivers", "trips", "maintenance", "fuel", "reports"] },
  DRIVER_OPS: { label: "Driver Ops", tabs: ["dashboard", "trips", "drivers"] },
  SAFETY_OFFICER: { label: "Safety Officer", tabs: ["dashboard", "drivers", "maintenance"] },
  FINANCIAL_ANALYST: { label: "Financial Analyst", tabs: ["dashboard", "fuel", "reports"] },
};

/* ------------------------------------------------------------------ */
/* Small utility / formatting helpers                                  */
/* ------------------------------------------------------------------ */
let _id = 100;
export const uid = (p) => `${p}-${String(_id++).padStart(4, "0")}`;
export const today = new Date();
export const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
