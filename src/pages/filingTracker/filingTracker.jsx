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
  Stack, useTheme,
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
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RefreshIcon              from "@mui/icons-material/Refresh";
import SaveIcon                 from "@mui/icons-material/Save";
import CalendarTodayIcon        from "@mui/icons-material/CalendarToday";
import FilterListIcon           from "@mui/icons-material/FilterList";
import { http }                 from "../../api/http";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const TODAY    = new Date(); TODAY.setHours(0, 0, 0, 0);
const fmtISO   = (d) => d.toISOString().slice(0, 10);
const addDays  = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDate  = (s) => !s ? "—" : new Date(s).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const daysLeft = (s) => { const d = new Date(s); d.setHours(0,0,0,0); return Math.ceil((d - TODAY) / 86400000); };

const periodLabel = (hdr) => {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (hdr.PeriodType === "Monthly")   return `${M[(hdr.PeriodMonth||1)-1]} ${hdr.PeriodYear}`;
  if (hdr.PeriodType === "Quarterly") return `Q${hdr.PeriodQuarter} ${hdr.PeriodYear}`;
  return String(hdr.PeriodYear);
};

const deriveStatus = (deadlineDate, isFiled) => {
  if (isFiled) return "Filed";
  const dl = daysLeft(deadlineDate);
  return dl < 0 ? "Overdue" : dl <= 7 ? "Pending" : "Upcoming";
};

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
    Pending: {
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

const ALL_FORMS = [
  { code: "1700",    name: "Annual ITR – Compensation",         cat: "Income Tax",      due: "April 15"         },
  { code: "1701",    name: "Annual ITR – Self-Employed",        cat: "Income Tax",      due: "April 15"         },
  { code: "1701A",   name: "Annual ITR – Business",             cat: "Income Tax",      due: "April 15"         },
  { code: "1701Q",   name: "Quarterly ITR – Self-Employed",     cat: "Income Tax",      due: "Quarterly"        },
  { code: "1702-RT", name: "Annual ITR – Corp (Regular)",       cat: "Income Tax",      due: "April 15"         },
  { code: "1702Q",   name: "Quarterly ITR – Corp",              cat: "Income Tax",      due: "Quarterly"        },
  { code: "1601-C",  name: "Monthly WHT – Compensation",        cat: "Withholding Tax", due: "10th/month"       },
  { code: "1601-EQ", name: "Quarterly WHT – Creditable",        cat: "Withholding Tax", due: "Last day Qtr"     },
  { code: "1601-FQ", name: "Quarterly WHT – Final",             cat: "Withholding Tax", due: "Last day Qtr"     },
  { code: "1604-C",  name: "Annual Info – Compensation",        cat: "Withholding Tax", due: "Jan 31"           },
  { code: "2316",    name: "Cert of Compensation/Tax Withheld", cat: "Withholding Tax", due: "Jan 31"           },
  { code: "2307",    name: "Cert – Creditable WHT",             cat: "Withholding Tax", due: "Per quarter"      },
  { code: "2550M",   name: "Monthly VAT Declaration",           cat: "VAT",             due: "20th/month"       },
  { code: "2550Q",   name: "Quarterly VAT Return",              cat: "VAT",             due: "25th last mo Qtr" },
  { code: "2551Q",   name: "Quarterly Percentage Tax",          cat: "Percentage Tax",  due: "25th last mo Qtr" },
  { code: "1801",    name: "Estate Tax Return",                 cat: "Estate & Donor",  due: "1 yr from death"  },
  { code: "0605",    name: "Payment Form",                      cat: "Payment",         due: "As needed"        },
];

const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QUARTERS = ["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"];

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status, size = "small" }) {
  const S = useStatusColors();
  const t = S[status] || S.Upcoming;
  const fs = size === "small" ? 13 : 15;
  const icon = {
    Complete:      <CheckCircleIcon sx={{ fontSize: fs }} />,
    Overdue:       <ErrorIcon sx={{ fontSize: fs }} />,
    Pending:       <WarningAmberIcon sx={{ fontSize: fs }} />,
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
    (m.Details||[]).filter((d) => !d.IsFiled && daysLeft(d.DeadlineDate) <= 7)
      .map((d) => ({ ...d, dl: daysLeft(d.DeadlineDate), monitor: m }))
  ).sort((a, b) => a.dl - b.dl);

  const overdueCount = notifs.filter((n) => n.dl < 0).length;
  const pendingColor = S.Pending.color;
  const pendingBg    = S.Pending.bg;

  return (
    <>
      <Tooltip title="Deadline Alerts">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{
          width: 38, height: 38, border: "1px solid",
          borderColor: notifs.length > 0 ? pendingColor : "divider",
          bgcolor: notifs.length > 0 ? pendingBg : "background.paper",
        }}>
          <Badge badgeContent={notifs.length} color={overdueCount > 0 ? "error" : "warning"}
            sx={{ "& .MuiBadge-badge": { fontSize: "0.58rem", minWidth: 15, height: 15 } }}>
            <NotificationsIcon fontSize="small" sx={{ color: notifs.length > 0 ? pendingColor : "text.secondary" }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: {
          width: 370, maxHeight: 460, display: "flex", flexDirection: "column",
          boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.14)",
          borderRadius: 2.5,
        }}}>
        <Box sx={{
          px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1,
          bgcolor: notifs.length > 0 ? pendingBg : "background.default",
          borderBottom: "1px solid", borderColor: "divider",
        }}>
          <NotificationsIcon fontSize="small" sx={{ color: pendingColor }} />
          <Typography fontWeight={700} fontSize="0.9rem">Deadline Alerts</Typography>
          {overdueCount > 0 && <Chip label={`${overdueCount} overdue`} size="small" color="error"
            sx={{ ml: 0.5, fontWeight: 700, fontSize: "0.62rem", height: 18 }} />}
          <Chip label={notifs.length} size="small"
            sx={{ ml: "auto", fontWeight: 700, fontSize: "0.62rem", height: 18,
              bgcolor: S.Pending.chip, color: pendingColor, border: `1px solid ${S.Pending.border}` }} />
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
            const t    = isOv ? S.Overdue : S.Pending;
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
  const S = useStatusColors();
  const { palette } = useTheme();
  const dark = palette.mode === "dark";

  const [isfiled,   setIsFiled]   = useState(false);
  const [fileddate, setFiledDate] = useState("");
  const [filedby,   setFiledBy]   = useState("");
  const [remarks,   setRemarks]   = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (detail) {
      setIsFiled(!!detail.IsFiled);
      setFiledDate(detail.FiledDate ? detail.FiledDate.slice(0,10) : "");
      setFiledBy(detail.FiledBy || "");
      setRemarks(detail.Remarks || "");
    }
  }, [detail]);

  if (!detail) return null;
  const dl   = daysLeft(detail.DeadlineDate);
  const isOv = dl < 0;
  const isCr = dl >= 0 && dl <= 3;
  const tc   = isOv ? S.Overdue : isCr ? S.Pending : S.Complete;

  const indigoBg     = dark ? "rgba(99,102,241,0.15)" : "#EEF2FF";
  const indigoBorder = dark ? "rgba(99,102,241,0.35)" : "#C7D2FE";
  const indigoColor  = dark ? "#A5B4FC"               : "#4338CA";

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
          <Box sx={{ px: 1.25, py: 0.4, borderRadius: 1,
            bgcolor: indigoBg, border: `1px solid ${indigoBorder}` }}>
            <Typography fontFamily="monospace" fontWeight={800} fontSize="0.85rem" color={indigoColor}>
              {detail.FormCode}
            </Typography>
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize="0.95rem" lineHeight={1.2}>{detail.FormName}</Typography>
            <Typography variant="caption" color="text.secondary">{detail.Category}</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ p: 2, borderRadius: 2, mb: 2.5, border: "1px solid",
          bgcolor: tc.bg, borderColor: tc.border,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            if (next && !fileddate) setFiledDate(fmtISO(TODAY));
            if (!next) { setFiledDate(""); setFiledBy(""); }
          }}>
          <FormControlLabel
            control={<Checkbox checked={isfiled} color="success"
              onChange={() => {}} onClick={(e) => e.stopPropagation()} />}
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
              <TextField fullWidth size="small" label="Filed By" placeholder="e.g. admin"
                value={filedby} onChange={(e) => setFiledBy(e.target.value)} />
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
// ADD MONITOR DIALOG
// ─────────────────────────────────────────────────────────────
function AddMonitorDialog({ open, onClose, onAdd, clients }) {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";

  const [clientid,     setClientId]     = useState("");
  const [periodtype,   setPeriodType]   = useState("Monthly");
  const [periodyear,   setPeriodYear]   = useState(new Date().getFullYear());
  const [pmonth,       setPMonth]       = useState(new Date().getMonth() + 1);
  const [pqtr,         setPQtr]         = useState(1);
  const [selected,     setSelected]     = useState([]);
  const [err,          setErr]          = useState("");
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => { if (open) { setClientId(""); setErr(""); setClientSearch(""); } }, [open]);
  useEffect(() => {
    const presets = {
      Monthly:   ["1601-C","2550M","0605"],
      Quarterly: ["1601-EQ","1601-FQ","2550Q","2551Q","1702Q"],
      Annual:    ["1700","1701","1701A","1702-RT","1604-C","2316"],
    };
    setSelected(presets[periodtype] || []);
  }, [periodtype]);

  const cats      = [...new Set(ALL_FORMS.map((f) => f.cat))];
  const toggle    = (code) => setSelected((p) => p.includes(code) ? p.filter((c) => c !== code) : [...p, code]);
  const toggleCat = (cat) => {
    const codes  = ALL_FORMS.filter((f) => f.cat === cat).map((f) => f.code);
    const allSel = codes.every((c) => selected.includes(c));
    setSelected((p) => allSel ? p.filter((c) => !codes.includes(c)) : [...new Set([...p, ...codes])]);
  };

  const filteredClients = (clients||[]).filter((c) => {
    const q = clientSearch.toLowerCase();
    return !q || (c.TradeName||"").toLowerCase().includes(q)
              || (c.LNF||"").toLowerCase().includes(q)
              || (c.ClientID||"").toLowerCase().includes(q);
  });

  const codeBg     = dark ? "rgba(251,191,36,0.15)" : "#FEF9C3";
  const codeColor  = dark ? "#FCD34D"               : "#B45309";

  const handleAdd = () => {
    if (!clientid)        return setErr("Please select a client.");
    if (!selected.length) return setErr("Select at least one BIR form.");
    onAdd({ clientid: Number(clientid), periodtype, periodyear: Number(periodyear),
      periodmonth: periodtype === "Monthly" ? Number(pmonth) : null,
      periodquarter: periodtype === "Quarterly" ? Number(pqtr) : null,
      formcodes: selected });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
        <Typography fontWeight={800} fontSize="1.05rem">Add Monitor Record</Typography>
        <Typography variant="body2" color="text.secondary">
          Set up a BIR filing period for a client — deadlines are auto-computed.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {err && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{err}</Alert>}

        <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase",
          letterSpacing: "0.08em", color: "text.secondary", display: "block", mb: 1 }}>
          Period Setup
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" select label="Client *" value={clientid}
              onChange={(e) => setClientId(e.target.value)}
              SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}>
              <Box sx={{ px: 1.5, py: 1, position: "sticky", top: 0, bgcolor: "background.paper", zIndex: 1 }}>
                <TextField size="small" fullWidth placeholder="Search client…" value={clientSearch}
                  onChange={(e) => { e.stopPropagation(); setClientSearch(e.target.value); }}
                  onKeyDown={(e) => e.stopPropagation()}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> }} />
              </Box>
              {filteredClients.length === 0 && <MenuItem disabled><Typography variant="caption" color="text.disabled">No clients found</Typography></MenuItem>}
              {filteredClients.map((c) => (
                <MenuItem key={c.ID} value={c.ID}>
                  <Typography variant="body2" fontWeight={600}>{c.TradeName || c.LNF}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {c.ClientID}{c.Type ? ` · ${c.Type}` : ""}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth size="small" select label="Period Type *" value={periodtype}
              onChange={(e) => setPeriodType(e.target.value)}>
              {["Monthly","Quarterly","Annual"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth size="small" label="Year *" type="number" value={periodyear}
              onChange={(e) => setPeriodYear(e.target.value)} inputProps={{ min: 2020, max: 2030 }} />
          </Grid>
          {periodtype === "Monthly" && (
            <Grid item xs={6} md={2}>
              <TextField fullWidth size="small" select label="Month *" value={pmonth}
                onChange={(e) => setPMonth(e.target.value)}>
                {MONTHS.map((m, i) => <MenuItem key={i+1} value={i+1}>{m}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodtype === "Quarterly" && (
            <Grid item xs={6} md={2}>
              <TextField fullWidth size="small" select label="Quarter *" value={pqtr}
                onChange={(e) => setPQtr(e.target.value)}>
                {QUARTERS.map((q, i) => <MenuItem key={i+1} value={i+1}>{q}</MenuItem>)}
              </TextField>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase",
            letterSpacing: "0.08em", color: "text.secondary" }}>
            BIR Forms to Monitor
          </Typography>
          <Chip label={`${selected.length} selected`} size="small" color="primary"
            sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
          <Typography variant="caption" color="text.disabled">(auto-selected by period type)</Typography>
        </Box>

        {cats.map((cat) => {
          const catForms = ALL_FORMS.filter((f) => f.cat === cat);
          const allSel   = catForms.every((f) => selected.includes(f.code));
          return (
            <Box key={cat} mb={2}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box sx={{ width: 3, height: 14, borderRadius: 1, bgcolor: "primary.main" }} />
                <Typography variant="caption" fontWeight={700} color="primary.main"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {cat}
                </Typography>
                <Button size="small" sx={{ fontSize: "0.62rem", py: 0, minWidth: 0, color: "text.secondary",
                  textDecoration: "underline", "&:hover": { bgcolor: "transparent" } }}
                  onClick={() => toggleCat(cat)}>
                  {allSel ? "Deselect all" : "Select all"}
                </Button>
              </Box>
              <Grid container>
                {catForms.map((f) => (
                  <Grid item xs={12} sm={6} key={f.code}>
                    <FormControlLabel
                      control={<Checkbox size="small" color="primary" checked={selected.includes(f.code)}
                        onChange={() => toggle(f.code)} />}
                      label={
                        <Typography variant="caption">
                          <Box component="span" fontFamily="monospace" fontWeight={800}
                            sx={{ color: codeColor, bgcolor: codeBg, px: 0.5, borderRadius: 0.5 }}>
                            {f.code}
                          </Box>
                          {" "}{f.name}{" "}
                          <Box component="span" color="text.disabled">· {f.due}</Box>
                        </Typography>
                      }
                      sx={{ m: 0, py: 0.3 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} startIcon={<AddIcon />}
          sx={{ borderRadius: 2, px: 3 }}>
          Add Monitor
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
  const cats        = [...new Set((monitor.Details||[]).map((d) => d.Category))];

  const panelBg    = dark ? palette.background.default : "#F8FAFF";
  const panelBorder = dark ? palette.divider : "#E8EDFF";
  const cardBg     = dark ? palette.background.paper : "#FFFFFF";
  const rowBorder  = dark ? palette.divider : "#E5E7EB";

  return (
    <Box sx={{ bgcolor: panelBg, borderTop: `2px solid ${panelBorder}`, p: 3 }}>
      {/* Quick stats bar */}
      <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 2,
          bgcolor: cardBg, border: `1px solid ${rowBorder}`, minWidth: 120 }}>
          <CheckCircleIcon sx={{ color: S.Complete.color, fontSize: 20 }} />
          <Box>
            <Typography fontSize="0.65rem" color="text.secondary">Filed</Typography>
            <Typography fontWeight={800} fontSize="1rem" color={S.Complete.color}>
              {monitor.FiledCount}/{monitor.TotalForms}
            </Typography>
          </Box>
        </Box>

        {monitor.OverdueCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 2,
            bgcolor: S.Overdue.bg, border: `1px solid ${S.Overdue.border}`, minWidth: 100 }}>
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
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: S.Pending.bg, border: `1px solid ${S.Pending.border}`, maxWidth: 240 }}>
            <Typography variant="caption" color="text.secondary" display="block">Remarks</Typography>
            <Typography variant="caption" color="text.primary">{monitor.Remarks}</Typography>
          </Box>
        )}
      </Box>

      {/* Form rows by category */}
      {cats.map((cat) => {
        const rows = (monitor.Details||[]).filter((d) => d.Category === cat);
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
                const st     = deriveStatus(d.DeadlineDate, d.IsFiled);
                const dl     = daysLeft(d.DeadlineDate);
                const tc     = S[st === "Filed" ? "Complete" : st] || S.Upcoming;
                const isLast = idx === rows.length - 1;

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

                    <Typography variant="caption" color="text.secondary" sx={{
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {d.FormName}
                    </Typography>

                    <Box sx={{ textAlign: "right", minWidth: 130, flexShrink: 0 }}>
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
                            Due {fmtDate(d.DeadlineDate)}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} fontSize="0.6rem" color={tc.color}>
                            {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? "Due today!" : `${dl}d left`}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Box sx={{ minWidth: 90, flexShrink: 0 }}>
                      <StatusBadge status={d.IsFiled ? "Filed" : st} />
                    </Box>

                    <Tooltip title="Edit filing status">
                      <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: "13px !important" }} />}
                        onClick={() => onEditDetail(d)}
                        sx={{ borderRadius: 1.5, fontSize: "0.68rem", py: 0.4, px: 1.25, flexShrink: 0,
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
function MonitorRow({ monitor, rowNum, onEditDetail, onDelete }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";
  const [open, setOpen] = useState(false);

  const client     = monitor.Client || {};
  const pct        = monitor.ProgressPct || 0;
  const t          = S[monitor.OverallStatus] || S.Upcoming;
  const isComplete = monitor.OverallStatus === "Complete";
  const isOverdue  = monitor.OverallStatus === "Overdue";

  const rowBg      = isComplete ? S.Complete.bg : isOverdue ? S.Overdue.bg : "inherit";
  const rowHoverBg = isComplete ? S.Complete.chip : isOverdue ? S.Overdue.chip :
                     dark ? "rgba(255,255,255,0.04)" : "#F5F8FF";

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
            sx={{ color: open ? "primary.main" : "text.secondary",
              bgcolor: open ? expandActiveBg : "transparent", borderRadius: 1.5 }}>
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
        </TableCell>

        <TableCell sx={{ py: 1.75 }}>
          <Box display="flex" flexWrap="wrap" gap={0.4}>
            {(monitor.Details||[]).slice(0, 6).map((d) => {
              const st = deriveStatus(d.DeadlineDate, d.IsFiled);
              const ft = S[st === "Filed" ? "Complete" : st] || S.Upcoming;
              return (
                <Chip key={d.FormCode} label={d.FormCode} size="small" sx={{
                  fontSize: "0.6rem", height: 20, fontFamily: "monospace", fontWeight: 700,
                  bgcolor: ft.chip, color: ft.color, border: `1px solid ${ft.border}`,
                }} />
              );
            })}
            {(monitor.Details?.length||0) > 6 && (
              <Chip label={`+${monitor.Details.length-6} more`} size="small"
                sx={{ fontSize: "0.6rem", height: 20,
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
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function FilingTracker() {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";

  const [monitors,       setMonitors]       = useState([]);
  const [clients,        setClients]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFS]             = useState("");
  const [filterPeriod,   setFP]             = useState("");
  const [addOpen,        setAddOpen]        = useState(false);
  const [editDetail,     setEditDetail]     = useState(null);
  const [snack,          setSnack]          = useState({ open: false, msg: "", sev: "success" });
  const pollRef = useRef(null);

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try { const res = await http.get("/selectclientss"); setClients(res?.data?.data ?? []); }
    catch { showSnack("Failed to load clients.", "error"); }
    finally { setClientsLoading(false); }
  }, []);

  const loadMonitors = useCallback(async () => {
    try {
      const res = await http.get("/selectmonitors");
      const raw = res?.data?.data ?? [];
      setMonitors(raw.map((m) => ({
        ...m,
        Details: (m.Details||[]).map((d) => ({ ...d, CurrentStatus: deriveStatus(d.DeadlineDate, d.IsFiled) })),
      })));
    } catch { showSnack("Failed to load monitors.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadClients(); loadMonitors();
    pollRef.current = setInterval(loadMonitors, 5 * 60 * 1000);
    return () => clearInterval(pollRef.current);
  }, [loadClients, loadMonitors]);

  const handleAdd = async (data) => {
    try { await http.post("/postmonitor", data); showSnack("Monitor record added!"); loadMonitors(); }
    catch {
      const fm = (code) => ALL_FORMS.find((f) => f.code === code);
      const client = clients.find((c) => c.ID === data.clientid);
      const deadline = fmtISO(addDays(TODAY, 14));
      setMonitors((p) => [{
        ID: Date.now(), ClientID: data.clientid, PeriodType: data.periodtype,
        PeriodYear: data.periodyear, PeriodMonth: data.periodmonth, PeriodQuarter: data.periodquarter,
        OverallStatus: "Upcoming", Remarks: null, Client: client||{},
        Details: data.formcodes.map((code, i) => ({
          ID: Date.now()+i, MonitorHdrID: Date.now(), ClientID: data.clientid,
          FormCode: code, FormName: fm(code)?.name||code, Category: fm(code)?.cat||"Other",
          DueSchedule: fm(code)?.due||"—", DeadlineDate: deadline,
          IsFiled: 0, FiledDate: null, FiledBy: null, Remarks: null,
          CurrentStatus: "Upcoming",
        })),
        TotalForms: data.formcodes.length, FiledCount: 0, OverdueCount: 0, ProgressPct: 0,
      }, ...p]);
      showSnack("Added locally — sync pending.");
    }
  };

  const handleSaveDetail = async (payload) => {
    try { await http.post("/updatemonitordtl", payload); showSnack("Filing updated!"); loadMonitors(); }
    catch {
      setMonitors((prev) => prev.map((m) => {
        const nd = (m.Details||[]).map((d) => {
          if (d.ID !== payload.id) return d;
          return { ...d, IsFiled: payload.isfiled?1:0, FiledDate: payload.fileddate||null,
            FiledBy: payload.filedby||null, Remarks: payload.remarks||null,
            CurrentStatus: deriveStatus(d.DeadlineDate, payload.isfiled) };
        });
        const filed = nd.filter((d) => d.IsFiled).length;
        const ov    = nd.filter((d) => d.CurrentStatus==="Overdue").length;
        const pct   = nd.length ? Math.round((filed/nd.length)*100) : 0;
        const st    = filed===nd.length&&nd.length>0?"Complete":ov>0?"Overdue":filed>0?"Pending":"Upcoming";
        return { ...m, Details: nd, FiledCount: filed, OverdueCount: ov, ProgressPct: pct, OverallStatus: st };
      }));
      showSnack("Updated locally — sync pending.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this monitor record and all its filing details?")) return;
    try { await http.delete(`/deletemonitor?id=${id}`); showSnack("Deleted."); loadMonitors(); }
    catch { setMonitors((p) => p.filter((m) => m.ID !== id)); showSnack("Deleted locally — sync pending."); }
  };

  const exportCSV = () => {
    const rows = [
      ["Client","ClientID","Period","Type","Filed","Total","Progress%","Overdue","Status"],
      ...monitors.map((m) => [m.Client?.TradeName||"", m.Client?.ClientID||"", periodLabel(m),
        m.PeriodType, m.FiledCount, m.TotalForms, m.ProgressPct, m.OverdueCount, m.OverallStatus]),
    ];
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n"));
    a.download = `bir-monitor-${fmtISO(TODAY)}.csv`; a.click();
  };

  const filtered = monitors.filter((m) => {
    const q = search.toLowerCase(), c = m.Client||{};
    return (
      (!q || (c.TradeName||"").toLowerCase().includes(q) || (c.LNF||"").toLowerCase().includes(q) || (c.ClientID||"").toLowerCase().includes(q)) &&
      (!filterStatus || m.OverallStatus===filterStatus) &&
      (!filterPeriod  || m.PeriodType===filterPeriod)
    );
  });

  // ── Counter pills: Complete, Not Filed (Overdue), To Be Filled (Upcoming) ──
  const counts = {
    Complete:      monitors.filter((m) => m.OverallStatus === "Complete").length,
    "Not Filed":   monitors.filter((m) => m.OverallStatus === "Overdue").length,
    "To Be Filed": monitors.filter((m) => m.OverallStatus === "Upcoming").length,
  };

  // Map display label → actual OverallStatus value for filtering
  const labelToStatus = {
    Complete:      "Complete",
    "Not Filed":   "Overdue",
    "To Be Filed": "Upcoming",
  };

  // Map display label → color palette key
  const labelToColor = {
    Complete:      "Complete",
    "Not Filed":   "Overdue",
    "To Be Filed": "Upcoming",
  };

  const theadBg = dark ? palette.background.default : "#F8FAFF";

  return (
    <Box>
      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
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
            <IconButton size="small" onClick={() => { loadMonitors(); loadClients(); }}
              sx={{ width: 38, height: 38, border: "1px solid", borderColor: "divider" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportCSV}
            sx={{ height: 38, borderRadius: 2, borderColor: "divider", color: "text.secondary" }}>
            Export CSV
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)} disabled={clientsLoading}
            sx={{ height: 38, borderRadius: 2 }}>
            {clientsLoading ? "Loading…" : "Add Monitor"}
          </Button>
        </Stack>
      </Box>

      {/* ── Clickable status filter pills ── */}
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
              <Typography variant="body2" fontWeight={700} fontSize="0.88rem" color={active ? t.color : "text.secondary"}>
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

      {/* ── Search + period filter ── */}
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
        <TextField size="small" placeholder="Search by client name or ID…" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 260 }}
          InputProps={{ sx: { borderRadius: 2 },
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 145 }}>
          <InputLabel>Period Type</InputLabel>
          <Select label="Period Type" value={filterPeriod} onChange={(e) => setFP(e.target.value)}
            sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Periods</MenuItem>
            {["Monthly","Quarterly","Annual"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.disabled" sx={{ ml: "auto" }}>
          Showing {filtered.length} of {monitors.length} records
          {!clientsLoading && ` · ${clients.length} clients`}
        </Typography>
      </Box>

      {/* ── Table ── */}
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
                  <MonitorRow key={m.ID} monitor={m} rowNum={i+1}
                    onEditDetail={setEditDetail} onDelete={handleDelete} />
                ))
            }
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Dialogs ── */}
      <AddMonitorDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} clients={clients} />
      <EditDetailDialog open={Boolean(editDetail)} detail={editDetail}
        onClose={() => setEditDetail(null)} onSave={handleSaveDetail} />

      {/* ── Snackbar ── */}
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