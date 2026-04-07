// ============================================================
// pages/filingTracker/FilingTracker.jsx
// BIR Filing Monitor — dark-mode adaptive
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Chip, LinearProgress, IconButton,
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Collapse, Tooltip, Grid, InputAdornment, Snackbar, Alert,
  Skeleton, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Divider, CircularProgress, Popover,
  Stack, useTheme, Tabs, Tab,
} from "@mui/material";
import KeyboardArrowDownIcon    from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon      from "@mui/icons-material/KeyboardArrowUp";
import DeleteOutlineIcon        from "@mui/icons-material/DeleteOutline";
import AddIcon                  from "@mui/icons-material/Add";
import SearchIcon               from "@mui/icons-material/Search";
import DownloadIcon             from "@mui/icons-material/Download";
import EditIcon                 from "@mui/icons-material/Edit";
import NotificationsIcon        from "@mui/icons-material/Notifications";
import ErrorIcon                from "@mui/icons-material/Error";
import WarningAmberIcon         from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon   from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon          from "@mui/icons-material/CheckCircle";
import RefreshIcon              from "@mui/icons-material/Refresh";
import SaveIcon                 from "@mui/icons-material/Save";
import CalendarTodayIcon        from "@mui/icons-material/CalendarToday";
import FilterListIcon           from "@mui/icons-material/FilterList";
import EventIcon                from "@mui/icons-material/Event";
import { http }                 from "../../api/http";

// ─────────────────────────────────────────────────────────────
// BIR FORMS — source of truth mirroring tblbirforms
// ─────────────────────────────────────────────────────────────
export const BIR_FORMS_DB = [
  { FormCode: "1700",    FormName: "Annual ITR – Compensation Income",           Category: "Income Tax",      DueSchedule: "April 15",                       StartOfFiling: "January 1" },
  { FormCode: "1701",    FormName: "Annual ITR – Self-Employed / Estates",       Category: "Income Tax",      DueSchedule: "April 15",                       StartOfFiling: "January 1" },
  { FormCode: "1701A",   FormName: "Annual ITR – Business / Profession",         Category: "Income Tax",      DueSchedule: "April 15",                       StartOfFiling: "January 1" },
  { FormCode: "1701Q",   FormName: "Quarterly ITR – Self-Employed",              Category: "Income Tax",      DueSchedule: "May 15, Aug 15, Nov 15",         StartOfFiling: "1st day after quarter ends" },
  { FormCode: "1702-RT", FormName: "Annual ITR – Corporation (Regular)",         Category: "Income Tax",      DueSchedule: "15th of 4th mo. after FY end",   StartOfFiling: "1st day of 4th month after FY end" },
  { FormCode: "1702-EX", FormName: "Annual ITR – Corporation (Exempt)",          Category: "Income Tax",      DueSchedule: "15th of 4th mo. after FY end",   StartOfFiling: "1st day of 4th month after FY end" },
  { FormCode: "1702Q",   FormName: "Quarterly ITR – Corporation",                Category: "Income Tax",      DueSchedule: "60 days after close of quarter", StartOfFiling: "1st day after quarter ends" },
  { FormCode: "1601-C",  FormName: "Monthly Remittance – Compensation WHT",      Category: "Withholding Tax", DueSchedule: "10th of following month",        StartOfFiling: "1st of following month" },
  { FormCode: "1601-EQ", FormName: "Quarterly WHT – Creditable",                 Category: "Withholding Tax", DueSchedule: "Last day of month after quarter",StartOfFiling: "1st day after quarter ends" },
  { FormCode: "1601-FQ", FormName: "Quarterly WHT – Final",                      Category: "Withholding Tax", DueSchedule: "Last day of month after quarter",StartOfFiling: "1st day after quarter ends" },
  { FormCode: "1604-C",  FormName: "Annual Info Return – Compensation",          Category: "Withholding Tax", DueSchedule: "January 31",                     StartOfFiling: "January 1" },
  { FormCode: "1604-E",  FormName: "Annual Info Return – Creditable WHT",        Category: "Withholding Tax", DueSchedule: "January 31",                     StartOfFiling: "January 1" },
  { FormCode: "1604-F",  FormName: "Annual Info Return – Final WHT",             Category: "Withholding Tax", DueSchedule: "January 31",                     StartOfFiling: "January 1" },
  { FormCode: "2316",    FormName: "Certificate of Compensation / Tax Withheld", Category: "Withholding Tax", DueSchedule: "January 31",                     StartOfFiling: "January 1" },
  { FormCode: "2307",    FormName: "Certificate – Creditable WHT at Source",     Category: "Withholding Tax", DueSchedule: "Per quarter / with payment",     StartOfFiling: "Upon withholding / end of quarter" },
  { FormCode: "2306",    FormName: "Certificate – Final Tax Withheld",           Category: "Withholding Tax", DueSchedule: "Per quarter / with payment",     StartOfFiling: "Upon withholding / end of quarter" },
  { FormCode: "2550M",   FormName: "Monthly VAT Declaration",                    Category: "VAT",             DueSchedule: "Optional / Phased out",          StartOfFiling: "Optional / phased out" },
  { FormCode: "2550Q",   FormName: "Quarterly VAT Return",                       Category: "VAT",             DueSchedule: "25th of month after quarter",    StartOfFiling: "1st day after quarter ends" },
  { FormCode: "2551Q",   FormName: "Quarterly Percentage Tax Return",            Category: "Percentage Tax",  DueSchedule: "25th of month after quarter",    StartOfFiling: "1st day after quarter ends" },
  { FormCode: "1800",    FormName: "Donor's Tax Return",                         Category: "Estate & Donor",  DueSchedule: "30 days after gift date",        StartOfFiling: "Day of donation" },
  { FormCode: "1801",    FormName: "Estate Tax Return",                          Category: "Estate & Donor",  DueSchedule: "1 year from date of death",      StartOfFiling: "Day of death" },
  { FormCode: "1903",    FormName: "Registration – Corp / Partnership",          Category: "Registration",    DueSchedule: "Before start of operations",     StartOfFiling: "Upon SEC / DTI registration" },
  { FormCode: "1905",    FormName: "Registration Info Update",                   Category: "Registration",    DueSchedule: "Within 30 days of change",       StartOfFiling: "Day of change" },
  { FormCode: "0605",    FormName: "Payment Form – Fees / Penalties",            Category: "Payment",         DueSchedule: "Jan 31 or as applicable",        StartOfFiling: "January 1 / as applicable" },
];

const BIR_FORM_MAP = Object.fromEntries(
  BIR_FORMS_DB.map((f) => [f.FormCode, {
    name:  f.FormName,
    cat:   f.Category,
    due:   f.DueSchedule,
    start: f.StartOfFiling,
  }])
);

function mergeBirForms(serverForms = []) {
  const serverMap = Object.fromEntries(serverForms.map((f) => [f.FormCode, f]));
  return BIR_FORMS_DB.map((local) => ({
    ...local,
    ...(serverMap[local.FormCode] || {}),
  }));
}

function resolveFormMeta(formCode, birForms = []) {
  const live = birForms.find((f) => f.FormCode === formCode);
  if (live) return {
    FormName:      live.FormName,
    Category:      live.Category,
    DueSchedule:   live.DueSchedule,
    StartOfFiling: live.StartOfFiling,
  };
  const local = BIR_FORM_MAP[formCode];
  return local
    ? { FormName: local.name, Category: local.cat, DueSchedule: local.due, StartOfFiling: local.start }
    : { FormName: formCode, Category: "Other", DueSchedule: "—", StartOfFiling: "—" };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtISO   = (d) => d.toISOString().slice(0, 10);
const addDays  = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDate  = (s) => !s ? "—" : new Date(s + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const daysLeft = (s) => {
  if (!s) return Infinity;
  const today = getToday();
  const d = new Date(s + "T00:00:00");
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
};

const periodLabel = (hdr) => {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (hdr.PeriodType === "Monthly")   return `${M[(hdr.PeriodMonth || 1) - 1]} ${hdr.PeriodYear}`;
  if (hdr.PeriodType === "Quarterly") return `Q${hdr.PeriodQuarter} ${hdr.PeriodYear}`;
  return String(hdr.PeriodYear);
};

const deriveStatus = (deadlineDate, isFiled) => {
  if (isFiled) return "Filed";
  if (!deadlineDate) return "Upcoming";
  const dl = daysLeft(deadlineDate);
  return dl < 0 ? "Overdue" : dl <= 7 ? "Incomplete" : "Upcoming";
};

const normalizeStatus = (s) => (s === "Pending" ? "Incomplete" : s);

const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QUARTERS = ["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"];

// ─────────────────────────────────────────────────────────────
// THEME-AWARE STATUS COLORS
// ─────────────────────────────────────────────────────────────
const useStatusColors = () => {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  return {
    Complete: {
      color:  dark ? "#4ADE80" : "#16A34A",
      bg:     dark ? "rgba(74,222,128,0.08)"  : "#F0FDF4",
      border: dark ? "rgba(74,222,128,0.25)"  : "#86EFAC",
      chip:   dark ? "rgba(74,222,128,0.14)"  : "#DCFCE7",
    },
    Overdue: {
      color:  dark ? "#F87171" : "#DC2626",
      bg:     dark ? "rgba(248,113,113,0.08)" : "#FEF2F2",
      border: dark ? "rgba(248,113,113,0.25)" : "#FCA5A5",
      chip:   dark ? "rgba(248,113,113,0.14)" : "#FEE2E2",
    },
    Incomplete: {
      color:  dark ? "#FCD34D" : "#D97706",
      bg:     dark ? "rgba(252,211,77,0.08)"  : "#FFFBEB",
      border: dark ? "rgba(252,211,77,0.25)"  : "#FCD34D",
      chip:   dark ? "rgba(252,211,77,0.14)"  : "#FEF3C7",
    },
    Upcoming: {
      color:  dark ? "#F87171" : "#DC2626",
      bg:     dark ? "rgba(248,113,113,0.08)" : "#FEF2F2",
      border: dark ? "rgba(248,113,113,0.25)" : "#FCA5A5",
      chip:   dark ? "rgba(248,113,113,0.14)" : "#FEE2E2",
    },
    Filed: {
      color:  dark ? "#4ADE80" : "#16A34A",
      bg:     dark ? "rgba(74,222,128,0.08)"  : "#F0FDF4",
      border: dark ? "rgba(74,222,128,0.25)"  : "#86EFAC",
      chip:   dark ? "rgba(74,222,128,0.14)"  : "#DCFCE7",
    },
  };
};

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status, size = "small" }) {
  const S  = useStatusColors();
  const t  = S[status] || S.Upcoming;
  const fs = size === "small" ? 13 : 15;
  const icon = {
    Complete:      <CheckCircleIcon sx={{ fontSize: fs }} />,
    Overdue:       <ErrorIcon sx={{ fontSize: fs }} />,
    Incomplete:    <WarningAmberIcon sx={{ fontSize: fs }} />,
    Upcoming:      <ErrorIcon sx={{ fontSize: fs }} />,
    "To Be Filed": <ErrorIcon sx={{ fontSize: fs }} />,
    Filed:         <CheckCircleIcon sx={{ fontSize: fs }} />,
  }[status] || null;

  const displayLabel = status === "Upcoming" ? "To Be Filed" : status;

  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: size === "small" ? 1 : 1.25, py: size === "small" ? 0.3 : 0.5,
      borderRadius: 99, bgcolor: t.chip, border: `1px solid ${t.border}`,
      color: t.color, whiteSpace: "nowrap",
    }}>
      {icon}
      <Typography sx={{ fontSize: size === "small" ? "0.68rem" : "0.78rem", fontWeight: 700, color: t.color }}>
        {displayLabel}
      </Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION BELL
// ─────────────────────────────────────────────────────────────
function NotificationBell({ monitors }) {
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";
  const S           = useStatusColors();
  const [anchor, setAnchor] = useState(null);

  const notifs = monitors.flatMap((m) =>
    (m.Details || [])
      .filter((d) => !d.IsFiled && daysLeft(d.DeadlineDate) <= 7)
      .map((d) => ({ ...d, dl: daysLeft(d.DeadlineDate), monitor: m }))
  ).sort((a, b) => a.dl - b.dl);

  const overdueCount    = notifs.filter((n) => n.dl < 0).length;
  const incompleteColor = S.Incomplete.color;
  const incompleteBg    = S.Incomplete.bg;

  return (
    <>
      <Tooltip title="Deadline Alerts">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{
          width: 38, height: 38, border: "1px solid",
          borderColor: notifs.length > 0 ? incompleteColor : "divider",
          bgcolor: notifs.length > 0 ? incompleteBg : "background.paper",
        }}>
          <Badge
            badgeContent={notifs.length}
            color={overdueCount > 0 ? "error" : "warning"}
            sx={{ "& .MuiBadge-badge": { fontSize: "0.58rem", minWidth: 15, height: 15 } }}
          >
            <NotificationsIcon fontSize="small" sx={{ color: notifs.length > 0 ? incompleteColor : "text.secondary" }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: {
          width: 370, maxHeight: 460, display: "flex", flexDirection: "column",
          boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.14)",
          borderRadius: 2.5,
        }}}
      >
        <Box sx={{
          px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1,
          bgcolor: notifs.length > 0 ? incompleteBg : "background.default",
          borderBottom: "1px solid", borderColor: "divider",
        }}>
          <NotificationsIcon fontSize="small" sx={{ color: incompleteColor }} />
          <Typography fontWeight={700} fontSize="0.9rem">Deadline Alerts</Typography>
          {overdueCount > 0 && (
            <Chip label={`${overdueCount} overdue`} size="small" color="error"
              sx={{ ml: 0.5, fontWeight: 700, fontSize: "0.62rem", height: 18 }} />
          )}
          <Chip label={notifs.length} size="small" sx={{
            ml: "auto", fontWeight: 700, fontSize: "0.62rem", height: 18,
            bgcolor: S.Incomplete.chip, color: incompleteColor, border: `1px solid ${S.Incomplete.border}`,
          }} />
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {notifs.length === 0 ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 40, color: S.Complete.color, mb: 1 }} />
              <Typography variant="body2" fontWeight={700}>All caught up!</Typography>
              <Typography variant="caption" color="text.disabled">No filings due in the next 7 days.</Typography>
            </Box>
          ) : notifs.map((n) => {
            const isOv = n.dl < 0;
            const t    = isOv ? S.Overdue : S.Incomplete;
            return (
              <Box key={n.ID} sx={{
                px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider",
                bgcolor: t.bg, "&:last-child": { borderBottom: 0 },
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box flex={1}>
                    <Typography variant="caption" fontWeight={700} color={t.color} display="block">
                      {n.FormCode} — {n.FormName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.monitor?.Client?.TradeName || "—"} · {periodLabel(n.monitor)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography variant="caption" fontWeight={800} color={t.color} display="block">
                      {isOv ? `${Math.abs(n.dl)}d overdue` : n.dl === 0 ? "Due today!" : `${n.dl}d left`}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                      {fmtDate(n.DeadlineDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EDIT DETAIL DIALOG
// ─────────────────────────────────────────────────────────────
function EditDetailDialog({ open, detail, onClose, onSave }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";

  const [isfiled,   setIsFiled]   = useState(false);
  const [fileddate, setFiledDate] = useState("");
  const [filedby,   setFiledBy]   = useState("");
  const [remarks,   setRemarks]   = useState("");
  const [saving,    setSaving]    = useState(false);

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("accessToken");
      if (!raw) return "";
      if (raw.split(".").length === 3) {
        const payload = JSON.parse(atob(raw.split(".")[1]));
        return payload?.userName || payload?.username || payload?.name || payload?.sub || "";
      }
      const payload = JSON.parse(raw);
      return payload?.userName || payload?.username || payload?.name || "";
    } catch { return ""; }
  })();

  useEffect(() => {
    if (detail) {
      setIsFiled(!!detail.IsFiled);
      setFiledDate(detail.FiledDate ? detail.FiledDate.slice(0, 10) : "");
      setFiledBy(detail.IsFiled ? (detail.FiledBy || currentUser) : currentUser);
      setRemarks(detail.Remarks || "");
    }
  }, [detail]);

  if (!detail) return null;

  const dl   = daysLeft(detail.DeadlineDate);
  const isOv = dl < 0;
  const isCr = dl >= 0 && dl <= 3;
  const tc   = isOv ? S.Overdue : isCr ? S.Incomplete : S.Complete;

  const indigoBg     = dark ? "rgba(99,102,241,0.15)" : "#EEF2FF";
  const indigoBorder = dark ? "rgba(99,102,241,0.35)" : "#C7D2FE";
  const indigoColor  = dark ? "#A5B4FC"               : "#4338CA";

  const meta          = BIR_FORM_MAP[detail.FormCode] || {};
  const formName      = detail.FormName      || meta.name  || detail.FormCode;
  const category      = detail.Category      || meta.cat   || "—";
  const startOfFiling = detail.StartOfFiling || meta.start || "—";
  const dueSchedule   = detail.DueSchedule   || meta.due   || "—";

  const handleSave = async () => {
    setSaving(true);
    await onSave({ id: detail.ID, isfiled, fileddate, filedby, remarks });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ px: 1.25, py: 0.4, borderRadius: 1, bgcolor: indigoBg, border: `1px solid ${indigoBorder}` }}>
            <Typography fontFamily="monospace" fontWeight={800} fontSize="0.85rem" color={indigoColor}>
              {detail.FormCode}
            </Typography>
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize="0.95rem" lineHeight={1.2}>{formName}</Typography>
            <Typography variant="caption" color="text.secondary">{category}</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{
          p: 1.5, borderRadius: 2, mb: 2, border: "1px solid",
          borderColor: "divider", bgcolor: "background.default",
          display: "flex", gap: 3,
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Start of Filing</Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">{startOfFiling}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Due Schedule</Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">{dueSchedule}</Typography>
          </Box>
        </Box>

        <Box sx={{
          p: 2, borderRadius: 2, mb: 2.5, border: "1px solid",
          bgcolor: tc.bg, borderColor: tc.border,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Deadline</Typography>
            <Typography fontWeight={700} color={tc.color}>{fmtDate(detail.DeadlineDate)}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1rem" color={tc.color}>
              {isOv ? `⚠ ${Math.abs(dl)}d overdue` : dl === 0 ? "⏰ Due today!" : `✓ ${dl} days left`}
            </Typography>
            {dl <= 7 && dl >= 0 && (
              <Typography variant="caption" color="text.secondary">Act soon!</Typography>
            )}
          </Box>
        </Box>

        <Paper variant="outlined" sx={{
          p: 2, mb: 2, borderRadius: 2, cursor: "pointer",
          bgcolor: isfiled ? S.Complete.bg : "background.paper",
          borderColor: isfiled ? S.Complete.border : "divider",
          transition: "all 0.15s",
        }}
          onClick={() => {
            const next = !isfiled;
            setIsFiled(next);
            if (next && !fileddate) setFiledDate(fmtISO(getToday()));
            if (!next) { setFiledDate(""); setFiledBy(currentUser); }
          }}
        >
          <FormControlLabel
            control={
              <Checkbox checked={isfiled} color="success"
                onChange={() => {}} onClick={(e) => e.stopPropagation()} />
            }
            label={
              <Box>
                <Typography fontWeight={700} color={isfiled ? S.Complete.color : "text.primary"}>
                  {isfiled ? "✓ Marked as Filed" : "Mark as Filed"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isfiled ? "Click to unmark" : "Click to mark this form as submitted"}
                </Typography>
              </Box>
            }
            sx={{ m: 0 }}
          />
        </Paper>

        {isfiled && (
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Date Filed" type="date"
                InputLabelProps={{ shrink: true }} value={fileddate}
                onChange={(e) => setFiledDate(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Filed By" value={filedby}
                InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        )}

        <TextField fullWidth size="small" label="Remarks (optional)" multiline rows={2}
          placeholder="Add any notes about this filing…"
          value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          color={isfiled ? "success" : "primary"}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          sx={{ borderRadius: 2, minWidth: 130 }}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPUTE REAL BIR DEADLINE DATE
// ─────────────────────────────────────────────────────────────
function computeDeadline(formCode, periodYear, periodMonth, periodQuarter) {
  const y  = Number(periodYear);
  const m  = Number(periodMonth)  || 1;
  const q  = Number(periodQuarter) || 1;

  const iso = (yr, mo, dy) =>
    `${yr}-${String(mo).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;

  const lastDay = (yr, mo) => new Date(yr, mo, 0).getDate();

  switch (formCode) {
    case "1700":
    case "1701":
    case "1701A":
      return iso(y + 1, 4, 15);

    case "1701Q": {
      const qDue = {
        1: iso(y, 5, 15),
        2: iso(y, 8, 15),
        3: iso(y, 11, 15),
        4: iso(y + 1, 4, 15),
      };
      return qDue[q] ?? iso(y, 5, 15);
    }

    case "1702-RT":
    case "1702-EX":
      return iso(y + 1, 4, 15);

    case "1702Q": {
      const quarterEnd = {
        1: new Date(y, 2, 31),
        2: new Date(y, 5, 30),
        3: new Date(y, 8, 30),
        4: new Date(y, 11, 31),
      };
      const end = quarterEnd[q] ?? quarterEnd[1];
      end.setDate(end.getDate() + 60);
      return fmtISO(end);
    }

    case "1601-C": {
      const nm = m === 12 ? 1  : m + 1;
      const ny = m === 12 ? y + 1 : y;
      return iso(ny, nm, 10);
    }

    case "1601-EQ":
    case "1601-FQ": {
      const after = { 1: [y, 4], 2: [y, 7], 3: [y, 10], 4: [y + 1, 1] };
      const [ay, am] = after[q] ?? after[1];
      return iso(ay, am, lastDay(ay, am));
    }

    case "1604-C":
    case "1604-E":
    case "1604-F":
    case "2316":
      return iso(y + 1, 1, 31);

    case "2307":
    case "2306": {
      const after = { 1: [y, 4], 2: [y, 7], 3: [y, 10], 4: [y + 1, 1] };
      const [ay, am] = after[q] ?? after[1];
      return iso(ay, am, lastDay(ay, am));
    }

    case "2550M": {
      const nm = m === 12 ? 1  : m + 1;
      const ny = m === 12 ? y + 1 : y;
      return iso(ny, nm, 25);
    }

    case "2550Q":
    case "2551Q": {
      const after = { 1: [y, 4], 2: [y, 7], 3: [y, 10], 4: [y + 1, 1] };
      const [ay, am] = after[q] ?? after[1];
      return iso(ay, am, 25);
    }

    case "0605":
      return iso(y + 1, 1, 31);

    case "1800":
    case "1801":
    case "1903":
    case "1905":
    default:
      return "";
  }
}

function recomputeDeadlineForDetail(detail, monitor) {
  const computed = computeDeadline(
    detail.FormCode,
    monitor.PeriodYear,
    monitor.PeriodMonth,
    monitor.PeriodQuarter
  );
  return computed || detail.DeadlineDate || "";
}

function AddMonitorDialog({ open, onClose, onAdd, clients, birForms }) {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  const S    = useStatusColors();

  const mergedForms = mergeBirForms(birForms);

  const [clientid,     setClientId]     = useState("");
  const [periodtype,   setPeriodType]   = useState("Monthly");
  const [periodyear,   setPeriodYear]   = useState(new Date().getFullYear());
  const [pmonth,       setPMonth]       = useState(() => { const m = new Date().getMonth()+1; return m===12?1:m+1; });
  const [pqtr,         setPQtr]         = useState(() => { const m = new Date().getMonth()+1; return Math.min(Math.ceil((m+1)/3),4); });
  const [selected,     setSelected]     = useState([]);
  const [deadlines,    setDeadlines]    = useState({});
  const [err,          setErr]          = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const cats = [...new Set(mergedForms.map((f) => f.Category))];

  useEffect(() => {
    if (open) { setClientId(""); setErr(""); setClientSearch(""); }
  }, [open]);

  useEffect(() => {
    const allCodes = mergedForms.map((f) => f.FormCode);
    const presets  = {
      Monthly:   ["1601-C","2550M","0605"],
      Quarterly: ["1601-EQ","1601-FQ","2550Q","2551Q","1702Q"],
      Annual:    ["1700","1701","1701A","1702-RT","1604-C","2316"],
    };
    setSelected((presets[periodtype]||[]).filter((c) => allCodes.includes(c)));
  }, [periodtype, mergedForms.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const next = {};
    selected.forEach((code) => {
      next[code] = computeDeadline(code, Number(periodyear), Number(pmonth), Number(pqtr));
    });
    setDeadlines(next);
  }, [selected, periodyear, pmonth, pqtr]);

  const toggle = (code) =>
    setSelected((p) => p.includes(code) ? p.filter((c)=>c!==code) : [...p, code]);

  const toggleCat = (cat) => {
    const codes  = mergedForms.filter((f)=>f.Category===cat).map((f)=>f.FormCode);
    const allSel = codes.every((c)=>selected.includes(c));
    setSelected((p) => allSel ? p.filter((c)=>!codes.includes(c)) : [...new Set([...p,...codes])]);
  };

  const filteredClients = (clients||[]).filter((c) => {
    const q = clientSearch.toLowerCase();
    return !q||(c.TradeName||"").toLowerCase().includes(q)||(c.LNF||"").toLowerCase().includes(q)||(c.ClientID||"").toLowerCase().includes(q);
  });

  const codeBg    = dark ? "rgba(251,191,36,0.15)" : "#FEF9C3";
  const codeColor = dark ? "#FCD34D"               : "#B45309";

  const missingDeadlines = selected.filter((c) => !deadlines[c]);

  const handleAdd = async () => {
    if (!clientid)               return setErr("Please select a client.");
    if (!selected.length)        return setErr("Select at least one BIR form.");
    if (missingDeadlines.length) return setErr(`Please set deadlines for: ${missingDeadlines.join(", ")}`);
    setErr("");
    setSubmitting(true);
    try {
      await onAdd({
        clientid:      Number(clientid),
        periodtype,
        periodyear:    Number(periodyear),
        periodmonth:   periodtype==="Monthly"   ? Number(pmonth) : null,
        periodquarter: periodtype==="Quarterly" ? Number(pqtr)   : null,
        formcodes:     selected,
        deadlines,
      });
      onClose();
    } catch(e) {
      setErr(e?.message||"Failed to add monitor record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle sx={{ borderBottom:"1px solid", borderColor:"divider", pb:2 }}>
        <Typography fontWeight={800} fontSize="1.05rem">Add Monitor Record</Typography>
        <Typography variant="body2" color="text.secondary">
          Deadlines are auto-computed from BIR rules — you can override any date before saving.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt:2.5 }}>
        {err && <Alert severity="error" sx={{ mb:2, borderRadius:2 }}>{err}</Alert>}

        <Typography variant="caption" fontWeight={700} sx={{
          textTransform:"uppercase", letterSpacing:"0.08em", color:"text.secondary", display:"block", mb:1,
        }}>Period Setup</Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" select label="Client *" value={clientid}
              onChange={(e)=>setClientId(e.target.value)}
              SelectProps={{ MenuProps:{ PaperProps:{ sx:{ maxHeight:320 } } } }}>
              <Box sx={{ px:1.5, py:1, position:"sticky", top:0, bgcolor:"background.paper", zIndex:1 }}>
                <TextField size="small" fullWidth placeholder="Search client…" value={clientSearch}
                  onChange={(e)=>{ e.stopPropagation(); setClientSearch(e.target.value); }}
                  onKeyDown={(e)=>e.stopPropagation()}
                  InputProps={{ startAdornment:(
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color:"text.disabled" }} />
                    </InputAdornment>
                  )}} />
              </Box>
              {filteredClients.length===0 && (
                <MenuItem disabled>
                  <Typography variant="caption" color="text.disabled">No clients found</Typography>
                </MenuItem>
              )}
              {filteredClients.map((c)=>(
                <MenuItem key={c.ID} value={c.ID}>
                  <Typography variant="body2" fontWeight={600}>{c.TradeName||c.LNF}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml:1 }}>
                    {c.ClientID}{c.Type?` · ${c.Type}`:""}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField fullWidth size="small" select label="Period Type *" value={periodtype}
              onChange={(e)=>setPeriodType(e.target.value)}>
              {["Monthly","Quarterly","Annual"].map((t)=>(
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField fullWidth size="small" label="Year *" type="number" value={periodyear}
              onChange={(e)=>setPeriodYear(e.target.value)} inputProps={{ min:2020, max:2030 }} />
          </Grid>

          {periodtype==="Monthly" && (
            <Grid item xs={6} md={2}>
              <TextField fullWidth size="small" select label="Month *" value={pmonth}
                onChange={(e)=>setPMonth(e.target.value)}>
                {MONTHS.map((m,i)=>(
                  <MenuItem key={i+1} value={i+1}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {periodtype==="Quarterly" && (
            <Grid item xs={6} md={2}>
              <TextField fullWidth size="small" select label="Quarter *" value={pqtr}
                onChange={(e)=>setPQtr(e.target.value)}>
                {QUARTERS.map((q,i)=>(
                  <MenuItem key={i+1} value={i+1}>{q}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb:2 }} />

        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Typography variant="caption" fontWeight={700} sx={{
            textTransform:"uppercase", letterSpacing:"0.08em", color:"text.secondary",
          }}>BIR Forms to Monitor</Typography>
          <Chip label={`${selected.length} selected`} size="small" color="primary"
            sx={{ fontWeight:700, fontSize:"0.65rem" }} />
          <Typography variant="caption" color="text.disabled">(auto-selected by period type)</Typography>
        </Box>

        {cats.map((cat)=>{
          const catForms = mergedForms.filter((f)=>f.Category===cat);
          const allSel   = catForms.every((f)=>selected.includes(f.FormCode));
          return (
            <Box key={cat} mb={2}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box sx={{ width:3, height:14, borderRadius:1, bgcolor:"primary.main" }} />
                <Typography variant="caption" fontWeight={700} color="primary.main"
                  sx={{ textTransform:"uppercase", letterSpacing:"0.08em" }}>{cat}</Typography>
                <Button size="small" sx={{
                  fontSize:"0.62rem", py:0, minWidth:0, color:"text.secondary",
                  textDecoration:"underline", "&:hover":{ bgcolor:"transparent" },
                }} onClick={()=>toggleCat(cat)}>
                  {allSel?"Deselect all":"Select all"}
                </Button>
              </Box>
              <Grid container>
                {catForms.map((f)=>(
                  <Grid item xs={12} sm={6} key={f.FormCode}>
                    <FormControlLabel
                      control={<Checkbox size="small" color="primary"
                        checked={selected.includes(f.FormCode)}
                        onChange={()=>toggle(f.FormCode)} />}
                      label={
                        <Typography variant="caption">
                          <Box component="span" fontFamily="monospace" fontWeight={800}
                            sx={{ color:codeColor, bgcolor:codeBg, px:0.5, borderRadius:0.5 }}>
                            {f.FormCode}
                          </Box>
                          {" "}{f.FormName}{" "}
                          <Box component="span" color="text.disabled">
                            · Start: {f.StartOfFiling} · Due: {f.DueSchedule}
                          </Box>
                        </Typography>
                      }
                      sx={{ m:0, py:0.3 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}

        {selected.length > 0 && (
          <>
            <Divider sx={{ mb:2, mt:1 }} />
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Typography variant="caption" fontWeight={700} sx={{
                textTransform:"uppercase", letterSpacing:"0.08em", color:"text.secondary",
              }}>Filing Deadlines</Typography>
              {missingDeadlines.length > 0 && (
                <Chip
                  label={`${missingDeadlines.length} need manual date`}
                  size="small"
                  sx={{
                    fontWeight:700, fontSize:"0.62rem", height:20,
                    bgcolor: S.Incomplete.chip, color: S.Incomplete.color,
                    border:`1px solid ${S.Incomplete.border}`,
                  }}
                />
              )}
              <Typography variant="caption" color="text.disabled">
                Auto-computed from BIR rules · override any date as needed
              </Typography>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius:2, overflow:"hidden" }}>
              {selected.map((code, idx) => {
                const meta    = BIR_FORM_MAP[code] || {};
                const dl      = deadlines[code] || "";
                const isEmpty = !dl;
                const tc      = isEmpty ? S.Incomplete : S.Complete;
                const isLast  = idx === selected.length - 1;

                return (
                  <Box key={code} sx={{
                    display:"flex", alignItems:"center", gap:2,
                    px:2, py:1.25,
                    borderBottom: isLast ? 0 : "1px solid",
                    borderColor:"divider",
                    borderLeft:`4px solid ${tc.color}`,
                    bgcolor: isEmpty ? S.Incomplete.bg : "transparent",
                  }}>
                    <Box sx={{
                      px:0.75, py:0.25, borderRadius:1, flexShrink:0,
                      bgcolor: codeBg,
                      border:`1px solid ${dark?"rgba(251,191,36,0.3)":"#FDE68A"}`,
                    }}>
                      <Typography fontFamily="monospace" fontWeight={800} fontSize="0.75rem" color={codeColor}>
                        {code}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{
                      flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    }}>
                      {meta.name || code}
                    </Typography>

                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink:0, minWidth:160 }}>
                      Start: {meta.start || "—"}
                    </Typography>

                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink:0, minWidth:160 }}>
                      Due: {meta.due || "—"}
                    </Typography>

                    <TextField
                      size="small"
                      type="date"
                      value={dl}
                      onChange={(e) => setDeadlines((p) => ({ ...p, [code]: e.target.value }))}
                      InputLabelProps={{ shrink:true }}
                      inputProps={{ style:{ fontSize:"0.78rem" } }}
                      sx={{ width:155, flexShrink:0 }}
                      error={isEmpty}
                      helperText={isEmpty ? "Required" : ""}
                    />
                  </Box>
                );
              })}
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px:3, pb:2.5, borderTop:"1px solid", borderColor:"divider", gap:1 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius:2 }}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={submitting||missingDeadlines.length>0}
          startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
          sx={{ borderRadius:2, px:3 }}>
          {submitting ? "Adding…" : `Add Monitor${missingDeadlines.length>0?" ("+missingDeadlines.length+" dates missing)":""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────
function DetailPanel({ monitor, onEditDetail }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";
  const cats        = [...new Set((monitor.Details || []).map((d) => d.Category))];

  const panelBg     = dark ? palette.background.default : "#F8FAFF";
  const panelBorder = dark ? palette.divider            : "#E8EDFF";
  const cardBg      = dark ? palette.background.paper   : "#FFFFFF";
  const rowBorder   = dark ? palette.divider            : "#E5E7EB";

  return (
    <Box sx={{ bgcolor: panelBg, borderTop: `2px solid ${panelBorder}`, p: 3 }}>
      <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 2,
          bgcolor: cardBg, border: `1px solid ${rowBorder}`, minWidth: 120,
        }}>
          <CheckCircleIcon sx={{ color: S.Complete.color, fontSize: 20 }} />
          <Box>
            <Typography fontSize="0.65rem" color="text.secondary">Filed</Typography>
            <Typography fontWeight={800} fontSize="1rem" color={S.Complete.color}>
              {monitor.FiledCount}/{monitor.TotalForms}
            </Typography>
          </Box>
        </Box>

        {monitor.OverdueCount > 0 && (
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 2,
            bgcolor: S.Overdue.bg, border: `1px solid ${S.Overdue.border}`, minWidth: 100,
          }}>
            <ErrorIcon sx={{ color: S.Overdue.color, fontSize: 20 }} />
            <Box>
              <Typography fontSize="0.65rem" color={S.Overdue.color}>Overdue</Typography>
              <Typography fontWeight={800} fontSize="1rem" color={S.Overdue.color}>{monitor.OverdueCount}</Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Overall progress</Typography>
            <Typography variant="caption" fontWeight={700}>{monitor.ProgressPct}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={monitor.ProgressPct}
            color={monitor.ProgressPct === 100 ? "success" : monitor.OverdueCount > 0 ? "error" : "warning"}
            sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {monitor.Remarks && (
          <Box sx={{
            p: 1.5, borderRadius: 2, bgcolor: S.Incomplete.bg,
            border: `1px solid ${S.Incomplete.border}`, maxWidth: 240,
          }}>
            <Typography variant="caption" color="text.secondary" display="block">Remarks</Typography>
            <Typography variant="caption" color="text.primary">{monitor.Remarks}</Typography>
          </Box>
        )}
      </Box>

      {cats.map((cat) => {
        const rows = (monitor.Details || []).filter((d) => d.Category === cat);
        return (
          <Box key={cat} mb={2.5}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: "primary.main" }} />
              <Typography variant="caption" fontWeight={700} color="primary.main"
                sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {cat}
              </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${rowBorder}`, borderRadius: 2, overflow: "hidden" }}>
              {rows.map((d, idx) => {
                const liveDeadline = recomputeDeadlineForDetail(d, monitor);
                const st          = deriveStatus(liveDeadline, d.IsFiled);
                const dl          = daysLeft(liveDeadline);
                const tc          = S[st === "Filed" ? "Complete" : st] || S.Upcoming;
                const isLast      = idx === rows.length - 1;
                const displayName = d.FormName      || BIR_FORM_MAP[d.FormCode]?.name  || d.FormCode;
                const meta        = BIR_FORM_MAP[d.FormCode] || {};
                const startInfo   = d.StartOfFiling || meta.start || "—";
                const dueInfo     = d.DueSchedule   || meta.due   || "—";

                return (
                  <Box key={d.ID} sx={{
                    display: "flex", alignItems: "center", gap: 2,
                    px: 2, py: 1.5,
                    bgcolor: tc.bg,
                    borderBottom: isLast ? 0 : `1px solid ${rowBorder}`,
                    borderLeft: `4px solid ${tc.color}`,
                  }}>
                    <Box sx={{ minWidth: 80, flexShrink: 0 }}>
                      <Typography fontFamily="monospace" fontWeight={800} fontSize="0.82rem" color={tc.color}>
                        {d.FormCode}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {displayName}
                      </Typography>
                      <Box display="flex" gap={1.5} mt={0.25}>
                        <Typography variant="caption" color="text.disabled" fontSize="0.62rem">
                          Start: {startInfo}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" fontSize="0.62rem">
                          Due: {dueInfo}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right", minWidth: 150, flexShrink: 0 }}>
                      {d.IsFiled ? (
                        <>
                          <Typography variant="caption" fontWeight={600} color={S.Complete.color} display="block">
                            ✓ Filed {fmtDate(d.FiledDate)}
                          </Typography>
                          {d.FiledBy && (
                            <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                              by {d.FiledBy}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="caption" fontFamily="monospace" fontWeight={600}
                            color={tc.color} display="block">
                            Due {fmtDate(liveDeadline)}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} fontSize="0.6rem" color={tc.color}>
                            {dl === Infinity
                              ? "No date set"
                              : dl < 0
                              ? `${Math.abs(dl)}d overdue`
                              : dl === 0
                              ? "Due today!"
                              : `${dl}d left`}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Box sx={{ minWidth: 90, flexShrink: 0 }}>
                      <StatusBadge status={d.IsFiled ? "Filed" : st} />
                    </Box>

                    <Tooltip title="Edit filing status">
                      <Button size="small" variant="outlined"
                        startIcon={<EditIcon sx={{ fontSize: "13px !important" }} />}
                        onClick={() => onEditDetail({ ...d, DeadlineDate: liveDeadline })}
                        sx={{
                          borderRadius: 1.5, fontSize: "0.68rem", py: 0.4, px: 1.25, flexShrink: 0,
                          borderColor: tc.border, color: tc.color,
                          bgcolor: dark ? "transparent" : "background.paper",
                          "&:hover": { bgcolor: tc.chip, borderColor: tc.color },
                        }}>
                        Update
                      </Button>
                    </Tooltip>
                  </Box>
                );
              })}
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// MONITOR ROW
// ─────────────────────────────────────────────────────────────
function MonitorRow({ monitor, rowNum, existingKeys = new Set(), onEditDetail, onDelete }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";
  const [open, setOpen] = useState(false);

  const client     = monitor.Client || {};
  const pct        = monitor.ProgressPct || 0;
  const t          = S[monitor.OverallStatus] || S.Upcoming;
  const isComplete = monitor.OverallStatus === "Complete";
  const isOverdue  = monitor.OverallStatus === "Overdue";

  const nextPeriodKey = (m) => {
    if (m.PeriodType === "Monthly") {
      const nm = (m.PeriodMonth % 12) + 1;
      const ny = nm === 1 ? m.PeriodYear + 1 : m.PeriodYear;
      return `${m.ClientID}-Monthly-${ny}-${nm}-0`;
    }
    if (m.PeriodType === "Quarterly") {
      const nq = (m.PeriodQuarter % 4) + 1;
      const ny = nq === 1 ? m.PeriodYear + 1 : m.PeriodYear;
      return `${m.ClientID}-Quarterly-${ny}-0-${nq}`;
    }
    return `${m.ClientID}-Annual-${m.PeriodYear + 1}-0-0`;
  };
  const needsRenewal = isComplete && !existingKeys.has(nextPeriodKey(monitor));

  const rowBg = isComplete ? S.Complete.bg : isOverdue ? S.Overdue.bg : "inherit";
  const rowHoverBg = isComplete ? S.Complete.chip : isOverdue ? S.Overdue.chip
                   : dark ? "rgba(255,255,255,0.04)" : "#F5F8FF";

  const indigoBg     = dark ? "rgba(99,102,241,0.15)" : "#EEF2FF";
  const indigoBorder = dark ? "rgba(99,102,241,0.30)" : "#C7D2FE";
  const indigoColor  = dark ? "#A5B4FC"               : "#4338CA";
  const expandActiveBg = dark ? "rgba(99,102,241,0.15)" : "#EEF2FF";

  return (
    <>
      <TableRow hover onClick={() => setOpen((o) => !o)} sx={{
        cursor: "pointer",
        bgcolor: rowBg,
        "& > td:first-of-type": { borderLeft: `3px solid ${t.color}` },
        "&:hover > td": { bgcolor: `${rowHoverBg} !important` },
        transition: "background-color 0.1s",
      }}>
        <TableCell sx={{ width: 48, pl: 1.5, pr: 0 }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            sx={{
              color: open ? "primary.main" : "text.secondary",
              bgcolor: open ? expandActiveBg : "transparent",
              borderRadius: 1.5,
            }}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ width: 36, color: "text.disabled", fontFamily: "monospace", fontSize: "0.7rem", pl: 0 }}>
          {String(rowNum).padStart(2, "0")}
        </TableCell>

        <TableCell sx={{ py: 1.75 }}>
          <Typography variant="body2" fontWeight={700} fontSize="0.88rem">
            {client.TradeName || client.LNF || "—"}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.25}>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontSize="0.68rem">
              {client.ClientID}
            </Typography>
            {client.Type && (
              <Chip label={client.Type} size="small" sx={{
                fontSize: "0.58rem", height: 16, fontWeight: 600,
                bgcolor: indigoBg, color: indigoColor, border: `1px solid ${indigoBorder}`,
              }} />
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ py: 1.75 }}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <CalendarTodayIcon sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography variant="body2" fontWeight={700}>{periodLabel(monitor)}</Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" fontSize="0.68rem">{monitor.PeriodType}</Typography>
          {needsRenewal && (
            <Chip
              label="↻ Renewal pending"
              size="small"
              sx={{
                mt: 0.5, fontSize: "0.6rem", height: 18, fontWeight: 700,
                bgcolor: S.Incomplete.chip, color: S.Incomplete.color,
                border: `1px solid ${S.Incomplete.border}`,
              }}
            />
          )}
        </TableCell>

        <TableCell sx={{ py: 1.75 }}>
          <Box display="flex" flexWrap="wrap" gap={0.4}>
            {(monitor.Details || []).slice(0, 6).map((d) => {
              const liveDeadline = recomputeDeadlineForDetail(d, monitor);
              const st = deriveStatus(liveDeadline, d.IsFiled);
              const ft = S[st === "Filed" ? "Complete" : st] || S.Upcoming;
              return (
                <Chip key={d.FormCode} label={d.FormCode} size="small" sx={{
                  fontSize: "0.6rem", height: 20, fontFamily: "monospace", fontWeight: 700,
                  bgcolor: ft.chip, color: ft.color, border: `1px solid ${ft.border}`,
                }} />
              );
            })}
            {(monitor.Details?.length || 0) > 6 && (
              <Chip label={`+${monitor.Details.length - 6} more`} size="small" sx={{
                fontSize: "0.6rem", height: 20,
                bgcolor: dark ? "rgba(255,255,255,0.08)" : "#F3F4F6",
                color: "text.secondary",
              }} />
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ minWidth: 170, py: 1.75 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <LinearProgress variant="determinate" value={pct}
              color={isComplete ? "success" : isOverdue ? "error" : "warning"}
              sx={{ flex: 1, height: 7, borderRadius: 4 }} />
            <Typography variant="caption" fontWeight={700} color={t.color} sx={{ minWidth: 34 }}>
              {pct}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
            {monitor.FiledCount}/{monitor.TotalForms} filed
            {monitor.OverdueCount > 0 && (
              <Box component="span" sx={{ color: S.Overdue.color, ml: 0.75, fontWeight: 700 }}>
                · {monitor.OverdueCount} overdue
              </Box>
            )}
          </Typography>
        </TableCell>

        <TableCell sx={{ py: 1.75 }}>
          <StatusBadge status={monitor.OverallStatus} />
        </TableCell>

        <TableCell sx={{ width: 52 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Delete monitor record">
            <IconButton size="small" color="error"
              sx={{ opacity: 0.3, "&:hover": { opacity: 1, bgcolor: S.Overdue.bg } }}
              onClick={() => onDelete(monitor.ID)}>
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0, border: open ? undefined : 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <DetailPanel monitor={monitor} onEditDetail={onEditDetail} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// NEXT FILINGS HELPERS
// ─────────────────────────────────────────────────────────────
function buildNextFilings(monitors, existingKeys) {
  const rows = [];

  const nextPeriodKey = (m) => {
    if (m.PeriodType === "Monthly") {
      const nm = (m.PeriodMonth % 12) + 1;
      const ny = nm === 1 ? m.PeriodYear + 1 : m.PeriodYear;
      return `${m.ClientID}-Monthly-${ny}-${nm}-0`;
    }
    if (m.PeriodType === "Quarterly") {
      const nq = (m.PeriodQuarter % 4) + 1;
      const ny = nq === 1 ? m.PeriodYear + 1 : m.PeriodYear;
      return `${m.ClientID}-Quarterly-${ny}-0-${nq}`;
    }
    return `${m.ClientID}-Annual-${m.PeriodYear + 1}-0-0`;
  };

  monitors.forEach((m) => {
    const detailsWithLive = (m.Details || []).map((d) => ({
      ...d,
      DeadlineDate: recomputeDeadlineForDetail(d, m),
    }));

    const unfiled = detailsWithLive.filter((d) => !d.IsFiled);

    if (unfiled.length > 0) {
      const nearest = unfiled.reduce((best, d) =>
        !best || new Date(d.DeadlineDate) < new Date(best.DeadlineDate) ? d : best, null
      );
      const dl = daysLeft(nearest.DeadlineDate);
      rows.push({
        monitorId:       m.ID,
        client:          m.Client || {},
        pLabel:          periodLabel(m),
        periodType:      m.PeriodType,
        nearestDeadline: nearest.DeadlineDate,
        nearestFormCode: nearest.FormCode,
        nearestFormName: nearest.FormName || BIR_FORM_MAP[nearest.FormCode]?.name || nearest.FormCode,
        daysLeft:        dl,
        unfiledForms:    unfiled
          .map((d) => ({
            ...d,
            FormName:      d.FormName      || BIR_FORM_MAP[d.FormCode]?.name  || d.FormCode,
            StartOfFiling: d.StartOfFiling || BIR_FORM_MAP[d.FormCode]?.start || "—",
            DueSchedule:   d.DueSchedule   || BIR_FORM_MAP[d.FormCode]?.due   || "—",
          }))
          .sort((a, b) => new Date(a.DeadlineDate) - new Date(b.DeadlineDate)),
        overallStatus:   m.OverallStatus,
        isRenewal:       false,
      });
    } else {
      const isComplete   = m.OverallStatus === "Complete";
      const needsRenewal = isComplete && existingKeys && !existingKeys.has(nextPeriodKey(m));
      if (!needsRenewal) return;

      rows.push({
        monitorId:       m.ID,
        client:          m.Client || {},
        pLabel:          periodLabel(m),
        periodType:      m.PeriodType,
        nearestDeadline: null,
        nearestFormCode: null,
        nearestFormName: null,
        daysLeft:        Infinity,
        unfiledForms:    [],
        overallStatus:   "Complete",
        isRenewal:       true,
        nextPeriodLabel: nextPeriodLabel(m),
      });
    }
  });

  return rows.sort((a, b) => {
    if (a.daysLeft === Infinity && b.daysLeft === Infinity) return 0;
    if (a.daysLeft === Infinity) return 1;
    if (b.daysLeft === Infinity) return -1;
    return a.daysLeft - b.daysLeft;
  });
}

function nextPeriodLabel(m) {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (m.PeriodType === "Monthly") {
    const nm = (m.PeriodMonth % 12) + 1;
    const ny = nm === 1 ? m.PeriodYear + 1 : m.PeriodYear;
    return `${M[nm - 1]} ${ny}`;
  }
  if (m.PeriodType === "Quarterly") {
    const nq = (m.PeriodQuarter % 4) + 1;
    const ny = nq === 1 ? m.PeriodYear + 1 : m.PeriodYear;
    return `Q${nq} ${ny}`;
  }
  return `FY ${m.PeriodYear + 1}`;
}

function weekRangeLabel(isoDate) {
  const d   = new Date(isoDate + "T00:00:00"); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = (x) => x.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

// ─────────────────────────────────────────────────────────────
// UNFILED CARD
// FIX: use S.Upcoming (red) instead of S.Complete (green) for
//      unfiled forms with deadlines > 7 days away. Green should
//      only appear when a form is actually filed.
// ─────────────────────────────────────────────────────────────
function UnfiledCard({ r, dark, S, onEditDetail }) {
  const [expanded, setExpanded] = useState(false);
  const dl = r.daysLeft;
  // ✅ FIXED: was S.Complete — now S.Upcoming so unfiled = always red/warning
  const t  = dl < 0 ? S.Overdue : dl <= 7 ? S.Incomplete : S.Upcoming;

  // ✅ FIXED: same fix for individual form rows inside the expanded panel
  const formRowTheme = (f) => {
    const fdl = daysLeft(f.DeadlineDate);
    return fdl < 0 ? S.Overdue : fdl <= 7 ? S.Incomplete : S.Upcoming;
  };

  const indigoBg     = dark ? "rgba(99,102,241,0.15)" : "#EEF2FF";
  const indigoBorder = dark ? "rgba(99,102,241,0.30)" : "#C7D2FE";
  const indigoColor  = dark ? "#A5B4FC"               : "#4338CA";

  return (
    <Paper elevation={0} sx={{
      border: "1px solid", borderColor: t.border,
      borderLeft: `4px solid ${t.color}`,
      borderRadius: 2, bgcolor: t.bg, overflow: "hidden",
      transition: "box-shadow 0.1s",
      "&:hover": { boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)" },
    }}>
      <Box
        onClick={() => setExpanded((o) => !o)}
        sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.5, cursor: "pointer" }}
      >
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setExpanded((o) => !o); }}
          sx={{
            color: expanded ? "primary.main" : "text.secondary",
            bgcolor: expanded ? (dark ? "rgba(99,102,241,0.15)" : "#EEF2FF") : "transparent",
            borderRadius: 1.5, flexShrink: 0,
          }}
        >
          {expanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
            <Typography variant="body2" fontWeight={700} fontSize="0.88rem">
              {r.client.TradeName || r.client.LNF || "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontSize="0.68rem">
              {r.client.ClientID}
            </Typography>
            {r.client.Type && (
              <Chip label={r.client.Type} size="small" sx={{
                fontSize: "0.58rem", height: 16, fontWeight: 600,
                bgcolor: indigoBg, color: indigoColor, border: `1px solid ${indigoBorder}`,
              }} />
            )}
            <Typography variant="caption" color="text.disabled" fontSize="0.68rem">
              · {r.pLabel} · {r.periodType}
            </Typography>
          </Box>

          {!expanded && (
            <Box display="flex" flexWrap="wrap" gap={0.4} mt={0.5}>
              {r.unfiledForms.slice(0, 5).map((f) => {
                const fT = formRowTheme(f);
                return (
                  <Tooltip key={f.FormCode} title={`${f.FormName} — Due ${fmtDate(f.DeadlineDate)}`} arrow>
                    <Chip label={f.FormCode} size="small" sx={{
                      fontSize: "0.6rem", height: 20, fontFamily: "monospace", fontWeight: 700,
                      bgcolor: fT.chip, color: fT.color, border: `1px solid ${fT.border}`, cursor: "default",
                    }} />
                  </Tooltip>
                );
              })}
              {r.unfiledForms.length > 5 && (
                <Chip label={`+${r.unfiledForms.length - 5} more`} size="small" sx={{
                  fontSize: "0.6rem", height: 20,
                  bgcolor: dark ? "rgba(255,255,255,0.08)" : "#F3F4F6",
                  color: "text.secondary",
                }} />
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 140 }}>
          <Typography variant="caption" fontFamily="monospace" fontWeight={700}
            color={t.color} display="block">
            Due {fmtDate(r.nearestDeadline)}
          </Typography>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            px: 1, py: 0.25, borderRadius: 99,
            bgcolor: t.chip, border: `1px solid ${t.border}`, mt: 0.5,
          }}>
            {dl < 0
              ? <ErrorIcon sx={{ fontSize: 11, color: t.color }} />
              : dl <= 7
              ? <WarningAmberIcon sx={{ fontSize: 11, color: t.color }} />
              : <CalendarTodayIcon sx={{ fontSize: 11, color: t.color }} />}
            <Typography variant="caption" fontWeight={800} fontSize="0.65rem" color={t.color}>
              {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? "Due today!" : `${dl}d left`}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${r.unfiledForms.length} form${r.unfiledForms.length !== 1 ? "s" : ""}`}
          size="small"
          sx={{
            fontSize: "0.6rem", height: 20, fontWeight: 700, flexShrink: 0,
            bgcolor: t.chip, color: t.color, border: `1px solid ${t.border}`,
          }}
        />
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{
          borderTop: `1px solid ${t.border}`,
          bgcolor: dark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.6)",
        }}>
          <Box sx={{
            px: 2, py: 1, display: "flex", alignItems: "center", gap: 1,
            borderBottom: `1px solid ${t.border}`,
          }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.07em", flex: 1 }}>
              Forms required for {r.pLabel}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {r.unfiledForms.length} pending · sorted by deadline
            </Typography>
          </Box>

          {r.unfiledForms.map((f, idx) => {
            const fT     = formRowTheme(f);
            const fdl    = daysLeft(f.DeadlineDate);
            const meta   = BIR_FORM_MAP[f.FormCode] || {};
            const isLast = idx === r.unfiledForms.length - 1;

            return (
              <Box key={f.ID ?? f.FormCode} sx={{
                display: "flex", alignItems: "center", gap: 2,
                px: 2.5, py: 1.25,
                borderBottom: isLast ? 0 : `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
                borderLeft: `3px solid ${fT.color}`,
                bgcolor: fT.bg,
                "&:hover": { filter: "brightness(0.97)" },
              }}>
                <Box sx={{
                  px: 1, py: 0.3, borderRadius: 1, flexShrink: 0,
                  bgcolor: dark ? "rgba(251,191,36,0.15)" : "#FEF9C3",
                  border: `1px solid ${dark ? "rgba(251,191,36,0.3)" : "#FDE68A"}`,
                }}>
                  <Typography fontFamily="monospace" fontWeight={800} fontSize="0.78rem"
                    color={dark ? "#FCD34D" : "#B45309"}>
                    {f.FormCode}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={700} fontSize="0.8rem"
                    color="text.primary" display="block"
                    sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.FormName || meta.name || f.FormCode}
                  </Typography>
                  <Box display="flex" gap={1.5}>
                    <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                      {f.Category || meta.cat || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" fontSize="0.68rem">
                      Start: {f.StartOfFiling || meta.start || "—"}
                    </Typography>
                    {(f.DueSchedule || meta.due) && (
                      <Typography variant="caption" color="text.disabled" fontSize="0.68rem">
                        Due sched: {f.DueSchedule || meta.due}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 110 }}>
                  <Typography variant="caption" fontFamily="monospace" fontWeight={700}
                    color={fT.color} display="block" fontSize="0.72rem">
                    {fmtDate(f.DeadlineDate)}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} fontSize="0.62rem" color={fT.color}>
                    {fdl === Infinity
                      ? "No date set"
                      : fdl < 0
                      ? `${Math.abs(fdl)}d overdue`
                      : fdl === 0
                      ? "Due today!"
                      : `${fdl}d left`}
                  </Typography>
                </Box>

                <Box sx={{ flexShrink: 0, minWidth: 90 }}>
                  <StatusBadge status={fdl < 0 ? "Overdue" : fdl <= 7 ? "Incomplete" : "Upcoming"} />
                </Box>

                <Tooltip title={`Update filing status for ${f.FormCode}`}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: "13px !important" }} />}
                    onClick={(e) => { e.stopPropagation(); onEditDetail(f); }}
                    sx={{
                      borderRadius: 1.5, fontSize: "0.68rem", py: 0.4, px: 1.25, flexShrink: 0,
                      borderColor: fT.border, color: fT.color,
                      bgcolor: dark ? "transparent" : "background.paper",
                      "&:hover": { bgcolor: fT.chip, borderColor: fT.color },
                    }}
                  >
                    Update
                  </Button>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────
// NEXT FILINGS TAB
// ─────────────────────────────────────────────────────────────
function NextFilingsTab({ monitors, existingKeys, onEditDetail }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";

  const [groupBy,    setGroupBy]    = useState("week");
  const [showWindow, setShowWindow] = useState("all");
  const [searchQ,    setSearchQ]    = useState("");

  const allRows = buildNextFilings(monitors, existingKeys);

  const filtered = allRows.filter((r) => {
    const dl = r.daysLeft;
    const q  = searchQ.toLowerCase();
    const matchClient = !q
      || (r.client.TradeName || "").toLowerCase().includes(q)
      || (r.client.LNF       || "").toLowerCase().includes(q)
      || (r.client.ClientID  || "").toLowerCase().includes(q)
      || (r.nearestFormCode || "").toLowerCase().includes(q);

    const matchWindow =
      showWindow === "all"     ? true :
      showWindow === "overdue" ? dl < 0 :
      showWindow === "7"       ? dl >= 0 && dl <= 7 :
      showWindow === "30"      ? dl >= 0 && dl <= 30 : true;

    if (r.isRenewal) return showWindow === "all" && matchClient;
    return matchClient && matchWindow;
  });

  const groups = {};
  filtered.forEach((r) => {
    let key;
    if (r.isRenewal) {
      key = groupBy === "client" ? (r.client.TradeName || r.client.LNF || "Unknown")
          : groupBy === "period" ? r.periodType
          : "↻ Renewal pending";
    } else if (groupBy === "week") {
      const dl = r.daysLeft;
      key = dl < 0 ? "⚠ Overdue" : dl === 0 ? "Due today" : weekRangeLabel(r.nearestDeadline);
    } else if (groupBy === "client") {
      key = r.client.TradeName || r.client.LNF || "Unknown";
    } else {
      key = r.periodType;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const overdueCount  = filtered.filter((r) => !r.isRenewal && r.daysLeft < 0).length;
  const urgentCount   = filtered.filter((r) => !r.isRenewal && r.daysLeft >= 0 && r.daysLeft <= 7).length;
  const renewalCount  = filtered.filter((r) => r.isRenewal).length;

  const summaryBg = dark ? "rgba(255,255,255,0.03)" : "#F8FAFF";

  return (
    <Box>
      <Box display="flex" gap={2} mb={2.5} flexWrap="wrap">
        {[
          { label: "Overdue",           count: overdueCount,    t: S.Overdue },
          { label: "Due within 7 days", count: urgentCount,     t: S.Incomplete },
          { label: "Renewal pending",   count: renewalCount,    t: S.Incomplete },
          { label: "Total upcoming",    count: filtered.length, t: S.Upcoming },
        ].map(({ label, count, t }) => (
          <Box key={label} sx={{
            display: "flex", alignItems: "center", gap: 1.5,
            px: 2, py: 1.25, borderRadius: 2,
            bgcolor: count > 0 ? t.bg : summaryBg,
            border: "1px solid", borderColor: count > 0 ? t.border : "divider",
            minWidth: 160,
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
              <Typography fontWeight={800} fontSize="1.1rem" color={count > 0 ? t.color : "text.secondary"}>
                {count}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box display="flex" gap={1.5} mb={2.5} flexWrap="wrap" alignItems="center">
        <TextField size="small" placeholder="Search client or form…" value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)} sx={{ minWidth: 240 }}
          InputProps={{
            sx: { borderRadius: 2 },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          }} />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Group by</InputLabel>
          <Select label="Group by" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
            sx={{ borderRadius: 2 }}>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="client">Client</MenuItem>
            <MenuItem value="period">Period type</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 145 }}>
          <InputLabel>Show</InputLabel>
          <Select label="Show" value={showWindow} onChange={(e) => setShowWindow(e.target.value)}
            sx={{ borderRadius: 2 }}>
            <MenuItem value="all">All upcoming</MenuItem>
            <MenuItem value="overdue">Overdue only</MenuItem>
            <MenuItem value="7">Next 7 days</MenuItem>
            <MenuItem value="30">Next 30 days</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="caption" color="text.disabled" sx={{ ml: "auto" }}>
          {filtered.length} client{filtered.length !== 1 ? "s" : ""} with pending filings
        </Typography>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1.5, display: "block", mx: "auto" }} />
          <Typography fontWeight={700} color="text.secondary" mb={0.5}>All caught up!</Typography>
          <Typography variant="caption" color="text.disabled">
            No unfiled deadlines match your current filter.
          </Typography>
          {(searchQ || showWindow !== "all") && (
            <Box mt={2}>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}
                onClick={() => { setSearchQ(""); setShowWindow("all"); }}>
                Clear filters
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        Object.entries(groups).map(([groupLabel, rows]) => {
          const hasOverdue = rows.some((r) => r.daysLeft < 0);
          const hasUrgent  = rows.some((r) => r.daysLeft >= 0 && r.daysLeft <= 7);
          // ✅ FIXED: dot color — unfiled rows with dl > 7 now use Upcoming (red), not Complete (green)
          const dotColor   = hasOverdue ? S.Overdue.color : hasUrgent ? S.Incomplete.color : S.Upcoming.color;

          return (
            <Box key={groupLabel} mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={1.25}
                sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dotColor, flexShrink: 0 }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {groupLabel}
                </Typography>
                <Chip label={rows.length} size="small" sx={{
                  ml: 0.5, height: 18, fontSize: "0.6rem", fontWeight: 700,
                  bgcolor: dark ? "rgba(255,255,255,0.07)" : "#F3F4F6",
                  color: "text.secondary",
                }} />
              </Box>

              <Box display="flex" flexDirection="column" gap={0.75}>
                {rows.map((r) => {
                  if (r.isRenewal) {
                    const t = S.Incomplete;
                    return (
                      <Paper key={`renewal-${r.monitorId}`} elevation={0} sx={{
                        display: "flex", alignItems: "center", gap: 2,
                        px: 2, py: 1.5,
                        border: "1px solid", borderColor: t.border,
                        borderLeft: `4px solid ${t.color}`,
                        borderRadius: 2, bgcolor: t.bg,
                        transition: "box-shadow 0.1s",
                        "&:hover": { boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)" },
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
                            <Typography variant="body2" fontWeight={700} fontSize="0.88rem">
                              {r.client.TradeName || r.client.LNF || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary"
                              fontFamily="monospace" fontSize="0.68rem">
                              {r.client.ClientID}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" fontSize="0.68rem">
                              · {r.pLabel} · {r.periodType}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.75} mt={0.5}>
                            <Chip label="↻ Renewal pending" size="small" sx={{
                              height: 20, fontSize: "0.62rem", fontWeight: 700,
                              bgcolor: t.chip, color: t.color, border: `1px solid ${t.border}`,
                            }} />
                            <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                              Next period: <strong>{r.nextPeriodLabel}</strong> — no monitor record yet
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 140 }}>
                          <Typography variant="caption" fontWeight={700} color={t.color} display="block">
                            Period complete
                          </Typography>
                          <Box sx={{
                            display: "inline-flex", alignItems: "center", gap: 0.5,
                            px: 1, py: 0.25, borderRadius: 99,
                            bgcolor: t.chip, border: `1px solid ${t.border}`, mt: 0.5,
                          }}>
                            <WarningAmberIcon sx={{ fontSize: 11, color: t.color }} />
                            <Typography variant="caption" fontWeight={800} fontSize="0.65rem" color={t.color}>
                              Add next period
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  }

                  return (
                    <UnfiledCard
                      key={r.monitorId}
                      r={r}
                      dark={dark}
                      S={S}
                      onEditDetail={onEditDetail}
                    />
                  );
                })}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function FilingTracker() {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";

  const [activeTab,      setActiveTab]      = useState(0);
  const [monitors,       setMonitors]       = useState([]);
  const [clients,        setClients]        = useState([]);
  const [birForms,       setBirForms]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [formsLoading,   setFormsLoading]   = useState(true);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFS]             = useState("");
  const [filterPeriod,   setFP]             = useState("");
  const [addOpen,        setAddOpen]        = useState(false);
  const [editDetail,     setEditDetail]     = useState(null);
  const [snack,          setSnack]          = useState({ open: false, msg: "", sev: "success" });

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const birFormsRef = useRef([]);
  const pollRef     = useRef(null);

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const res = await http.get("/selectclientss");
      setClients(res?.data?.data ?? []);
    } catch {
      showSnack("Failed to load clients.", "error");
    } finally {
      setClientsLoading(false);
    }
  }, []);

  const loadBirForms = useCallback(async () => {
    setFormsLoading(true);
    try {
      const res    = await http.get("/selectbirforms");
      const merged = mergeBirForms(res?.data?.data ?? []);
      setBirForms(merged);
      birFormsRef.current = merged;
    } catch {
      setBirForms(BIR_FORMS_DB);
      birFormsRef.current = BIR_FORMS_DB;
      showSnack("Using offline BIR form list — sync when online.", "warning");
    } finally {
      setFormsLoading(false);
    }
  }, []);

  const loadMonitors = useCallback(async () => {
    try {
      const res = await http.get("/selectmonitors");
      const raw = res?.data?.data ?? [];
      setMonitors(raw.map((m) => ({
        ...m,
        OverallStatus: normalizeStatus(m.OverallStatus),
        Details: (m.Details || []).map((d) => {
          const meta = resolveFormMeta(d.FormCode, birFormsRef.current);
          const computedDeadline = computeDeadline(
            d.FormCode,
            m.PeriodYear,
            m.PeriodMonth,
            m.PeriodQuarter
          );
          return {
            ...d,
            FormName:      d.FormName      || meta.FormName,
            Category:      d.Category      || meta.Category,
            DueSchedule:   d.DueSchedule   || meta.DueSchedule,
            StartOfFiling: d.StartOfFiling || meta.StartOfFiling,
            DeadlineDate:  computedDeadline || d.DeadlineDate || "",
            CurrentStatus: deriveStatus(computedDeadline || d.DeadlineDate, d.IsFiled),
          };
        }),
      })));
    } catch {
      showSnack("Failed to load monitors.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      loadClients();
      await loadBirForms();
      loadMonitors();
    };
    init();
    pollRef.current = setInterval(loadMonitors, 5 * 60 * 1000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleAdd = async (data) => {
    try {
      await http.post("/postmonitor", data);
      showSnack("Monitor record added!");
      loadMonitors();
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message;

      if (status === 409) {
        throw new Error(
          msg || "A monitor record for this client and period already exists. Please select a different month or period."
        );
      }

      const client = clients.find((c) => c.ID === data.clientid);
      setMonitors((p) => [{
        ID: Date.now(), ClientID: data.clientid, PeriodType: data.periodtype,
        PeriodYear: data.periodyear, PeriodMonth: data.periodmonth, PeriodQuarter: data.periodquarter,
        OverallStatus: "Upcoming", Remarks: null, Client: client || {},
        Details: data.formcodes.map((code, i) => {
          const meta = resolveFormMeta(code, birFormsRef.current);
          const computedDeadline = computeDeadline(code, data.periodyear, data.periodmonth, data.periodquarter);
          return {
            ID: Date.now() + i, MonitorHdrID: Date.now(), ClientID: data.clientid,
            FormCode:      code,
            FormName:      meta.FormName,
            Category:      meta.Category,
            DueSchedule:   meta.DueSchedule,
            StartOfFiling: meta.StartOfFiling,
            DeadlineDate:  computedDeadline || data.deadlines?.[code] || "",
            IsFiled: 0, FiledDate: null, FiledBy: null, Remarks: null,
            CurrentStatus: "Upcoming",
          };
        }),
        TotalForms: data.formcodes.length, FiledCount: 0, OverdueCount: 0, ProgressPct: 0,
      }, ...p]);
      showSnack("Added locally — sync pending.", "warning");
    }
  };

  const handleSaveDetail = async (payload) => {
    try {
      await http.post("/updatemonitordtl", payload);
      showSnack("Filing updated!");
      loadMonitors();
    } catch {
      setMonitors((prev) => prev.map((m) => {
        const nd = (m.Details || []).map((d) => {
          if (d.ID !== payload.id) return d;
          return {
            ...d,
            IsFiled:       payload.isfiled ? 1 : 0,
            FiledDate:     payload.fileddate || null,
            FiledBy:       payload.filedby   || null,
            Remarks:       payload.remarks   || null,
            CurrentStatus: deriveStatus(d.DeadlineDate, payload.isfiled),
          };
        });
        const filed = nd.filter((d) => d.IsFiled).length;
        const ov    = nd.filter((d) => d.CurrentStatus === "Overdue").length;
        const pct   = nd.length ? Math.round((filed / nd.length) * 100) : 0;
        const st    = filed === nd.length && nd.length > 0 ? "Complete"
                    : ov > 0 ? "Overdue" : filed > 0 ? "Incomplete" : "Upcoming";
        return { ...m, Details: nd, FiledCount: filed, OverdueCount: ov, ProgressPct: pct, OverallStatus: st };
      }));
      showSnack("Updated locally — sync pending.", "warning");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this monitor record and all its filing details?")) return;
    try {
      await http.delete(`/deletemonitor?id=${id}`);
      showSnack("Deleted.");
      loadMonitors();
    } catch {
      setMonitors((p) => p.filter((m) => m.ID !== id));
      showSnack("Deleted locally — sync pending.", "warning");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Client","ClientID","Period","Type","Filed","Total","Progress%","Overdue","Status"],
      ...monitors.map((m) => [
        m.Client?.TradeName || "", m.Client?.ClientID || "",
        periodLabel(m), m.PeriodType, m.FiledCount, m.TotalForms,
        m.ProgressPct, m.OverdueCount, m.OverallStatus,
      ]),
    ];
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," +
      encodeURIComponent(rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n"));
    a.download = `bir-monitor-${fmtISO(getToday())}.csv`;
    a.click();
  };

  const filtered = monitors.filter((m) => {
    const q = search.toLowerCase();
    const c = m.Client || {};
    return (
      (!q || (c.TradeName || "").toLowerCase().includes(q)
          || (c.LNF       || "").toLowerCase().includes(q)
          || (c.ClientID  || "").toLowerCase().includes(q)) &&
      (!filterStatus || m.OverallStatus === filterStatus) &&
      (!filterPeriod  || m.PeriodType   === filterPeriod)
    );
  });

  const counts = {
    Complete:      monitors.filter((m) => m.OverallStatus === "Complete").length,
    Incomplete:    monitors.filter((m) => m.OverallStatus === "Incomplete").length,
    "Not Filed":   monitors.filter((m) => m.OverallStatus === "Overdue").length,
    "To Be Filed": monitors.filter((m) => m.OverallStatus === "Upcoming").length,
  };
  const labelToStatus = {
    Complete:      "Complete",
    Incomplete:    "Incomplete",
    "Not Filed":   "Overdue",
    "To Be Filed": "Upcoming",
  };
  const labelToColor = {
    Complete:      "Complete",
    Incomplete:    "Incomplete",
    "Not Filed":   "Overdue",
    "To Be Filed": "Upcoming",
  };

  const existingKeys = new Set(
    monitors.map((m) =>
      `${m.ClientID}-${m.PeriodType}-${m.PeriodYear}-${m.PeriodMonth ?? 0}-${m.PeriodQuarter ?? 0}`
    )
  );

  const theadBg        = dark ? palette.background.default : "#F8FAFF";
  const addBtnDisabled = clientsLoading || formsLoading;

  const nextFilingsBadge = buildNextFilings(monitors, existingKeys)
    .filter((r) => r.isRenewal || r.daysLeft <= 7).length;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box>
          <Typography fontWeight={800} fontSize="1.4rem" letterSpacing="-0.5px">
            BIR Filing Monitor
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Track filings by client and period · Click any row to expand · Refreshes every 5 min
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <NotificationBell monitors={monitors} />
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => { loadMonitors(); loadClients(); loadBirForms(); }}
              sx={{ width: 38, height: 38, border: "1px solid", borderColor: "divider" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportCSV}
            sx={{ height: 38, borderRadius: 2, borderColor: "divider", color: "text.secondary" }}>
            Export CSV
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)} disabled={addBtnDisabled}
            sx={{ height: 38, borderRadius: 2 }}>
            {addBtnDisabled ? "Loading…" : "Add Monitor"}
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTab-root": { minHeight: 44, textTransform: "none", fontWeight: 600, fontSize: "0.88rem" },
        }}
      >
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              Filing Monitor
              <Chip label={monitors.length} size="small" sx={{
                height: 18, fontSize: "0.6rem", fontWeight: 700,
                bgcolor: dark ? "rgba(255,255,255,0.08)" : "#F3F4F6",
                color: "text.secondary",
              }} />
            </Box>
          }
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <EventIcon sx={{ fontSize: 16 }} />
              Next Filings
              {nextFilingsBadge > 0 && (
                <Chip label={nextFilingsBadge} size="small" color="warning" sx={{
                  height: 18, fontSize: "0.6rem", fontWeight: 700,
                }} />
              )}
            </Box>
          }
        />
      </Tabs>

      {/* Tab: Filing Monitor */}
      {activeTab === 0 && (
        <>
          <Box display="flex" gap={1.5} mb={2.5} flexWrap="wrap" alignItems="center">
            <FilterListIcon sx={{ fontSize: 20, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled" fontWeight={700} sx={{ mr: 0.5 }}>Filter:</Typography>
            {Object.entries(counts).map(([label, count]) => {
              const colorKey = labelToColor[label];
              const t        = S[colorKey];
              const active   = filterStatus === labelToStatus[label];
              return (
                <Box key={label} onClick={() => setFS(active ? "" : labelToStatus[label])} sx={{
                  display: "inline-flex", alignItems: "center", gap: 1,
                  px: 2, py: 1, borderRadius: 99, cursor: "pointer", userSelect: "none",
                  border: "2px solid", transition: "all 0.15s",
                  bgcolor: active ? t.chip : "background.paper",
                  borderColor: active ? t.color : "divider",
                  "&:hover": { borderColor: t.color, bgcolor: t.chip },
                }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: t.color }} />
                  <Typography variant="body2" fontWeight={700} fontSize="0.88rem"
                    color={active ? t.color : "text.secondary"}>
                    {label}
                  </Typography>
                  <Box sx={{ px: 0.9, py: 0.2, borderRadius: 1,
                    bgcolor: active ? t.color : dark ? "rgba(255,255,255,0.08)" : "#F3F4F6" }}>
                    <Typography variant="caption" fontWeight={800} fontSize="0.75rem"
                      color={active ? "white" : "text.secondary"}>
                      {count}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            {filterStatus && (
              <Button size="small" onClick={() => setFS("")}
                sx={{ color: "text.secondary", fontSize: "0.72rem", py: 0.25, px: 1, borderRadius: 99 }}>
                × Clear
              </Button>
            )}
          </Box>

          <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
            <TextField size="small" placeholder="Search by client name or ID…" value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 260 }}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }} />
            <FormControl size="small" sx={{ minWidth: 145 }}>
              <InputLabel>Period Type</InputLabel>
              <Select label="Period Type" value={filterPeriod} onChange={(e) => setFP(e.target.value)}
                sx={{ borderRadius: 2 }}>
                <MenuItem value="">All Periods</MenuItem>
                {["Monthly","Quarterly","Annual"].map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.disabled" sx={{ ml: "auto" }}>
              Showing {filtered.length} of {monitors.length} records
              {!clientsLoading && ` · ${clients.length} clients`}
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theadBg }}>
                  <TableCell sx={{ width: 48, borderBottom: "2px solid", borderColor: "divider" }} />
                  <TableCell sx={{ width: 36, fontWeight: 700, fontSize: "0.7rem", color: "text.disabled",
                    borderBottom: "2px solid", borderColor: "divider" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem",
                    borderBottom: "2px solid", borderColor: "divider" }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem",
                    borderBottom: "2px solid", borderColor: "divider" }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem",
                    borderBottom: "2px solid", borderColor: "divider" }}>BIR Forms</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", minWidth: 170,
                    borderBottom: "2px solid", borderColor: "divider" }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem",
                    borderBottom: "2px solid", borderColor: "divider" }}>Status</TableCell>
                  <TableCell sx={{ width: 52, borderBottom: "2px solid", borderColor: "divider" }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <TableCell key={j} sx={{ py: 1.5 }}>
                            <Skeleton height={28} sx={{ borderRadius: 1 }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filtered.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1.5, display: "block", mx: "auto" }} />
                          <Typography fontWeight={700} color="text.secondary" mb={0.5}>No records found</Typography>
                          <Typography variant="caption" color="text.disabled">
                            Try adjusting your search or status filter
                          </Typography>
                          {(search || filterStatus || filterPeriod) && (
                            <Box mt={2}>
                              <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}
                                onClick={() => { setSearch(""); setFS(""); setFP(""); }}>
                                Clear all filters
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                    : filtered.map((m, i) => (
                      <MonitorRow
                        key={m.ID}
                        monitor={m}
                        rowNum={i + 1}
                        existingKeys={existingKeys}
                        onEditDetail={setEditDetail}
                        onDelete={handleDelete}
                      />
                    ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Tab: Next Filings */}
      {activeTab === 1 && (
        <NextFilingsTab
          monitors={monitors}
          existingKeys={existingKeys}
          onEditDetail={setEditDetail}
        />
      )}

      {/* Dialogs */}
      <AddMonitorDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        clients={clients}
        birForms={birForms}
      />
      <EditDetailDialog
        open={Boolean(editDetail)}
        detail={editDetail}
        onClose={() => setEditDetail(null)}
        onSave={handleSaveDetail}
      />

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}