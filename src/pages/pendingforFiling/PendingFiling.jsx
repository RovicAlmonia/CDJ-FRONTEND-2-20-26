// ============================================================
// pages/pendingFiling/PendingFiling.jsx
// Pending for Filing — visually identical to FilingTracker.jsx
// PDF export is fully client-side via jsPDF + jspdf-autotable
// Run once: npm install jspdf jspdf-autotable
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Chip, IconButton, Button, TextField,
  InputAdornment, Snackbar, Alert, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Checkbox,
  CircularProgress, Stack, useTheme, Grid, Tooltip, Collapse,
  LinearProgress,
} from "@mui/material";
import KeyboardArrowDownIcon  from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon    from "@mui/icons-material/KeyboardArrowUp";
import RefreshIcon            from "@mui/icons-material/Refresh";
import SaveIcon               from "@mui/icons-material/Save";
import SearchIcon             from "@mui/icons-material/Search";
import EditIcon               from "@mui/icons-material/Edit";
import ErrorIcon              from "@mui/icons-material/Error";
import WarningAmberIcon       from "@mui/icons-material/WarningAmber";
import CheckCircleIcon        from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarTodayIcon      from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon       from "@mui/icons-material/PictureAsPdf";
import FilterListIcon         from "@mui/icons-material/FilterList";
import jsPDF                  from "jspdf";
import autoTable              from "jspdf-autotable";
import { http }               from "../../api/http";

// ─────────────────────────────────────────────────────────────
// BIR FORM MAP
// ─────────────────────────────────────────────────────────────
const BIR_FORM_MAP = {
  "1700":    { name:"Annual ITR – Compensation Income",            cat:"Income Tax",      due:"April 15",                       start:"January 1" },
  "1701":    { name:"Annual ITR – Self-Employed / Estates",        cat:"Income Tax",      due:"April 15",                       start:"January 1" },
  "1701A":   { name:"Annual ITR – Business / Profession",          cat:"Income Tax",      due:"April 15",                       start:"January 1" },
  "1701Q":   { name:"Quarterly ITR – Self-Employed",              cat:"Income Tax",      due:"May 15, Aug 15, Nov 15",         start:"1st day after quarter ends" },
  "1702-RT": { name:"Annual ITR – Corporation (Regular)",         cat:"Income Tax",      due:"15th of 4th mo. after FY end",   start:"1st day of 4th month after FY end" },
  "1702-EX": { name:"Annual ITR – Corporation (Exempt)",          cat:"Income Tax",      due:"15th of 4th mo. after FY end",   start:"1st day of 4th month after FY end" },
  "1702Q":   { name:"Quarterly ITR – Corporation",                cat:"Income Tax",      due:"60 days after close of quarter", start:"1st day after quarter ends" },
  "1601-C":  { name:"Monthly Remittance – Compensation WHT",      cat:"Withholding Tax", due:"10th of following month",        start:"1st of following month" },
  "1601-EQ": { name:"Quarterly WHT – Creditable",                 cat:"Withholding Tax", due:"Last day of month after quarter",start:"1st day after quarter ends" },
  "1601-FQ": { name:"Quarterly WHT – Final",                      cat:"Withholding Tax", due:"Last day of month after quarter",start:"1st day after quarter ends" },
  "1604-C":  { name:"Annual Info Return – Compensation",          cat:"Withholding Tax", due:"January 31",                     start:"January 1" },
  "1604-E":  { name:"Annual Info Return – Creditable WHT",        cat:"Withholding Tax", due:"January 31",                     start:"January 1" },
  "1604-F":  { name:"Annual Info Return – Final WHT",             cat:"Withholding Tax", due:"January 31",                     start:"January 1" },
  "2316":    { name:"Certificate of Compensation / Tax Withheld", cat:"Withholding Tax", due:"January 31",                     start:"January 1" },
  "2307":    { name:"Certificate – Creditable WHT at Source",     cat:"Withholding Tax", due:"Per quarter / with payment",     start:"Upon withholding / end of quarter" },
  "2306":    { name:"Certificate – Final Tax Withheld",           cat:"Withholding Tax", due:"Per quarter / with payment",     start:"Upon withholding / end of quarter" },
  "2550M":   { name:"Monthly VAT Declaration",                    cat:"VAT",             due:"Optional / Phased out",          start:"Optional / phased out" },
  "2550Q":   { name:"Quarterly VAT Return",                       cat:"VAT",             due:"25th of month after quarter",    start:"1st day after quarter ends" },
  "2551Q":   { name:"Quarterly Percentage Tax Return",            cat:"Percentage Tax",  due:"25th of month after quarter",    start:"1st day after quarter ends" },
  "1800":    { name:"Donor's Tax Return",                         cat:"Estate & Donor",  due:"30 days after gift date",        start:"Day of donation" },
  "1801":    { name:"Estate Tax Return",                          cat:"Estate & Donor",  due:"1 year from date of death",      start:"Day of death" },
  "0605":    { name:"Payment Form – Fees / Penalties",            cat:"Payment",         due:"Jan 31 or as applicable",        start:"January 1 / as applicable" },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const getToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const fmtISO   = (d) => d.toISOString().slice(0,10);
const fmtDate  = (s) => !s ? "—" : new Date(s+"T00:00:00").toLocaleDateString("en-PH",{ month:"short", day:"numeric", year:"numeric" });

const daysLeft = (s) => {
  if (!s) return Infinity;
  const today = getToday();
  const d = new Date(s+"T00:00:00"); d.setHours(0,0,0,0);
  return Math.ceil((d - today) / 86400000);
};

const periodLabel = (hdr) => {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (hdr.PeriodType === "Monthly")   return `${M[(hdr.PeriodMonth||1)-1]} ${hdr.PeriodYear}`;
  if (hdr.PeriodType === "Quarterly") return `Q${hdr.PeriodQuarter} ${hdr.PeriodYear}`;
  return String(hdr.PeriodYear);
};

const deriveStatus = (dl) =>
  dl === Infinity ? "Pending" : dl < 0 ? "Overdue" : dl <= 7 ? "Urgent" : "Pending";

function computeDeadline(formCode, periodYear, periodMonth, periodQuarter) {
  const y=Number(periodYear), m=Number(periodMonth)||1, q=Number(periodQuarter)||1;
  const iso=(yr,mo,dy)=>`${yr}-${String(mo).padStart(2,"0")}-${String(dy).padStart(2,"0")}`;
  const lastDay=(yr,mo)=>new Date(yr,mo,0).getDate();
  switch(formCode){
    case "1700": case "1701": case "1701A": return iso(y+1,4,15);
    case "1701Q": return ({1:iso(y,5,15),2:iso(y,8,15),3:iso(y,11,15),4:iso(y+1,4,15)})[q]??iso(y,5,15);
    case "1702-RT": case "1702-EX": return iso(y+1,4,15);
    case "1702Q": { const e={1:new Date(y,2,31),2:new Date(y,5,30),3:new Date(y,8,30),4:new Date(y,11,31)}; const end=e[q]??e[1]; end.setDate(end.getDate()+60); return fmtISO(end); }
    case "1601-C": { const nm=m===12?1:m+1,ny=m===12?y+1:y; return iso(ny,nm,10); }
    case "1601-EQ": case "1601-FQ": { const a={1:[y,4],2:[y,7],3:[y,10],4:[y+1,1]}; const [ay,am]=a[q]??a[1]; return iso(ay,am,lastDay(ay,am)); }
    case "1604-C": case "1604-E": case "1604-F": case "2316": return iso(y+1,1,31);
    case "2307": case "2306": { const a={1:[y,4],2:[y,7],3:[y,10],4:[y+1,1]}; const [ay,am]=a[q]??a[1]; return iso(ay,am,lastDay(ay,am)); }
    case "2550M": { const nm=m===12?1:m+1,ny=m===12?y+1:y; return iso(ny,nm,25); }
    case "2550Q": case "2551Q": { const a={1:[y,4],2:[y,7],3:[y,10],4:[y+1,1]}; const [ay,am]=a[q]??a[1]; return iso(ay,am,25); }
    case "0605": return iso(y+1,1,31);
    default: return "";
  }
}

// ─────────────────────────────────────────────────────────────
// STATUS COLORS
// ─────────────────────────────────────────────────────────────
const useStatusColors = () => {
  const { palette } = useTheme();
  const dark = palette.mode === "dark";
  return {
    Filed:   { color:dark?"#4ADE80":"#16A34A", bg:dark?"rgba(74,222,128,0.08)":"#F0FDF4",  border:dark?"rgba(74,222,128,0.25)":"#86EFAC",  chip:dark?"rgba(74,222,128,0.14)":"#DCFCE7" },
    Overdue: { color:dark?"#F87171":"#DC2626", bg:dark?"rgba(248,113,113,0.08)":"#FEF2F2", border:dark?"rgba(248,113,113,0.25)":"#FCA5A5", chip:dark?"rgba(248,113,113,0.14)":"#FEE2E2" },
    Urgent:  { color:dark?"#FCD34D":"#D97706", bg:dark?"rgba(252,211,77,0.08)":"#FFFBEB",  border:dark?"rgba(252,211,77,0.25)":"#FCD34D",  chip:dark?"rgba(252,211,77,0.14)":"#FEF3C7" },
    Pending: { color:dark?"#F87171":"#DC2626", bg:dark?"rgba(248,113,113,0.08)":"#FEF2F2", border:dark?"rgba(248,113,113,0.25)":"#FCA5A5", chip:dark?"rgba(248,113,113,0.14)":"#FEE2E2" },
  };
};

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const S = useStatusColors();
  const t = S[status] || S.Pending;
  const icon = {
    Filed:   <CheckCircleIcon  sx={{ fontSize:13 }} />,
    Overdue: <ErrorIcon        sx={{ fontSize:13 }} />,
    Urgent:  <WarningAmberIcon sx={{ fontSize:13 }} />,
    Pending: <ErrorIcon        sx={{ fontSize:13 }} />,
  }[status] || null;
  const label = status === "Pending" ? "To Be Filed" : status;
  return (
    <Box sx={{
      display:"inline-flex", alignItems:"center", gap:0.5,
      px:1, py:0.3, borderRadius:99,
      bgcolor:t.chip, border:`1px solid ${t.border}`,
      color:t.color, whiteSpace:"nowrap",
    }}>
      {icon}
      <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:t.color }}>{label}</Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────
function DetailPanel({ row, onEditDetail }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";

  const panelBg     = dark ? palette.background.default : "#F8FAFF";
  const panelBorder = dark ? palette.divider            : "#E8EDFF";
  const cardBg      = dark ? palette.background.paper   : "#FFFFFF";
  const rowBorder   = dark ? palette.divider            : "#E5E7EB";

  const cats        = [...new Set(row.forms.map(f => f.Category || BIR_FORM_MAP[f.FormCode]?.cat || "Other"))];
  const filedCount  = row.forms.filter(f => f.IsFiled).length;
  const overdueCount= row.forms.filter(f => f.status === "Overdue").length;
  const pct         = row.forms.length ? Math.round((filedCount / row.forms.length) * 100) : 0;

  return (
    <Box sx={{ bgcolor:panelBg, borderTop:`2px solid ${panelBorder}`, p:3 }}>
      {/* Summary strip */}
      <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
        <Box sx={{
          display:"flex", alignItems:"center", gap:1, p:1.5, borderRadius:2,
          bgcolor:cardBg, border:`1px solid ${rowBorder}`, minWidth:120,
        }}>
          <CheckCircleIcon sx={{ color:S.Filed.color, fontSize:20 }} />
          <Box>
            <Typography fontSize="0.65rem" color="text.secondary">Filed</Typography>
            <Typography fontWeight={800} fontSize="1rem" color={S.Filed.color}>
              {filedCount}/{row.forms.length}
            </Typography>
          </Box>
        </Box>

        {overdueCount > 0 && (
          <Box sx={{
            display:"flex", alignItems:"center", gap:1, p:1.5, borderRadius:2,
            bgcolor:S.Overdue.bg, border:`1px solid ${S.Overdue.border}`, minWidth:100,
          }}>
            <ErrorIcon sx={{ color:S.Overdue.color, fontSize:20 }} />
            <Box>
              <Typography fontSize="0.65rem" color={S.Overdue.color}>Overdue</Typography>
              <Typography fontWeight={800} fontSize="1rem" color={S.Overdue.color}>{overdueCount}</Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ flex:1, minWidth:200 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Overall progress</Typography>
            <Typography variant="caption" fontWeight={700}>{pct}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct}
            color={pct===100?"success":overdueCount>0?"error":"warning"}
            sx={{ height:8, borderRadius:4 }} />
        </Box>
      </Box>

      {/* Forms by category */}
      {cats.map((cat) => {
        const catForms = row.forms.filter(f => (f.Category||BIR_FORM_MAP[f.FormCode]?.cat||"Other") === cat);
        return (
          <Box key={cat} mb={2.5}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box sx={{ width:3, height:16, borderRadius:1, bgcolor:"primary.main" }} />
              <Typography variant="caption" fontWeight={700} color="primary.main"
                sx={{ textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {cat}
              </Typography>
            </Box>

            <Paper elevation={0} sx={{ border:`1px solid ${rowBorder}`, borderRadius:2, overflow:"hidden" }}>
              {catForms.map((f, idx) => {
                const dl     = daysLeft(f.DeadlineDate);
                const st     = f.IsFiled ? "Filed" : deriveStatus(dl);
                const tc     = S[st] || S.Pending;
                const isLast = idx === catForms.length - 1;
                const meta   = BIR_FORM_MAP[f.FormCode] || {};
                return (
                  <Box key={f.ID??f.FormCode} sx={{
                    display:"flex", alignItems:"center", gap:2,
                    px:2, py:1.5, bgcolor:tc.bg,
                    borderBottom: isLast ? 0 : `1px solid ${rowBorder}`,
                    borderLeft:`4px solid ${tc.color}`,
                  }}>
                    <Box sx={{ minWidth:80, flexShrink:0 }}>
                      <Typography fontFamily="monospace" fontWeight={800} fontSize="0.82rem" color={tc.color}>
                        {f.FormCode}
                      </Typography>
                    </Box>

                    <Box sx={{ flex:1, minWidth:0 }}>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>
                        {f.FormName||meta.name||f.FormCode}
                      </Typography>
                      <Box display="flex" gap={1.5} mt={0.25}>
                        <Typography variant="caption" color="text.disabled" fontSize="0.62rem">
                          Start: {f.StartOfFiling||meta.start||"—"}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" fontSize="0.62rem">
                          Due sched: {f.DueSchedule||meta.due||"—"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign:"right", minWidth:150, flexShrink:0 }}>
                      {f.IsFiled ? (
                        <>
                          <Typography variant="caption" fontWeight={600} color={S.Filed.color} display="block">
                            ✓ Filed {fmtDate(f.FiledDate)}
                          </Typography>
                          {f.FiledBy && (
                            <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                              by {f.FiledBy}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="caption" fontFamily="monospace" fontWeight={600}
                            color={tc.color} display="block">
                            Due {fmtDate(f.DeadlineDate)}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} fontSize="0.6rem" color={tc.color}>
                            {dl===Infinity?"No date set":dl<0?`${Math.abs(dl)}d overdue`:dl===0?"Due today!":`${dl}d left`}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Box sx={{ minWidth:90, flexShrink:0 }}>
                      <StatusBadge status={st} />
                    </Box>

                    <Tooltip title="Edit filing status">
                      <Button size="small" variant="outlined"
                        startIcon={<EditIcon sx={{ fontSize:"13px !important" }} />}
                        onClick={() => onEditDetail({ ...f, clientName:row.clientName, periodLabel:row.periodLabel })}
                        sx={{
                          borderRadius:1.5, fontSize:"0.68rem", py:0.4, px:1.25, flexShrink:0,
                          borderColor:tc.border, color:tc.color,
                          bgcolor: dark?"transparent":"background.paper",
                          "&:hover":{ bgcolor:tc.chip, borderColor:tc.color },
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
// PENDING ROW
// ─────────────────────────────────────────────────────────────
function PendingRow({ row, rowNum, onEditDetail }) {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";
  const [open, setOpen] = useState(false);

  const t          = S[row.worstStatus] || S.Pending;
  const isOverdue  = row.worstStatus === "Overdue";
  const rowBg      = isOverdue ? t.bg : "inherit";
  const rowHoverBg = isOverdue ? t.chip : dark ? "rgba(255,255,255,0.04)" : "#F5F8FF";

  const indigoBg     = dark?"rgba(99,102,241,0.15)":"#EEF2FF";
  const indigoBorder = dark?"rgba(99,102,241,0.30)":"#C7D2FE";
  const indigoColor  = dark?"#A5B4FC":"#4338CA";
  const expandBg     = dark?"rgba(99,102,241,0.15)":"#EEF2FF";

  const filedCount   = row.forms.filter(f=>f.IsFiled).length;
  const overdueCount = row.forms.filter(f=>f.status==="Overdue").length;
  const pct          = row.forms.length ? Math.round((filedCount/row.forms.length)*100) : 0;
  const dl           = row.nearestDl;

  return (
    <>
      <TableRow hover onClick={() => setOpen(o=>!o)} sx={{
        cursor:"pointer", bgcolor:rowBg,
        "& > td:first-of-type":{ borderLeft:`3px solid ${t.color}` },
        "&:hover > td":{ bgcolor:`${rowHoverBg} !important` },
        transition:"background-color 0.1s",
      }}>
        <TableCell sx={{ width:48, pl:1.5, pr:0 }}>
          <IconButton size="small"
            onClick={(e) => { e.stopPropagation(); setOpen(o=>!o); }}
            sx={{ color:open?"primary.main":"text.secondary", bgcolor:open?expandBg:"transparent", borderRadius:1.5 }}>
            {open ? <KeyboardArrowUpIcon fontSize="small"/> : <KeyboardArrowDownIcon fontSize="small"/>}
          </IconButton>
        </TableCell>

        <TableCell sx={{ width:36, color:"text.disabled", fontFamily:"monospace", fontSize:"0.7rem", pl:0 }}>
          {String(rowNum).padStart(2,"0")}
        </TableCell>

        <TableCell sx={{ py:1.75 }}>
          <Typography variant="body2" fontWeight={700} fontSize="0.88rem">{row.clientName}</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.25}>
            {row.client?.ClientID && (
              <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontSize="0.68rem">
                {row.client.ClientID}
              </Typography>
            )}
            {row.client?.Type && (
              <Chip label={row.client.Type} size="small" sx={{
                fontSize:"0.58rem", height:16, fontWeight:600,
                bgcolor:indigoBg, color:indigoColor, border:`1px solid ${indigoBorder}`,
              }} />
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ py:1.75 }}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <CalendarTodayIcon sx={{ fontSize:13, color:"text.secondary" }} />
            <Typography variant="body2" fontWeight={700}>{row.periodLabel}</Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" fontSize="0.68rem">{row.periodType}</Typography>
        </TableCell>

        <TableCell sx={{ py:1.75 }}>
          <Box display="flex" flexWrap="wrap" gap={0.4}>
            {row.forms.slice(0,6).map((f) => {
              const fdl = daysLeft(f.DeadlineDate);
              const st  = f.IsFiled ? "Filed" : deriveStatus(fdl);
              const ft  = S[st] || S.Pending;
              return (
                <Tooltip key={f.FormCode}
                  title={`${f.FormName||BIR_FORM_MAP[f.FormCode]?.name||f.FormCode} — Due ${fmtDate(f.DeadlineDate)}`} arrow>
                  <Chip label={f.FormCode} size="small" sx={{
                    fontSize:"0.6rem", height:20, fontFamily:"monospace", fontWeight:700,
                    bgcolor:ft.chip, color:ft.color, border:`1px solid ${ft.border}`,
                  }} />
                </Tooltip>
              );
            })}
            {row.forms.length > 6 && (
              <Chip label={`+${row.forms.length-6} more`} size="small" sx={{
                fontSize:"0.6rem", height:20,
                bgcolor:dark?"rgba(255,255,255,0.08)":"#F3F4F6",
                color:"text.secondary",
              }} />
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ minWidth:170, py:1.75 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <LinearProgress variant="determinate" value={pct}
              color={pct===100?"success":isOverdue?"error":"warning"}
              sx={{ flex:1, height:7, borderRadius:4 }} />
            <Typography variant="caption" fontWeight={700} color={t.color} sx={{ minWidth:34 }}>
              {pct}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
            {filedCount}/{row.forms.length} filed
            {overdueCount > 0 && (
              <Box component="span" sx={{ color:S.Overdue.color, ml:0.75, fontWeight:700 }}>
                · {overdueCount} overdue
              </Box>
            )}
          </Typography>
        </TableCell>

        <TableCell sx={{ py:1.75 }}>
          <Typography variant="caption" fontFamily="monospace" fontWeight={700}
            color={t.color} display="block" fontSize="0.78rem">
            {fmtDate(row.forms[0]?.DeadlineDate)}
          </Typography>
          <Typography variant="caption" fontWeight={700} fontSize="0.65rem" color={t.color}>
            {dl===Infinity?"No date":dl<0?`${Math.abs(dl)}d overdue`:dl===0?"Due today!":`${dl}d left`}
          </Typography>
        </TableCell>

        <TableCell sx={{ py:1.75 }}>
          <StatusBadge status={row.worstStatus} />
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={8} sx={{ p:0, border: open ? undefined : 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <DetailPanel row={row} onEditDetail={onEditDetail} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EDIT DIALOG
// ─────────────────────────────────────────────────────────────
function EditDialog({ open, detail, onClose, onSave }) {
  const S    = useStatusColors();
  const { palette } = useTheme();
  const dark = palette.mode === "dark";

  const [isFiled,   setIsFiled]   = useState(false);
  const [filedDate, setFiledDate] = useState("");
  const [filedBy,   setFiledBy]   = useState("");
  const [remarks,   setRemarks]   = useState("");
  const [saving,    setSaving]    = useState(false);

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("accessToken");
      if (!raw) return "";
      if (raw.split(".").length === 3) {
        const p = JSON.parse(atob(raw.split(".")[1]));
        return p?.userName||p?.username||p?.name||p?.sub||"";
      }
      return JSON.parse(raw)?.userName||"";
    } catch { return ""; }
  })();

  useEffect(() => {
    if (detail) {
      setIsFiled(!!detail.IsFiled);
      setFiledDate(detail.FiledDate ? detail.FiledDate.slice(0,10) : "");
      setFiledBy(detail.IsFiled ? (detail.FiledBy||currentUser) : currentUser);
      setRemarks(detail.Remarks||"");
    }
  }, [detail]);

  if (!detail) return null;

  const dl   = daysLeft(detail.DeadlineDate);
  const isOv = dl < 0;
  const isCr = dl >= 0 && dl <= 3;
  const tc   = isOv ? S.Overdue : isCr ? S.Urgent : S.Filed;
  const meta = BIR_FORM_MAP[detail.FormCode]||{};

  const indigoBg     = dark?"rgba(99,102,241,0.15)":"#EEF2FF";
  const indigoBorder = dark?"rgba(99,102,241,0.35)":"#C7D2FE";
  const indigoColor  = dark?"#A5B4FC":"#4338CA";

  const handleSave = async () => {
    setSaving(true);
    await onSave({ id:detail.ID, isfiled:isFiled, fileddate:filedDate, filedby:filedBy, remarks });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle sx={{ pb:1.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ px:1.25, py:0.4, borderRadius:1, bgcolor:indigoBg, border:`1px solid ${indigoBorder}` }}>
            <Typography fontFamily="monospace" fontWeight={800} fontSize="0.85rem" color={indigoColor}>
              {detail.FormCode}
            </Typography>
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize="0.95rem" lineHeight={1.2}>
              {detail.FormName||meta.name||detail.FormCode}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {detail.clientName} · {detail.periodLabel}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt:0 }}>
        <Box sx={{ p:1.5, borderRadius:2, mb:2, border:"1px solid", borderColor:"divider", bgcolor:"background.default", display:"flex", gap:3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Start of Filing</Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">{detail.StartOfFiling||meta.start||"—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Due Schedule</Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">{detail.DueSchedule||meta.due||"—"}</Typography>
          </Box>
        </Box>

        <Box sx={{ p:2, borderRadius:2, mb:2.5, border:"1px solid", bgcolor:tc.bg, borderColor:tc.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Deadline</Typography>
            <Typography fontWeight={700} color={tc.color}>{fmtDate(detail.DeadlineDate)}</Typography>
          </Box>
          <Box sx={{ textAlign:"right" }}>
            <Typography fontWeight={800} fontSize="1rem" color={tc.color}>
              {isOv?`⚠ ${Math.abs(dl)}d overdue`:dl===0?"⏰ Due today!":`✓ ${dl} days left`}
            </Typography>
            {dl<=7&&dl>=0&&<Typography variant="caption" color="text.secondary">Act soon!</Typography>}
          </Box>
        </Box>

        <Paper variant="outlined" sx={{
          p:2, mb:2, borderRadius:2, cursor:"pointer",
          bgcolor:isFiled?S.Filed.bg:"background.paper",
          borderColor:isFiled?S.Filed.border:"divider",
          transition:"all 0.15s",
        }} onClick={() => {
          const n = !isFiled;
          setIsFiled(n);
          if (n && !filedDate) setFiledDate(fmtISO(getToday()));
          if (!n) { setFiledDate(""); setFiledBy(currentUser); }
        }}>
          <FormControlLabel
            control={<Checkbox checked={isFiled} color="success" onChange={()=>{}} onClick={(e)=>e.stopPropagation()} />}
            label={
              <Box>
                <Typography fontWeight={700} color={isFiled?S.Filed.color:"text.primary"}>
                  {isFiled?"✓ Marked as Filed":"Mark as Filed"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isFiled?"Click to unmark":"Click to mark this form as submitted"}
                </Typography>
              </Box>
            }
            sx={{ m:0 }}
          />
        </Paper>

        {isFiled && (
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Date Filed" type="date"
                InputLabelProps={{ shrink:true }} value={filedDate}
                onChange={(e)=>setFiledDate(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Filed By" value={filedBy}
                InputProps={{ readOnly:true }} />
            </Grid>
          </Grid>
        )}

        <TextField fullWidth size="small" label="Remarks (optional)" multiline rows={2}
          placeholder="Add any notes about this filing…"
          value={remarks} onChange={(e)=>setRemarks(e.target.value)} />
      </DialogContent>

      <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius:2 }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          color={isFiled?"success":"primary"}
          startIcon={saving?<CircularProgress size={14} color="inherit"/>:<SaveIcon/>}
          sx={{ borderRadius:2, minWidth:130 }}>
          {saving?"Saving…":"Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function PendingFiling() {
  const S           = useStatusColors();
  const { palette } = useTheme();
  const dark        = palette.mode === "dark";

  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editDetail,   setEditDetail]   = useState(null);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const [snack,        setSnack]        = useState({ open:false, msg:"", sev:"success" });

  const showSnack = (msg, sev="success") => setSnack({ open:true, msg, sev });
  const pollRef   = useRef(null);

  const loadPending = useCallback(async () => {
    try {
      const res = await http.get("/selectmonitors");
      const raw = res?.data?.data ?? [];

      const pendingRows = raw.flatMap((m) => {
        const forms = (m.Details||[])
          .map(d => {
            const deadline = computeDeadline(d.FormCode,m.PeriodYear,m.PeriodMonth,m.PeriodQuarter)||d.DeadlineDate||"";
            const dl = daysLeft(deadline);
            return {
              ...d,
              DeadlineDate:  deadline,
              FormName:      d.FormName      || BIR_FORM_MAP[d.FormCode]?.name  || d.FormCode,
              Category:      d.Category      || BIR_FORM_MAP[d.FormCode]?.cat   || "Other",
              DueSchedule:   d.DueSchedule   || BIR_FORM_MAP[d.FormCode]?.due   || "—",
              StartOfFiling: d.StartOfFiling || BIR_FORM_MAP[d.FormCode]?.start || "—",
              status:        d.IsFiled ? "Filed" : deriveStatus(dl),
            };
          })
          .sort((a,b) => new Date(a.DeadlineDate)-new Date(b.DeadlineDate));

        const hasUnfiled = forms.some(f => !f.IsFiled);
        if (!hasUnfiled) return [];

        const unfiledForms = forms.filter(f => !f.IsFiled);
        const worstStatus = unfiledForms.some(f=>f.status==="Overdue") ? "Overdue"
                          : unfiledForms.some(f=>f.status==="Urgent")  ? "Urgent" : "Pending";

        return [{
          monitorId:   m.ID,
          client:      m.Client || {},
          clientName:  m.Client?.TradeName || m.Client?.LNF || "—",
          periodLabel: periodLabel(m),
          periodType:  m.PeriodType,
          forms,
          worstStatus,
          nearestDl:   daysLeft(unfiledForms[0]?.DeadlineDate),
        }];
      }).sort((a,b) => {
        const ord = { Overdue:0, Urgent:1, Pending:2 };
        if (ord[a.worstStatus] !== ord[b.worstStatus]) return ord[a.worstStatus]-ord[b.worstStatus];
        return a.nearestDl - b.nearestDl;
      });

      setRows(pendingRows);
    } catch {
      showSnack("Failed to load pending filings.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
    pollRef.current = setInterval(loadPending, 5*60*1000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleSaveDetail = async (payload) => {
    try {
      await http.post("/updatemonitordtl", payload);
      showSnack("Filing updated!");
      loadPending();
    } catch {
      showSnack("Updated locally — sync pending.", "warning");
    }
  };

  // ── PDF export ────────────────────────────────────────────
  const handleExportPDF = () => {
    setPdfLoading(true);
    try {
      const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W     = 210;
      const M     = 14;
      const pageH = 297;

      const todayLabel = new Date().toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
      });

      const currentUser = (() => {
        try {
          const raw = localStorage.getItem("accessToken");
          if (!raw) return "Unknown";
          if (raw.split(".").length === 3) {
            const p = JSON.parse(atob(raw.split(".")[1]));
            return p?.userName || p?.username || p?.name || p?.sub || "Unknown";
          }
          return JSON.parse(raw)?.userName || "Unknown";
        } catch { return "Unknown"; }
      })();

      const totalAll     = filtered.reduce((a, r) => a + r.forms.length, 0);
      const totalUnfiled = filtered.reduce((a, r) => a + r.forms.filter(f => !f.IsFiled).length, 0);

      // ── HEADER ──────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(20, 20, 20);
      doc.text("PENDING FOR FILING", W / 2, 15, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 110);
      doc.text(
        `${todayLabel}  |  ${filtered.length} client(s)  |  ${totalUnfiled} of ${totalAll} form(s) pending`,
        W / 2, 21, { align: "center" }
      );

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(M, 25, W - M, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${todayLabel}  |  By: ${currentUser}`, M, 31);

      // ── TABLE ROWS ──────────────────────────────────────────
      // Use "\n\n" between forms so BIR Form col spacing
      // visually matches the gap added in didDrawCell for cols 3 & 4
      const tableRows = filtered.map((row) => {
        const sortedForms = [
          ...row.forms.filter(f => !f.IsFiled),
          ...row.forms.filter(f =>  f.IsFiled),
        ];

        const formLines = sortedForms.map(f => f.FormCode).join("\n\n");

        const deadlineLines = sortedForms.map(f => {
          if (f.IsFiled) {
            return f.FiledDate ? `Filed: ${fmtDate(f.FiledDate)}` : "Filed";
          }
          const dl  = daysLeft(f.DeadlineDate);
          const tag = dl === Infinity ? "No date"
            : dl < 0  ? `${Math.abs(dl)}d overdue`
            : dl === 0 ? "Due today!"
            :            `${dl}d left`;
          return `${fmtDate(f.DeadlineDate)}  (${tag})`;
        }).join("\n\n");

        const statusLines = sortedForms.map(f => {
          if (f.IsFiled)              return "Done";
          if (f.status === "Overdue") return "Overdue";
          if (f.status === "Urgent")  return "Urgent";
          return "Pending";
        }).join("\n\n");

        return [row.clientName, row.periodLabel, formLines, deadlineLines, statusLines];
      });

      // ── TABLE ────────────────────────────────────────────────
      autoTable(doc, {
        startY: 35,
        head: [["Client", "Period", "BIR Form", "Deadline / Filed Date", "Status"]],
        body: tableRows,
        theme: "grid",
        styles: {
          font:          "helvetica",
          fontSize:      8,
          cellPadding:   { top: 4, bottom: 4, left: 4, right: 4 },
          lineColor:     [200, 200, 200],
          lineWidth:     0.25,
          textColor:     [40, 40, 40],
          valign:        "top",
          overflow:      "linebreak",
          minCellHeight: 10,
        },
        headStyles: {
          fillColor:   [40, 40, 40],
          textColor:   [255, 255, 255],
          fontStyle:   "bold",
          fontSize:    8.5,
          lineWidth:   0.4,
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
          valign:      "middle",
        },
        // ── All rows white, no alternating ──────────────────────
        alternateRowStyles: { fillColor: [255, 255, 255] },
        bodyStyles:         { fillColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: "bold", textColor: [20, 20, 20]  },
          1: { cellWidth: 20, textColor: [80, 80, 80], halign: "center"   },
          2: { cellWidth: 26, fontStyle: "bold", textColor: [30, 30, 30]  },
          3: { cellWidth: 62, textColor: [60, 60, 60]                     },
          4: { cellWidth: 22, halign: "center", fontStyle: "bold"         },
        },
        margin: { left: M, right: M },

        // ── Hide autotable's default text for cols 3 & 4 ────────
        // didDrawCell will overdraw them line-by-line with correct colors
        didParseCell(data) {
          if (data.section !== "body") return;
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = [255, 255, 255]; // invisible
          }
        },

        // ── Overdraw cols 3 (Deadline) & 4 (Status) per-form ───
        didDrawCell(data) {
          if (data.section !== "body") return;
          if (data.column.index !== 3 && data.column.index !== 4) return;

          const r = filtered[data.row.index];
          if (!r) return;

          const sortedForms = [
            ...r.forms.filter(f => !f.IsFiled),
            ...r.forms.filter(f =>  f.IsFiled),
          ];

          const fontSize  = 8;
const ptToMm    = 1 / doc.internal.scaleFactor;
// "\n\n" in the BIR Form column renders as 2 line-heights per slot.
// jsPDF default lineHeightFactor ≈ 1.15, so match it exactly here.
const lineH     = fontSize * ptToMm * 1.15;  // single line height
const rowH      = lineH * 2;                  // 2× to match "\n\n" gap in col 2
          const padTop    = data.cell.padding("top");
          const padLeft   = data.cell.padding("left");
          const padRight  = data.cell.padding("right");
          const cellW     = data.cell.width - padLeft - padRight;
          const bgFill    = [255, 255, 255];            // always white

          // First text baseline
          const firstBase = data.cell.y + padTop + fontSize * ptToMm;

          // ── Column 3: Deadline ─────────────────────────────
          if (data.column.index === 3) {
            let lineY = firstBase;

            sortedForms.forEach((f) => {
              let text, r_, g_, b_;

              if (f.IsFiled) {
                text = f.FiledDate ? `Filed: ${fmtDate(f.FiledDate)}` : "Filed";
                [r_, g_, b_] = [34, 139, 34];
              } else {
                const dl  = daysLeft(f.DeadlineDate);
                const tag = dl === Infinity ? "No date"
                  : dl < 0  ? `${Math.abs(dl)}d overdue`
                  : dl === 0 ? "Due today!"
                  :            `${dl}d left`;
                text = `${fmtDate(f.DeadlineDate)}  (${tag})`;
                if      (f.status === "Overdue") [r_, g_, b_] = [185, 28,  28];
                else if (f.status === "Urgent")  [r_, g_, b_] = [160, 90,   0];
                else                             [r_, g_, b_] = [ 60, 60,  60];
              }

              // Clear the slot with white background
              doc.setFillColor(...bgFill);
              doc.rect(data.cell.x + padLeft, lineY - fontSize * ptToMm, cellW, rowH, "F");

              doc.setFont("helvetica", "normal");
              doc.setFontSize(fontSize);
              doc.setTextColor(r_, g_, b_);
              doc.text(text, data.cell.x + padLeft, lineY);

              lineY += rowH;
            });
          }

          // ── Column 4: Status ───────────────────────────────
          if (data.column.index === 4) {
            let lineY = firstBase;

            sortedForms.forEach((f) => {
              let label, r_, g_, b_;

              if (f.IsFiled) {
                label = "Done";
                [r_, g_, b_] = [34, 139, 34];
              } else if (f.status === "Overdue") {
                label = "Overdue";
                [r_, g_, b_] = [185, 28, 28];
              } else if (f.status === "Urgent") {
                label = "Urgent";
                [r_, g_, b_] = [160, 90, 0];
              } else {
                label = "Pending";
                [r_, g_, b_] = [100, 100, 100];
              }

              // Clear the slot with white background
              doc.setFillColor(...bgFill);
              doc.rect(data.cell.x + padLeft, lineY - fontSize * ptToMm, cellW, rowH, "F");

              doc.setFont("helvetica", "bold");
              doc.setFontSize(fontSize);
              doc.setTextColor(r_, g_, b_);
              doc.text(label, data.cell.x + padLeft + cellW / 2, lineY, { align: "center" });

              lineY += rowH;
            });
          }
        },

        didDrawPage() {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(M, pageH - 14, W - M, pageH - 14);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(140, 140, 140);
          doc.text("CDJ Accounting Services — Pending for Filing", M, pageH - 9);
          const pg = doc.internal.getCurrentPageInfo().pageNumber;
          const tp = doc.internal.getNumberOfPages();
          doc.text(`Page ${pg} of ${tp}`, W - M, pageH - 9, { align: "right" });
        },
      });

      doc.save(`pending-filing-${new Date().toISOString().slice(0, 10)}.pdf`);
      showSnack("PDF exported!");
    } catch (err) {
      console.error("PDF export error:", err);
      showSnack("Failed to generate PDF.", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.clientName.toLowerCase().includes(q)
      || (r.client?.ClientID||"").toLowerCase().includes(q)
      || r.forms.some(f => f.FormCode.toLowerCase().includes(q) || f.FormName.toLowerCase().includes(q));
    return matchSearch && (!filterStatus || r.worstStatus === filterStatus);
  });

  const overdueCount = rows.filter(r=>r.worstStatus==="Overdue").length;
  const urgentCount  = rows.filter(r=>r.worstStatus==="Urgent").length;
  const pendingCount = rows.filter(r=>r.worstStatus==="Pending").length;

  const PILLS = [
    { label:"All",     value:"",        count:rows.length,  t:null      },
    { label:"Overdue", value:"Overdue", count:overdueCount, t:S.Overdue },
    { label:"Urgent",  value:"Urgent",  count:urgentCount,  t:S.Urgent  },
    { label:"Pending", value:"Pending", count:pendingCount, t:S.Pending },
  ];

  const theadBg = dark ? palette.background.default : "#F8FAFF";

  return (
    <Box>
      {/* ══ HEADER ══ */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box>
          <Typography fontWeight={800} fontSize="1.4rem" letterSpacing="-0.5px">
            Pending for Filing
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Track unfiled BIR forms by client · Click any row to expand · Refreshes every 5 min
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadPending}
              sx={{ width:38, height:38, border:"1px solid", borderColor:"divider" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" size="small"
            startIcon={pdfLoading ? <CircularProgress size={14} color="inherit"/> : <PictureAsPdfIcon />}
            onClick={handleExportPDF}
            disabled={pdfLoading || filtered.length === 0}
            sx={{ height:38, borderRadius:2, borderColor:"divider", color:"text.secondary" }}>
            {pdfLoading ? "Generating…" : "Export PDF"}
          </Button>
        </Stack>
      </Box>

      {/* ══ FILTER PILLS ══ */}
      <Box display="flex" gap={1.5} mb={2.5} flexWrap="wrap" alignItems="center">
        <FilterListIcon sx={{ fontSize:20, color:"text.disabled" }} />
        <Typography variant="body2" color="text.disabled" fontWeight={700} sx={{ mr:0.5 }}>Filter:</Typography>
        {PILLS.map(({ label, value, count, t }) => {
          const active      = filterStatus === value;
          const activeColor = t?.color || (dark?"#93C5FD":"#2563EB");
          const activeChip  = t?.chip  || (dark?"rgba(147,197,253,0.14)":"#DBEAFE");
          return (
            <Box key={value} onClick={() => setFilterStatus(active?"":value)} sx={{
              display:"inline-flex", alignItems:"center", gap:1,
              px:2, py:1, borderRadius:99, cursor:"pointer", userSelect:"none",
              border:"2px solid", transition:"all 0.15s",
              bgcolor: active ? activeChip : "background.paper",
              borderColor: active ? activeColor : "divider",
              "&:hover":{ borderColor:activeColor, bgcolor:activeChip },
            }}>
              {t && <Box sx={{ width:9, height:9, borderRadius:"50%", bgcolor:activeColor }} />}
              <Typography variant="body2" fontWeight={700} fontSize="0.88rem"
                color={active?activeColor:"text.secondary"}>
                {label}
              </Typography>
              <Box sx={{ px:0.9, py:0.2, borderRadius:1,
                bgcolor: active?activeColor:dark?"rgba(255,255,255,0.08)":"#F3F4F6" }}>
                <Typography variant="caption" fontWeight={800} fontSize="0.75rem"
                  color={active?"white":"text.secondary"}>
                  {count}
                </Typography>
              </Box>
            </Box>
          );
        })}
        {filterStatus && (
          <Button size="small" onClick={() => setFilterStatus("")}
            sx={{ color:"text.secondary", fontSize:"0.72rem", py:0.25, px:1, borderRadius:99 }}>
            × Clear
          </Button>
        )}
      </Box>

      {/* ══ SEARCH + COUNT ══ */}
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
        <TextField size="small" placeholder="Search by client name, ID, or form code…"
          value={search} onChange={(e)=>setSearch(e.target.value)} sx={{ minWidth:280 }}
          InputProps={{
            sx:{ borderRadius:2 },
            startAdornment:<SearchIcon fontSize="small" sx={{ color:"text.disabled", mr:0.5 }} />,
          }} />
        <Typography variant="caption" color="text.disabled" sx={{ ml:"auto" }}>
          Showing {filtered.length} of {rows.length} clients · {filtered.reduce((a,r)=>a+r.forms.filter(f=>!f.IsFiled).length,0)} forms pending
        </Typography>
      </Box>

      {/* ══ TABLE ══ */}
      {loading ? (
        Array.from({length:5}).map((_,i) => (
          <Skeleton key={i} height={56} sx={{ borderRadius:1, mb:0.5 }} />
        ))
      ) : filtered.length === 0 ? (
        <Box sx={{ py:12, textAlign:"center" }}>
          <CheckCircleOutlineIcon sx={{ fontSize:52, color:"text.disabled", mb:1.5, display:"block", mx:"auto" }} />
          <Typography fontWeight={700} color="text.secondary" mb={0.5}>
            {rows.length===0 ? "No pending BIR filings found." : "No records match your current filter."}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {rows.length===0
              ? "All clients are up to date across all periods."
              : "Try adjusting your search or status filter."}
          </Typography>
          {(search||filterStatus) && (
            <Box mt={2}>
              <Button size="small" variant="outlined" sx={{ borderRadius:2 }}
                onClick={() => { setSearch(""); setFilterStatus(""); }}>
                Clear all filters
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}
          sx={{ border:"1px solid", borderColor:"divider", borderRadius:2.5, overflow:"hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor:theadBg }}>
                <TableCell sx={{ width:48, borderBottom:"2px solid", borderColor:"divider" }} />
                <TableCell sx={{ width:36, fontWeight:700, fontSize:"0.7rem", color:"text.disabled", borderBottom:"2px solid", borderColor:"divider" }}>#</TableCell>
                <TableCell sx={{ fontWeight:700, fontSize:"0.75rem", borderBottom:"2px solid", borderColor:"divider" }}>Client</TableCell>
                <TableCell sx={{ fontWeight:700, fontSize:"0.75rem", borderBottom:"2px solid", borderColor:"divider" }}>Period</TableCell>
                <TableCell sx={{ fontWeight:700, fontSize:"0.75rem", borderBottom:"2px solid", borderColor:"divider" }}>BIR Forms Pending</TableCell>
                <TableCell sx={{ fontWeight:700, fontSize:"0.75rem", minWidth:170, borderBottom:"2px solid", borderColor:"divider" }}>Progress</TableCell>
                <TableCell sx={{ fontWeight:700, fontSize:"0.75rem", borderBottom:"2px solid", borderColor:"divider" }}>Nearest Deadline</TableCell>
                <TableCell sx={{ fontWeight:700, fontSize:"0.75rem", borderBottom:"2px solid", borderColor:"divider" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r, i) => (
                <PendingRow key={r.monitorId} row={r} rowNum={i+1} onEditDetail={setEditDetail} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <EditDialog
        open={Boolean(editDetail)}
        detail={editDetail}
        onClose={() => setEditDetail(null)}
        onSave={handleSaveDetail}
      />

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack(p=>({...p,open:false}))}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}>
        <Alert severity={snack.sev} variant="filled" sx={{ borderRadius:2 }}
          onClose={() => setSnack(p=>({...p,open:false}))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}