// ============================================================
// RevenueReport.jsx — CDJ Accounting & Auditing Office
// MUI style aligned with TransactionInt.jsx patterns
// ============================================================
import React from "react";
import {
  Box, Button, MenuItem, Select, Skeleton, Stack, Tab, Tabs,
  Typography, useTheme, Paper, Chip, InputAdornment,
  Table, TableHead, TableBody, TableFooter, TableRow, TableCell,
  TableContainer, alpha, Collapse, IconButton, Tooltip, CircularProgress,
} from "@mui/material";
import TrendingUpIcon            from "@mui/icons-material/TrendingUp";
import PaidIcon                  from "@mui/icons-material/Paid";
import ReceiptLongIcon           from "@mui/icons-material/ReceiptLong";
import GroupIcon                 from "@mui/icons-material/Group";
import AccountBalanceWalletIcon  from "@mui/icons-material/AccountBalanceWallet";
import FileDownloadOutlinedIcon  from "@mui/icons-material/FileDownloadOutlined";
import BarChartIcon              from "@mui/icons-material/BarChart";
import KeyboardArrowDownIcon     from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon    from "@mui/icons-material/KeyboardArrowRight";
import PeopleAltIcon             from "@mui/icons-material/PeopleAlt";
import { useQuery }              from "@tanstack/react-query";
import { http }                  from "../../api/http";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (val) =>
  "₱" + parseFloat(val || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const short = (val) => {
  const n = parseFloat(val || 0);
  if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return "₱" + (n / 1_000).toFixed(1) + "K";
  return "₱" + n.toFixed(0);
};

const pct = (num, den) =>
  parseFloat(den) > 0 ? ((parseFloat(num) / parseFloat(den)) * 100).toFixed(1) + "%" : "—";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const scaffold12 = (data) => {
  const map = {};
  (data || []).forEach(d => { map[d.Month] = d; });
  return MONTHS_SHORT.map((m, i) => ({
    month: m,
    TotalGross:        parseFloat(map[i+1]?.TotalGross        || 0),
    TotalNet:          parseFloat(map[i+1]?.TotalNet          || 0),
    TotalCollected:    parseFloat(map[i+1]?.TotalCollected    || 0),
    TotalOutstanding:  parseFloat(map[i+1]?.TotalOutstanding  || 0),
    TotalTransactions: parseInt(map[i+1]?.TotalTransactions   || 0),
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL EXPORT
// ─────────────────────────────────────────────────────────────────────────────
const exportToExcel = async ({ year, month, summary, monthly12, services, topClients }) => {
  const XLSX = await new Promise(resolve => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    document.head.appendChild(s);
  });

  const periodLabel = month ? `${MONTHS[month-1]} ${year}` : `Full Year ${year}`;
  const wb = XLSX.utils.book_new();
  const P = {
    darkGreen:"1E6B3C", maroon:"7B1D14", maroonMid:"B03A2E",
    gold:"7D6608", blue:"154360", red:"922B21",
    white:"FFFFFF", grey1:"212529", grey2:"495057",
    grey3:"ADB5BD", grey4:"DEE2E6", stripe:"F2F2F2",
  };
  const bd = (c = P.grey4) => ({
    top:{style:"thin",color:{rgb:c}}, bottom:{style:"thin",color:{rgb:c}},
    left:{style:"thin",color:{rgb:c}}, right:{style:"thin",color:{rgb:c}},
  });
  const STYLES = {
    bigTitle:      { font:{bold:true,sz:20,color:{rgb:P.maroon}}, alignment:{horizontal:"left",vertical:"center"} },
    subTitle:      { font:{sz:11,color:{rgb:P.grey2}}, alignment:{horizontal:"left",vertical:"center"} },
    meta:          { font:{sz:9,italic:true,color:{rgb:P.grey3}}, alignment:{horizontal:"left",vertical:"center"} },
    sectionHeader: (bg=P.darkGreen) => ({ font:{bold:true,sz:10,color:{rgb:P.white}}, fill:{fgColor:{rgb:bg}}, alignment:{horizontal:"left",vertical:"center",indent:1}, border:bd(bg) }),
    colHead:       (bg=P.darkGreen) => ({ font:{bold:true,sz:9,color:{rgb:P.white}}, fill:{fgColor:{rgb:bg}}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border:bd(bg) }),
    rowLabel:      (bg=P.white, bold=false) => ({ font:{sz:10,bold,color:{rgb:P.grey1}}, fill:{fgColor:{rgb:bg}}, alignment:{horizontal:"left",vertical:"center",indent:1}, border:bd(P.grey4) }),
    num:           (bg=P.white, bold=false, color=P.grey1) => ({ font:{sz:10,bold,color:{rgb:color}}, fill:{fgColor:{rgb:bg}}, alignment:{horizontal:"right",vertical:"center"}, border:bd(P.grey4) }),
    totalLabel:    { font:{bold:true,sz:10,color:{rgb:P.white}}, fill:{fgColor:{rgb:P.maroon}}, alignment:{horizontal:"left",vertical:"center",indent:1}, border:bd(P.maroon) },
    totalNum:      (color=P.white) => ({ font:{bold:true,sz:10,color:{rgb:color}}, fill:{fgColor:{rgb:P.maroon}}, alignment:{horizontal:"right",vertical:"center"}, border:bd(P.maroon) }),
    footnote:      { font:{sz:8,italic:true,color:{rgb:P.grey3}}, alignment:{horizontal:"left",vertical:"center"} },
  };
  const C_FMT='"₱"#,##0.00', N_FMT="#,##0";
  const wc=(ws,ref,val,style,numFmt)=>{ ws[ref]={v:val,t:typeof val==="number"?"n":"s",s:style}; if(numFmt) ws[ref].z=numFmt; };
  const ec=(r,c)=>XLSX.utils.encode_cell({r,c});

  // Sheet 1 — Executive Summary
  (() => {
    const ws={}, merges=[]; let r=0;
    wc(ws,ec(r,0),"CDJ ACCOUNTING AND AUDITING OFFICE",STYLES.bigTitle); merges.push({s:{r,c:0},e:{r,c:3}}); r++;
    wc(ws,ec(r,0),"REVENUE REPORT — EXECUTIVE SUMMARY",STYLES.subTitle); merges.push({s:{r,c:0},e:{r,c:3}}); r++;
    wc(ws,ec(r,0),`Reporting Period: ${periodLabel}`,{font:{bold:true,sz:10,color:{rgb:P.maroon}},alignment:{horizontal:"left"}}); merges.push({s:{r,c:0},e:{r,c:3}}); r++;
    wc(ws,ec(r,0),`Generated: ${new Date().toLocaleString("en-PH")}`,STYLES.meta); merges.push({s:{r,c:0},e:{r,c:3}}); r++;r++;
    wc(ws,ec(r,0),"I.  SUMMARY OF REVENUE",STYLES.sectionHeader()); merges.push({s:{r,c:0},e:{r,c:3}}); r++;
    ["METRIC","AMOUNT (₱)","% OF GROSS","NOTES"].forEach((h,ci)=>wc(ws,ec(r,ci),h,STYLES.colHead())); r++;
    const grossVal=parseFloat(summary.TotalGross||0);
    [["Gross Revenue",grossVal,"100.00%","Total billed",P.white,false,P.grey1],
     ["Less: Discounts",parseFloat(summary.TotalDiscount||0),grossVal>0?pct(summary.TotalDiscount,grossVal):"—","Discounts",P.stripe,false,P.red],
     ["Net Revenue",parseFloat(summary.TotalNet||0),grossVal>0?pct(summary.TotalNet,grossVal):"—","Gross less discounts",P.white,true,P.maroon],
     ["Collected",parseFloat(summary.TotalCollected||0),pct(summary.TotalCollected,summary.TotalNet),"Payments received",P.stripe,false,P.blue],
     ["Outstanding",parseFloat(summary.TotalOutstanding||0),pct(summary.TotalOutstanding,summary.TotalNet),"Unpaid",P.white,false,P.red],
    ].forEach(([label,amt,pctStr,note,bg,bold,color])=>{
      wc(ws,ec(r,0),label,STYLES.rowLabel(bg,bold));
      wc(ws,ec(r,1),amt,STYLES.num(bg,bold,color),C_FMT); ws[ec(r,1)].t="n";
      wc(ws,ec(r,2),pctStr,STYLES.num(bg,false,color));
      wc(ws,ec(r,3),note,{...STYLES.rowLabel(bg),font:{sz:9,italic:true,color:{rgb:P.grey2}}}); r++;
    });
    wc(ws,ec(r,0),"Collection Rate",STYLES.totalLabel);
    wc(ws,ec(r,1),pct(summary.TotalCollected,summary.TotalNet),STYLES.totalNum());
    wc(ws,ec(r,2),"",STYLES.totalNum()); wc(ws,ec(r,3),"Collected ÷ Net",{...STYLES.totalLabel,font:{sz:9,italic:true,color:{rgb:P.white}}}); r++;r++;
    r++; wc(ws,ec(r,0),"* All values in Philippine Peso (₱).",STYLES.footnote); merges.push({s:{r,c:0},e:{r,c:3}});
    ws["!cols"]=[{wch:32},{wch:20},{wch:14},{wch:38}]; ws["!merges"]=merges;
    ws["!pageSetup"]={paperSize:9,orientation:"portrait",fitToPage:true,fitToWidth:1,fitToHeight:0};
    ws["!ref"]=`A1:${ec(r,3)}`; XLSX.utils.book_append_sheet(wb,ws,"Executive Summary");
  })();

  // Sheet 2 — Monthly
  (() => {
    const ws={}, merges=[]; let r=0;
    wc(ws,ec(r,0),"CDJ ACCOUNTING AND AUDITING OFFICE",STYLES.bigTitle); merges.push({s:{r,c:0},e:{r,c:6}}); r++;
    wc(ws,ec(r,0),`MONTHLY REVENUE SCHEDULE — ${year}`,STYLES.subTitle); merges.push({s:{r,c:0},e:{r,c:6}}); r++;
    wc(ws,ec(r,0),`Generated: ${new Date().toLocaleString("en-PH")}`,STYLES.meta); merges.push({s:{r,c:0},e:{r,c:6}}); r++;r++;
    wc(ws,ec(r,0),"MONTHLY REVENUE BREAKDOWN",STYLES.sectionHeader()); merges.push({s:{r,c:0},e:{r,c:6}}); r++;
    ["MONTH","GROSS","DISCOUNTS","NET","COLLECTED","OUTSTANDING","TXN"].forEach((h,ci)=>
      wc(ws,ec(r,ci),h,STYLES.colHead([P.darkGreen,P.darkGreen,P.red,P.maroon,P.blue,P.maroon,P.darkGreen][ci]))); r++;
    monthly12.forEach((row,i)=>{
      const bg=i%2===0?P.white:P.stripe, disc=row.TotalGross-row.TotalNet, dim=row.TotalGross===0;
      wc(ws,ec(r,0),row.month,STYLES.rowLabel(bg,true));
      [row.TotalGross,disc,row.TotalNet,row.TotalCollected,row.TotalOutstanding].forEach((v,ci)=>{
        ws[ec(r,ci+1)]={v,t:"n",s:STYLES.num(bg,ci===2,dim?P.grey3:[P.grey1,P.red,P.maroon,P.blue,P.red][ci]),z:C_FMT};
      });
      ws[ec(r,6)]={v:row.TotalTransactions,t:"n",s:STYLES.num(bg,false,dim?P.grey3:P.grey1),z:N_FMT}; r++;
    });
    const [mg,mn,mc,mo,mt]=[
      monthly12.reduce((a,x)=>a+x.TotalGross,0), monthly12.reduce((a,x)=>a+x.TotalNet,0),
      monthly12.reduce((a,x)=>a+x.TotalCollected,0), monthly12.reduce((a,x)=>a+x.TotalOutstanding,0),
      monthly12.reduce((a,x)=>a+x.TotalTransactions,0),
    ];
    wc(ws,ec(r,0),"TOTAL",STYLES.totalLabel);
    [[mg],[mg-mn],[mn],[mc],[mo]].forEach(([v],ci)=>{ ws[ec(r,ci+1)]={v,t:"n",s:STYLES.totalNum(),z:C_FMT}; });
    ws[ec(r,6)]={v:mt,t:"n",s:STYLES.totalNum(),z:N_FMT}; r++;r++;
    wc(ws,ec(r,0),"* Net = Gross less Discounts.",STYLES.footnote); merges.push({s:{r,c:0},e:{r,c:6}});
    ws["!cols"]=[{wch:12},{wch:18},{wch:14},{wch:18},{wch:16},{wch:16},{wch:10}]; ws["!merges"]=merges;
    ws["!pageSetup"]={paperSize:9,orientation:"landscape",fitToPage:true,fitToWidth:1,fitToHeight:0};
    ws["!ref"]=`A1:${ec(r,6)}`; XLSX.utils.book_append_sheet(wb,ws,"Monthly Revenue");
  })();

  const fname=`CDJ_Revenue_${year}${month?`_${MONTHS[month-1].slice(0,3)}`:""}.xlsx`;
  XLSX.writeFile(wb,fname,{bookType:"xlsx",type:"binary",cellStyles:true});
};

// ─────────────────────────────────────────────────────────────────────────────
// CHART TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: "8px 12px" }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
        {label}
      </Typography>
      {payload.map(p => (
        <Box key={p.name} sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" color="text.secondary">{p.name}</Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: p.color, fontFamily: "monospace" }}>
            {short(p.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const RevenueReport = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [year,        setYear]        = useState(new Date().getFullYear());
  const [month,       setMonth]       = useState("");
  const [activeTab,   setActiveTab]   = useState(0);
  const [chartMetric, setChartMetric] = useState("TotalNet");

  const C = {
    maroon: "#B03A2E", gold:   "#C9A84C",
    blue:   "#2E86C1", dark:   "#7B241C",
    teal:   "#17A589", purple: "#7D3C98",
  };

  const METRIC_OPTS = [
    { key: "TotalGross",       label: "Gross",       labelFull: "Gross Revenue", color: C.maroon },
    { key: "TotalNet",         label: "Net",         labelFull: "Net Revenue",   color: C.gold   },
    { key: "TotalCollected",   label: "Collected",   labelFull: "Collected",     color: C.blue   },
    { key: "TotalOutstanding", label: "Outstanding", labelFull: "Outstanding",   color: C.dark   },
  ];

  const RANK_COLORS = [C.maroon, C.gold, C.blue, C.teal, C.purple, "#E67E22", "#27AE60", "#2980B9"];

  // ── Queries ────────────────────────────────────────────────────────────────
  const yearsQ = useQuery({
    queryKey: ["rev-years"],
    placeholderData: [],
    queryFn: async () => {
      try {
        const r = await http.get("/revenue-available-years");
        return Array.isArray(r?.data?.data) ? r.data.data : [];
      } catch { return []; }
    },
  });

  const summaryQ = useQuery({
    queryKey: ["rev-summary", year, month],
    placeholderData: {},
    queryFn: async () => {
      try {
        const p = { year };
        if (month) p.month = month;
        const r = await http.get("/revenue-summary-totals", { params: p });
        return (r?.data?.data && typeof r.data.data === "object") ? r.data.data : {};
      } catch { return {}; }
    },
  });

  const monthlyQ = useQuery({
    queryKey: ["rev-monthly", year],
    placeholderData: [],
    queryFn: async () => {
      try {
        const r = await http.get("/revenue-monthly", { params: { year } });
        return Array.isArray(r?.data?.data) ? r.data.data : [];
      } catch { return []; }
    },
  });

  const serviceQ = useQuery({
    queryKey: ["rev-service", year, month],
    placeholderData: [],
    queryFn: async () => {
      try {
        const p = { year };
        if (month) p.month = month;
        const r = await http.get("/revenue-by-service", { params: p });
        return Array.isArray(r?.data?.data) ? r.data.data : [];
      } catch { return []; }
    },
  });

  const clientQ = useQuery({
    queryKey: ["rev-client", year, month],
    placeholderData: [],
    queryFn: async () => {
      try {
        const p = { year, limit: 10 };
        if (month) p.month = month;
        const r = await http.get("/revenue-by-client", { params: p });
        return Array.isArray(r?.data?.data) ? r.data.data : [];
      } catch { return []; }
    },
  });

  // ── Hard guards: never trust .data directly ────────────────────────────────
  const summary    = (summaryQ.data && typeof summaryQ.data === "object" && !Array.isArray(summaryQ.data))
                       ? summaryQ.data : {};
  const monthly12  = scaffold12(Array.isArray(monthlyQ.data) ? monthlyQ.data : []);
  const services   = Array.isArray(serviceQ.data)  ? serviceQ.data  : [];
  const topClients = Array.isArray(clientQ.data)   ? clientQ.data   : [];
  const years      = Array.isArray(yearsQ.data)    ? yearsQ.data    : [];
  const isLoading  = summaryQ.isLoading;
  const period     = month ? `${MONTHS[month-1]} ${year}` : `FY ${year}`;

  // ── Derived totals ─────────────────────────────────────────────────────────
  const sT = {
    gross:   services.reduce((a,s) => a + parseFloat(s.TotalGross       || 0), 0),
    disc:    services.reduce((a,s) => a + parseFloat(s.TotalDiscount    || 0), 0),
    net:     services.reduce((a,s) => a + parseFloat(s.TotalNet         || 0), 0),
    coll:    services.reduce((a,s) => a + parseFloat(s.TotalCollected   || 0), 0),
    out:     services.reduce((a,s) => a + parseFloat(s.TotalOutstanding || 0), 0),
    availed: services.reduce((a,s) => a + parseInt(s.TimesAvailed       || 0), 0),
    qty:     services.reduce((a,s) => a + parseInt(s.TotalQty           || 0), 0),
  };
  const mT = {
    gross: monthly12.reduce((a,r) => a + r.TotalGross,        0),
    net:   monthly12.reduce((a,r) => a + r.TotalNet,          0),
    coll:  monthly12.reduce((a,r) => a + r.TotalCollected,    0),
    out:   monthly12.reduce((a,r) => a + r.TotalOutstanding,  0),
    txn:   monthly12.reduce((a,r) => a + r.TotalTransactions, 0),
  };

  // ── Service client expansion ───────────────────────────────────────────────
  const [expandedService, setExpandedService] = useState(null);
  const [serviceClients,  setServiceClients]  = useState({});

  const toggleServiceExpand = async (serviceId) => {
    if (expandedService === serviceId) { setExpandedService(null); return; }
    setExpandedService(serviceId);
    if (serviceClients[serviceId]) return;
    setServiceClients(prev => ({ ...prev, [serviceId]: { loading: true, data: [] } }));
    try {
      const p = { year, serviceid: serviceId };
      if (month) p.month = month;
      const res = await http.get("/revenue-by-service-clients", { params: p });
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setServiceClients(prev => ({ ...prev, [serviceId]: { loading: false, data } }));
    } catch {
      setServiceClients(prev => ({ ...prev, [serviceId]: { loading: false, data: [] } }));
    }
  };

  const activeMetric = METRIC_OPTS.find(m => m.key === chartMetric);
  const gridColor    = isDark ? "#ffffff0a" : "#00000008";
  const axisProps    = { fontSize: 9, fill: isDark ? "#666" : "#aaa" };
  const collRate     = parseFloat(summary.TotalNet) > 0
    ? ((parseFloat(summary.TotalCollected) / parseFloat(summary.TotalNet)) * 100).toFixed(1)
    : 0;

  // Shared table style tokens
  const headerSx = {
    fontWeight: "bold", fontSize: "0.78rem", whiteSpace: "nowrap",
    px: 1.5, py: 1.2,
    backgroundColor: "action.hover",
    color: "text.secondary",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid",
    borderColor: "divider",
  };
  const cellSx = {
    fontSize: "0.82rem", whiteSpace: "nowrap",
    px: 1.5, py: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
  };
  const footerSx = {
    fontSize: "0.82rem", fontWeight: "bold", whiteSpace: "nowrap",
    px: 1.5, py: 1,
    backgroundColor: isDark ? alpha("#fff", 0.04) : alpha("#000", 0.03),
    borderTop: "2px solid",
    borderColor: "divider",
    borderBottom: "none",
  };

  const discColor = isDark ? "#e57373" : "#c0392b";
  const netColor  = isDark ? "#d4a017" : "#7a6020";
  const collColor = isDark ? "#5dade2" : "#1a5276";
  const outColor  = isDark ? "#e08070" : "#7b1d14";

  const SkeletonRows = ({ rows, cols }) =>
    [...Array(rows)].map((_, i) => (
      <TableRow key={i} sx={{ backgroundColor: i % 2 !== 0 ? "action.hover" : "transparent" }}>
        {[...Array(cols)].map((_, j) => (
          <TableCell key={j} sx={cellSx}><Skeleton variant="text" width="80%" /></TableCell>
        ))}
      </TableRow>
    ));

  const EmptyRow = ({ cols, message = "No data for selected period" }) => (
    <TableRow>
      <TableCell colSpan={cols} align="center"
        sx={{ py: 4, color: "text.secondary", fontSize: "0.82rem", border: "none" }}>
        {message}
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── TOOLBAR ── */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{
          p: 2,
          borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 1.5,
        }}>
          {/* Left: title + period chip */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BarChartIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="subtitle2" fontWeight="bold">Revenue Report</Typography>
            <Chip
              label={period}
              size="small" color="primary" variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
            <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
              CDJ Accounting &amp; Auditing Office
            </Typography>
          </Box>

          {/* Right: period picker + export */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{
              display: "flex", alignItems: "center",
              bgcolor: "background.paper",
              border: "1px solid", borderColor: "divider",
              borderRadius: 1, overflow: "hidden", height: 32,
            }}>
              <Select
                value={year}
                onChange={e => { setYear(e.target.value); setExpandedService(null); setServiceClients({}); }}
                variant="standard" disableUnderline
                sx={{ fontSize: "0.78rem", fontWeight: 700, px: 1.25, height: 32, "& .MuiSelect-select": { py: 0 } }}
              >
                {(years.length === 0 ? [new Date().getFullYear()] : years).map(y => (
                  <MenuItem key={y} value={y} sx={{ fontSize: "0.78rem" }}>{y}</MenuItem>
                ))}
              </Select>
              <Box sx={{ width: "1px", height: 18, bgcolor: "divider" }} />
              <Select
                value={month}
                onChange={e => { setMonth(e.target.value); setExpandedService(null); setServiceClients({}); }}
                variant="standard" disableUnderline
                sx={{ fontSize: "0.78rem", px: 1.25, height: 32, color: month ? "text.primary" : "text.secondary", "& .MuiSelect-select": { py: 0 } }}
              >
                <MenuItem value="" sx={{ fontSize: "0.78rem" }}>All Months</MenuItem>
                {MONTHS.map((m, i) => (
                  <MenuItem key={i+1} value={i+1} sx={{ fontSize: "0.78rem" }}>{m}</MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              disabled={summaryQ.isLoading || monthlyQ.isLoading || serviceQ.isLoading || clientQ.isLoading}
              onClick={() => exportToExcel({ year, month, summary, monthly12, services, topClients })}
              sx={{ height: 32, fontSize: "0.75rem", fontWeight: 600, textTransform: "none", borderRadius: 1 }}
            >
              Export Excel
            </Button>
          </Box>
        </Box>

        {/* ── KPI CARDS ROW ── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", lg: "repeat(6,1fr)" },
          borderBottom: "1px solid", borderColor: "divider",
        }}>
          {[
            { label: "Gross Revenue",  value: short(summary.TotalGross),       sub: `FY ${year}`,                                           icon: <TrendingUpIcon fontSize="small"/>,          color: C.maroon, metric: "TotalGross"       },
            { label: "Net Revenue",    value: short(summary.TotalNet),         sub: "After discounts",                                      icon: <TrendingUpIcon fontSize="small"/>,          color: C.gold,   metric: "TotalNet"         },
            { label: "Collected",      value: short(summary.TotalCollected),   sub: `${pct(summary.TotalCollected, summary.TotalNet)} rate`, icon: <PaidIcon fontSize="small"/>,                color: C.blue,   metric: "TotalCollected"   },
            { label: "Outstanding",    value: short(summary.TotalOutstanding), sub: `Disc: ${short(summary.TotalDiscount)}`,                icon: <AccountBalanceWalletIcon fontSize="small"/>, color: C.dark,   metric: "TotalOutstanding" },
            { label: "Transactions",   value: summary.TotalTransactions ?? "—",sub: "Total invoices",                                       icon: <ReceiptLongIcon fontSize="small"/>,         color: C.teal,   metric: null               },
            { label: "Unique Clients", value: summary.UniqueClients ?? "—",    sub: `This ${month ? MONTHS[month-1] : "year"}`,             icon: <GroupIcon fontSize="small"/>,               color: C.purple, metric: null               },
          ].map((card, idx, arr) => (
            <Box
              key={card.label}
              onClick={card.metric ? () => { setChartMetric(card.metric); setActiveTab(0); } : undefined}
              sx={{
                px: 2, py: 1.5,
                cursor: card.metric ? "pointer" : "default",
                borderRight: idx < arr.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                borderLeft: `3px solid ${card.metric === chartMetric ? card.color : "transparent"}`,
                bgcolor: card.metric === chartMetric
                  ? (isDark ? alpha(card.color, 0.1) : alpha(card.color, 0.05))
                  : "transparent",
                transition: "background-color 0.12s, border-left-color 0.12s",
                "&:hover": card.metric ? {
                  bgcolor: isDark ? alpha(card.color, 0.08) : alpha(card.color, 0.04),
                  borderLeftColor: card.color,
                } : {},
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Typography sx={{
                  fontSize: "0.65rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  color: "text.secondary",
                }}>
                  {card.label}
                </Typography>
              </Box>
              {isLoading
                ? <Skeleton width={72} height={22} />
                : <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "text.primary", fontFamily: "monospace", lineHeight: 1.2 }}>
                    {card.value}
                  </Typography>
              }
              {card.sub && !isLoading && (
                <Typography sx={{ fontSize: "0.65rem", color: "text.disabled", mt: "2px" }}>{card.sub}</Typography>
              )}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── MAIN PANEL ── */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>

        {/* Tab bar */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid", borderColor: "divider",
          px: 2,
          backgroundColor: "action.hover",
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40, fontSize: "0.78rem", fontWeight: 600,
                textTransform: "none", px: 2, py: 0, minWidth: "auto",
                color: "text.secondary",
              },
              "& .Mui-selected": { color: `${C.maroon} !important` },
              "& .MuiTabs-indicator": { backgroundColor: C.maroon, height: 2 },
            }}
          >
            <Tab label="Chart" />
            <Tab label="Monthly" />
            <Tab label="By Service" />
            <Tab label="By Client" />
          </Tabs>

          {/* Summary badges */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.75 }}>
            {!isLoading && [
              { label: `Net: ${short(summary.TotalNet)}`,        color: C.gold   },
              { label: `Coll. ${collRate}%`,                      color: C.blue   },
              { label: `Disc: ${short(summary.TotalDiscount)}`,  color: C.dark   },
            ].map(c => (
              <Chip
                key={c.label}
                label={c.label}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.65rem", height: 20,
                  borderColor: alpha(c.color, 0.4),
                  color: c.color,
                  bgcolor: alpha(c.color, 0.07),
                  fontWeight: 700,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* ── TAB 0: CHART ── */}
        {activeTab === 0 && (
          <Box sx={{ p: 2.5 }}>
            {/* Chart header */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              mb: 2, pb: 1.5, borderBottom: "1px solid", borderColor: "divider",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 3, height: 16, borderRadius: 2, backgroundColor: activeMetric?.color }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  {activeMetric?.labelFull} — Monthly Trend {year}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {METRIC_OPTS.map(m => (
                  <Chip
                    key={m.key}
                    label={m.label}
                    size="small"
                    onClick={() => setChartMetric(m.key)}
                    variant={chartMetric === m.key ? "filled" : "outlined"}
                    sx={{
                      fontSize: "0.68rem", height: 22, fontWeight: 700,
                      cursor: "pointer",
                      borderColor: alpha(m.color, chartMetric === m.key ? 1 : 0.35),
                      color: chartMetric === m.key ? "#fff" : m.color,
                      bgcolor: chartMetric === m.key ? m.color : alpha(m.color, 0.06),
                      "&:hover": { bgcolor: chartMetric === m.key ? m.color : alpha(m.color, 0.12) },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {monthlyQ.isLoading
              ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1.5 }} />
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthly12} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={activeMetric?.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={activeMetric?.color} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke={gridColor} />
                    <XAxis dataKey="month" tick={axisProps} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={short} tick={axisProps} tickLine={false} axisLine={false} width={54} />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey={chartMetric} name={activeMetric?.labelFull}
                      stroke={activeMetric?.color} strokeWidth={2} fill="url(#aGrad)"
                      dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: activeMetric?.color }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }

            {/* Chart footer summary */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider",
            }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: activeMetric?.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                {activeMetric?.labelFull} · {period}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, fontFamily: "monospace", color: "text.primary" }}>
                {isLoading ? "—" : fmt(summary[chartMetric])}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── TAB 1: MONTHLY ── */}
        {activeTab === 1 && (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    { label: "Mo.",         align: "left"  },
                    { label: "Gross",       align: "right" },
                    { label: "Disc.",       align: "right", color: discColor },
                    { label: "Net",         align: "right", color: netColor  },
                    { label: "Collected",   align: "right", color: collColor },
                    { label: "Outstanding", align: "right", color: outColor  },
                    { label: "Txn",         align: "right" },
                  ].map(h => (
                    <TableCell key={h.label} align={h.align || "left"}
                      sx={{ ...headerSx, color: h.color || "text.secondary" }}>
                      {h.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyQ.isLoading
                  ? <SkeletonRows rows={12} cols={7} />
                  : monthly12.map((row, i) => {
                      const has  = row.TotalGross > 0;
                      const disc = row.TotalGross - row.TotalNet;
                      return (
                        <TableRow key={row.month} hover
                          sx={{
                            opacity: has ? 1 : 0.4,
                            backgroundColor: i % 2 !== 0 ? "action.hover" : "transparent",
                            "&:hover": { backgroundColor: "action.selected" },
                          }}>
                          <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>{row.month}</TableCell>
                          <TableCell align="right" sx={cellSx}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{fmt(row.TotalGross)}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={cellSx}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", color: discColor }}>{fmt(disc)}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={cellSx}>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: netColor }}>{fmt(row.TotalNet)}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={cellSx}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", color: collColor }}>{fmt(row.TotalCollected)}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={cellSx}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", color: outColor }}>{fmt(row.TotalOutstanding)}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ ...cellSx, color: "text.secondary" }}>{row.TotalTransactions}</TableCell>
                        </TableRow>
                      );
                    })
                }
              </TableBody>
              {!monthlyQ.isLoading && (
                <TableFooter>
                  <TableRow sx={{ backgroundColor: isDark ? alpha("#fff", 0.04) : alpha("#000", 0.03) }}>
                    <TableCell align="left"  sx={footerSx}>Total</TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>{fmt(mT.gross)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: discColor }}>{fmt(mT.gross - mT.net)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: netColor }}>{fmt(mT.net)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: collColor }}>{fmt(mT.coll)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: outColor }}>{fmt(mT.out)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>{mT.txn}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </TableContainer>
        )}

        {/* ── TAB 2: BY SERVICE (with expandable client breakdown) ── */}
        {activeTab === 2 && (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...headerSx, width: 36, p: 0 }} />
                  {[
                    { label: "#",           align: "left"  },
                    { label: "Service",     align: "left"  },
                    { label: "Availed",     align: "right" },
                    { label: "Qty",         align: "right" },
                    { label: "Gross",       align: "right" },
                    { label: "Disc.",       align: "right", color: discColor },
                    { label: "Net",         align: "right", color: netColor  },
                    { label: "Collected",   align: "right", color: collColor },
                    { label: "Outstanding", align: "right", color: outColor  },
                  ].map(h => (
                    <TableCell key={h.label} align={h.align || "left"}
                      sx={{ ...headerSx, color: h.color || "text.secondary" }}>
                      {h.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceQ.isLoading
                  ? <SkeletonRows rows={6} cols={10} />
                  : services.length === 0
                  ? <EmptyRow cols={10} />
                  : services.map((s, i) => {
                      const svcId    = s.ServiceID ?? i;
                      const isOpen   = expandedService === svcId;
                      const svcState = serviceClients[svcId];
                      const rowBg    = i % 2 !== 0 ? "action.hover" : "transparent";
                      return (
                        // ✅ FIX: Use React.Fragment with key instead of bare <>
                        // This ensures React correctly tracks children and prevents
                        // the Tooltip from receiving undefined children.
                        <React.Fragment key={`svc-frag-${svcId}`}>
                          {/* ── Main service row ── */}
                          <TableRow
                            sx={{
                              backgroundColor: isOpen
                                ? (isDark ? alpha(C.maroon, 0.1) : alpha(C.maroon, 0.05))
                                : rowBg,
                              "&:hover": { backgroundColor: isOpen ? alpha(C.maroon, 0.08) : "action.selected" },
                              cursor: "pointer",
                            }}
                            onClick={() => toggleServiceExpand(svcId)}
                          >
                            <TableCell sx={{ ...cellSx, p: 0, width: 36, textAlign: "center" }}>
                              <Tooltip title={isOpen ? "Hide clients" : "Show clients"}>
                                <IconButton size="small" sx={{ color: isOpen ? C.maroon : "text.disabled" }}>
                                  {isOpen
                                    ? <KeyboardArrowDownIcon fontSize="small" />
                                    : <KeyboardArrowRightIcon fontSize="small" />
                                  }
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", width: 40, textAlign: "center" }}>{i+1}</TableCell>
                            <TableCell sx={{ ...cellSx, fontWeight: "bold", color: isOpen ? C.maroon : "text.primary" }}>
                              {s.ServiceName}
                            </TableCell>
                            <TableCell align="right" sx={{ ...cellSx, color: "text.secondary" }}>{s.TimesAvailed ?? 0}</TableCell>
                            <TableCell align="right" sx={{ ...cellSx, color: "text.secondary" }}>{s.TotalQty ?? 0}</TableCell>
                            <TableCell align="right" sx={cellSx}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{fmt(s.TotalGross)}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={cellSx}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: discColor }}>{fmt(s.TotalDiscount)}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={cellSx}>
                              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: netColor }}>{fmt(s.TotalNet)}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={cellSx}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: collColor }}>{fmt(s.TotalCollected)}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={cellSx}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: outColor }}>{fmt(s.TotalOutstanding)}</Typography>
                            </TableCell>
                          </TableRow>

                          {/* ── Expanded client sub-table ── */}
                          <TableRow sx={{ backgroundColor: "transparent" }}>
                            <TableCell colSpan={10} sx={{ p: 0, border: "none" }}>
                              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <Box sx={{
                                  mx: 2, my: 1,
                                  border: "1px solid", borderColor: alpha(C.maroon, 0.25),
                                  borderRadius: 1.5, overflow: "hidden",
                                  backgroundColor: isDark ? alpha(C.maroon, 0.04) : alpha(C.maroon, 0.02),
                                }}>
                                  {/* Sub-table header */}
                                  <Box sx={{
                                    px: 1.5, py: 0.75,
                                    display: "flex", alignItems: "center", gap: 1,
                                    borderBottom: "1px solid", borderColor: alpha(C.maroon, 0.2),
                                    backgroundColor: isDark ? alpha(C.maroon, 0.1) : alpha(C.maroon, 0.06),
                                  }}>
                                    <PeopleAltIcon sx={{ fontSize: "0.85rem", color: C.maroon }} />
                                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: C.maroon, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                      Clients who availed — {s.ServiceName}
                                    </Typography>
                                    {svcState && !svcState.loading && (
                                      <Chip
                                        label={`${svcState.data.length} client${svcState.data.length !== 1 ? "s" : ""}`}
                                        size="small" variant="outlined"
                                        sx={{ fontSize: "0.62rem", height: 18, borderColor: alpha(C.maroon, 0.4), color: C.maroon, ml: "auto" }}
                                      />
                                    )}
                                  </Box>

                                  {/* Sub-table body */}
                                  {svcState?.loading ? (
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 2.5 }}>
                                      <CircularProgress size={14} sx={{ color: C.maroon }} />
                                      <Typography variant="caption" color="text.secondary">Loading clients…</Typography>
                                    </Box>
                                  ) : !svcState?.data?.length ? (
                                    <Box sx={{ py: 2.5, textAlign: "center" }}>
                                      <Typography variant="caption" color="text.secondary">No client data available.</Typography>
                                    </Box>
                                  ) : (
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          {[
                                            { label: "#",           align: "left"  },
                                            { label: "Client",      align: "left"  },
                                            { label: "Type",        align: "left"  },
                                            { label: "Txn",         align: "right" },
                                            { label: "Gross",       align: "right" },
                                            { label: "Disc.",       align: "right", color: discColor },
                                            { label: "Net",         align: "right", color: netColor  },
                                            { label: "Collected",   align: "right", color: collColor },
                                            { label: "Outstanding", align: "right", color: outColor  },
                                          ].map(h => (
                                            <TableCell key={h.label} align={h.align || "left"} sx={{
                                              fontSize: "0.68rem", fontWeight: 700,
                                              textTransform: "uppercase", letterSpacing: "0.05em",
                                              color: h.color || "text.secondary",
                                              px: 1.5, py: 0.75,
                                              backgroundColor: "transparent",
                                              borderBottom: "1px solid", borderColor: alpha(C.maroon, 0.15),
                                              whiteSpace: "nowrap",
                                            }}>
                                              {h.label}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(svcState?.data ?? []).map((c, ci) => (
                                          <TableRow key={c.ClientID ?? ci}
                                            sx={{
                                              backgroundColor: ci % 2 !== 0 ? alpha(C.maroon, 0.03) : "transparent",
                                              "&:hover": { backgroundColor: alpha(C.maroon, 0.06) },
                                            }}>
                                            <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.7rem", width: 36, textAlign: "center" }}>{ci + 1}</TableCell>
                                            <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>{c.ClientName || c.ClientID}</TableCell>
                                            <TableCell sx={cellSx}>
                                              {c.ClientType
                                                ? <Chip label={c.ClientType} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 18 }} />
                                                : <Typography component="span" sx={{ fontSize: "0.78rem", color: "text.disabled" }}>—</Typography>
                                              }
                                            </TableCell>
                                            <TableCell align="right" sx={{ ...cellSx, color: "text.secondary" }}>{c.TotalTransactions ?? 0}</TableCell>
                                            <TableCell align="right" sx={cellSx}>
                                              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{fmt(c.TotalGross)}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={cellSx}>
                                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: discColor }}>{fmt(c.TotalDiscount)}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={cellSx}>
                                              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: netColor }}>{fmt(c.TotalNet)}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={cellSx}>
                                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: collColor }}>{fmt(c.TotalCollected)}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={cellSx}>
                                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: outColor }}>{fmt(c.TotalOutstanding)}</Typography>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })
                }
              </TableBody>
              {services.length > 0 && !serviceQ.isLoading && (
                <TableFooter>
                  <TableRow sx={{ backgroundColor: isDark ? alpha("#fff", 0.04) : alpha("#000", 0.03) }}>
                    <TableCell sx={footerSx} />
                    <TableCell sx={footerSx} />
                    <TableCell align="left"  sx={footerSx}>Total</TableCell>
                    <TableCell align="right" sx={footerSx}>{sT.availed}</TableCell>
                    <TableCell align="right" sx={footerSx}>{sT.qty}</TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>{fmt(sT.gross)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: discColor }}>{fmt(sT.disc)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: netColor }}>{fmt(sT.net)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: collColor }}>{fmt(sT.coll)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={footerSx}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: outColor }}>{fmt(sT.out)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </TableContainer>
        )}

        {/* ── TAB 3: BY CLIENT ── */}
        {activeTab === 3 && (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    { label: "#",           align: "left"  },
                    { label: "Client",      align: "left"  },
                    { label: "Type",        align: "left"  },
                    { label: "Txn",         align: "right" },
                    { label: "Gross",       align: "right" },
                    { label: "Net",         align: "right", color: netColor  },
                    { label: "Collected",   align: "right", color: collColor },
                    { label: "Outstanding", align: "right", color: outColor  },
                  ].map(h => (
                    <TableCell key={h.label} align={h.align || "left"}
                      sx={{ ...headerSx, color: h.color || "text.secondary" }}>
                      {h.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {clientQ.isLoading
                  ? <SkeletonRows rows={8} cols={8} />
                  : topClients.length === 0
                  ? <EmptyRow cols={8} />
                  : topClients.map((c2, i) => (
                      <TableRow key={c2.ClientID ?? i} hover
                        sx={{
                          backgroundColor: i % 2 !== 0 ? "action.hover" : "transparent",
                          "&:hover": { backgroundColor: "action.selected" },
                        }}>
                        <TableCell sx={{ ...cellSx, width: 48 }}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: "50%",
                            bgcolor: alpha(RANK_COLORS[i % RANK_COLORS.length], 0.15),
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: RANK_COLORS[i % RANK_COLORS.length], lineHeight: 1 }}>
                              {i+1}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>{c2.ClientName || c2.ClientID}</TableCell>
                        <TableCell sx={cellSx}>
                          {c2.ClientType
                            ? <Chip label={c2.ClientType} size="small" variant="outlined" sx={{ fontSize: "0.68rem", height: 20 }} />
                            : <Typography component="span" sx={{ fontSize: "0.78rem", color: "text.disabled" }}>—</Typography>
                          }
                        </TableCell>
                        <TableCell align="right" sx={{ ...cellSx, color: "text.secondary" }}>{c2.TotalTransactions ?? 0}</TableCell>
                        <TableCell align="right" sx={cellSx}>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{fmt(c2.TotalGross)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={cellSx}>
                          <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: netColor }}>{fmt(c2.TotalNet)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={cellSx}>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", color: collColor }}>{fmt(c2.TotalCollected)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={cellSx}>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", color: outColor }}>{fmt(c2.TotalOutstanding)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </Paper>
    </Box>
  );
};

export default RevenueReport;