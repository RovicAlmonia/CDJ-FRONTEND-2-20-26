// ============================================================
// RevenueReport.jsx — CDJ Accounting & Auditing Office
// UI: WooCommerce Analytics style
// Excel: Professional CDJ financial report format
// ============================================================
import {
  Box, Button, Card, CardContent, FormControl, InputLabel,
  MenuItem, Select, Skeleton, Stack, Tab, Tabs, Typography, useTheme,
} from "@mui/material";
import TrendingUpIcon           from "@mui/icons-material/TrendingUp";
import TrendingDownIcon         from "@mui/icons-material/TrendingDown";
import PaidIcon                 from "@mui/icons-material/Paid";
import ReceiptLongIcon          from "@mui/icons-material/ReceiptLong";
import GroupIcon                from "@mui/icons-material/Group";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useQuery }             from "@tanstack/react-query";
import { http }                 from "../../api/http";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
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
  return "₱" + n.toFixed(2);
};

const pct = (num, den) =>
  den > 0 ? ((num / den) * 100).toFixed(1) + "%" : "0.0%";

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
// EXCEL EXPORT — CDJ Professional Financial Report Format
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

  // ── Color palette ────────────────────────────────────────────────────────
  const P = {
    darkGreen:   "1E6B3C",
    midGreen:    "27AE60",
    lightGreen:  "E9F7EF",
    maroon:      "7B1D14",
    maroonMid:   "B03A2E",
    maroonLight: "FCEAE8",
    gold:        "7D6608",
    goldLight:   "FEF9E7",
    blue:        "154360",
    blueLight:   "EBF5FB",
    red:         "922B21",
    redLight:    "FDEDEC",
    white:       "FFFFFF",
    nearWhite:   "F8F9FA",
    grey1:       "212529",
    grey2:       "495057",
    grey3:       "ADB5BD",
    grey4:       "DEE2E6",
    stripe:      "F2F2F2",
  };

  const bd = (c = P.grey4) => ({
    top:    { style:"thin", color:{ rgb:c } },
    bottom: { style:"thin", color:{ rgb:c } },
    left:   { style:"thin", color:{ rgb:c } },
    right:  { style:"thin", color:{ rgb:c } },
  });

  // ── Reusable cell styles ─────────────────────────────────────────────────
  const STYLES = {
    bigTitle: {
      font: { bold:true, sz:20, color:{ rgb:P.maroon } },
      alignment: { horizontal:"left", vertical:"center" },
    },
    subTitle: {
      font: { sz:11, color:{ rgb:P.grey2 } },
      alignment: { horizontal:"left", vertical:"center" },
    },
    meta: {
      font: { sz:9, italic:true, color:{ rgb:P.grey3 } },
      alignment: { horizontal:"left", vertical:"center" },
    },
    sectionHeader: (bg = P.darkGreen) => ({
      font: { bold:true, sz:10, color:{ rgb:P.white } },
      fill: { fgColor:{ rgb:bg } },
      alignment: { horizontal:"left", vertical:"center", indent:1 },
      border: bd(bg),
    }),
    colHead: (bg = P.darkGreen) => ({
      font: { bold:true, sz:9, color:{ rgb:P.white } },
      fill: { fgColor:{ rgb:bg } },
      alignment: { horizontal:"center", vertical:"center", wrapText:true },
      border: bd(bg),
    }),
    rowLabel: (bg = P.white, bold = false) => ({
      font: { sz:10, bold, color:{ rgb:P.grey1 } },
      fill: { fgColor:{ rgb:bg } },
      alignment: { horizontal:"left", vertical:"center", indent:1 },
      border: bd(P.grey4),
    }),
    num: (bg = P.white, bold = false, color = P.grey1) => ({
      font: { sz:10, bold, color:{ rgb:color } },
      fill: { fgColor:{ rgb:bg } },
      alignment: { horizontal:"right", vertical:"center" },
      border: bd(P.grey4),
    }),
    totalLabel: {
      font: { bold:true, sz:10, color:{ rgb:P.white } },
      fill: { fgColor:{ rgb:P.maroon } },
      alignment: { horizontal:"left", vertical:"center", indent:1 },
      border: bd(P.maroon),
    },
    totalNum: (color = P.white) => ({
      font: { bold:true, sz:10, color:{ rgb:color } },
      fill: { fgColor:{ rgb:P.maroon } },
      alignment: { horizontal:"right", vertical:"center" },
      border: bd(P.maroon),
    }),
    footnote: {
      font: { sz:8, italic:true, color:{ rgb:P.grey3 } },
      alignment: { horizontal:"left", vertical:"center" },
    },
  };

  const C_FMT   = '"₱"#,##0.00';
  const N_FMT   = "#,##0";
  const PCT_FMT = '0.0"%"';

  // Helper: write a cell
  const wc = (ws, ref, val, style, numFmt) => {
    ws[ref] = {
      v: val,
      t: typeof val === "number" ? "n" : "s",
      s: style,
    };
    if (numFmt) ws[ref].z = numFmt;
  };

  // Helper: encode cell from row/col (0-based)
  const ec = (r, c) => XLSX.utils.encode_cell({ r, c });

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 1 — EXECUTIVE SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  (() => {
    const ws = {};
    const merges = [];
    let r = 0;

    // Row 0: Big title
    wc(ws, ec(r,0), "CDJ ACCOUNTING AND AUDITING OFFICE", STYLES.bigTitle);
    merges.push({ s:{r,c:0}, e:{r,c:3} }); r++;

    // Row 1: subtitle
    wc(ws, ec(r,0), "REVENUE REPORT — EXECUTIVE SUMMARY", STYLES.subTitle);
    merges.push({ s:{r,c:0}, e:{r,c:3} }); r++;

    // Row 2: period
    wc(ws, ec(r,0), `Reporting Period: ${periodLabel}`, {
      font:{ bold:true, sz:10, color:{ rgb:P.maroon } },
      alignment:{ horizontal:"left", vertical:"center" },
    });
    merges.push({ s:{r,c:0}, e:{r,c:3} }); r++;

    // Row 3: generated
    wc(ws, ec(r,0), `Date Generated: ${new Date().toLocaleString("en-PH")}`, STYLES.meta);
    merges.push({ s:{r,c:0}, e:{r,c:3} }); r++;
    r++; // spacer row

    // ── REVENUE SUMMARY TABLE ────────────────────────────────────────────
    wc(ws, ec(r,0), "I.  SUMMARY OF REVENUE", STYLES.sectionHeader());
    merges.push({ s:{r,c:0}, e:{r,c:3} }); r++;

    ["METRIC", "AMOUNT (₱)", "% OF GROSS", "NOTES"].forEach((h, ci) => {
      wc(ws, ec(r,ci), h, STYLES.colHead());
    });
    r++;

    const grossVal = parseFloat(summary.TotalGross || 0);
    const rows = [
      ["Gross Revenue",       grossVal,                                      "100.00%",     "Total billed amount before deductions",    P.white,  false, P.grey1],
      ["Less: Discounts",     parseFloat(summary.TotalDiscount || 0),        grossVal > 0 ? pct(summary.TotalDiscount, grossVal) : "—", "Discounts applied to invoices", P.stripe, false, P.red],
      ["Net Revenue",         parseFloat(summary.TotalNet      || 0),        grossVal > 0 ? pct(summary.TotalNet, grossVal)      : "—", "Gross less discounts",          P.white,  true,  P.maroon],
      ["Collected",           parseFloat(summary.TotalCollected || 0),       pct(summary.TotalCollected, summary.TotalNet),             "Payments received",             P.stripe, false, P.blue],
      ["Outstanding Balance", parseFloat(summary.TotalOutstanding || 0),     pct(summary.TotalOutstanding, summary.TotalNet),           "Unpaid / pending collection",   P.white,  false, P.red],
    ];
    rows.forEach(([label, amt, pctStr, note, bg, bold, color]) => {
      wc(ws, ec(r,0), label,  STYLES.rowLabel(bg, bold));
      wc(ws, ec(r,1), amt,    STYLES.num(bg, bold, color), C_FMT); ws[ec(r,1)].t = "n";
      wc(ws, ec(r,2), pctStr, STYLES.num(bg, false, color));
      wc(ws, ec(r,3), note,   { ...STYLES.rowLabel(bg), font:{ sz:9, italic:true, color:{ rgb:P.grey2 } } });
      r++;
    });

    // Collection rate highlight row
    wc(ws, ec(r,0), "Collection Rate",  STYLES.totalLabel);
    wc(ws, ec(r,1), pct(summary.TotalCollected, summary.TotalNet), STYLES.totalNum());
    wc(ws, ec(r,2), "",                 STYLES.totalNum());
    wc(ws, ec(r,3), "Collected ÷ Net Revenue", { ...STYLES.totalLabel, font:{ sz:9, italic:true, color:{ rgb:P.white } } });
    r++; r++;

    // ── ACTIVITY METRICS ─────────────────────────────────────────────────
    wc(ws, ec(r,0), "II.  TRANSACTION ACTIVITY", STYLES.sectionHeader());
    merges.push({ s:{r,c:0}, e:{r,c:3} }); r++;

    ["METRIC", "COUNT", "", ""].forEach((h, ci) => {
      wc(ws, ec(r,ci), h, STYLES.colHead());
    });
    r++;

    [
      ["Total Transactions",    parseInt(summary.TotalTransactions || 0), P.white],
      ["Unique Clients Served", parseInt(summary.UniqueClients     || 0), P.stripe],
    ].forEach(([label, val, bg]) => {
      wc(ws, ec(r,0), label, STYLES.rowLabel(bg));
      ws[ec(r,1)] = { v:val, t:"n", s:STYLES.num(bg, true, P.grey1), z:N_FMT };
      wc(ws, ec(r,2), "", STYLES.rowLabel(bg));
      wc(ws, ec(r,3), "", STYLES.rowLabel(bg));
      r++;
    });

    r++;
    wc(ws, ec(r,0), "* All monetary values are in Philippine Peso (₱). Figures may be subject to rounding.", STYLES.footnote);
    merges.push({ s:{r,c:0}, e:{r,c:3} });

    ws["!cols"]      = [{ wch:32 }, { wch:20 }, { wch:14 }, { wch:38 }];
    ws["!rows"]      = [{ hpt:28 }, { hpt:18 }, { hpt:15 }, { hpt:13 }];
    ws["!merges"]    = merges;
    ws["!pageSetup"] = { paperSize:9, orientation:"portrait", fitToPage:true, fitToWidth:1, fitToHeight:0 };
    ws["!ref"]       = `A1:${ec(r, 3)}`;
    XLSX.utils.book_append_sheet(wb, ws, "Executive Summary");
  })();

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 2 — MONTHLY REVENUE SCHEDULE
  // ─────────────────────────────────────────────────────────────────────────
  (() => {
    const ws = {};
    const merges = [];
    let r = 0;

    wc(ws, ec(r,0), "CDJ ACCOUNTING AND AUDITING OFFICE", STYLES.bigTitle);
    merges.push({ s:{r,c:0}, e:{r,c:6} }); r++;
    wc(ws, ec(r,0), `MONTHLY REVENUE SCHEDULE — ${year}`, STYLES.subTitle);
    merges.push({ s:{r,c:0}, e:{r,c:6} }); r++;
    wc(ws, ec(r,0), `Generated: ${new Date().toLocaleString("en-PH")}`, STYLES.meta);
    merges.push({ s:{r,c:0}, e:{r,c:6} }); r++;
    r++;

    wc(ws, ec(r,0), "MONTHLY REVENUE BREAKDOWN", STYLES.sectionHeader());
    merges.push({ s:{r,c:0}, e:{r,c:6} }); r++;

    const heads = ["MONTH","GROSS REVENUE","DISCOUNTS","NET REVENUE","COLLECTED","OUTSTANDING","TRANSACTIONS"];
    const hBg   = [P.darkGreen, P.darkGreen, P.red, P.maroon, P.blue, P.maroon, P.darkGreen];
    heads.forEach((h, ci) => wc(ws, ec(r,ci), h, STYLES.colHead(hBg[ci])));
    r++;

    monthly12.forEach((row, i) => {
      const bg   = i % 2 === 0 ? P.white : P.stripe;
      const disc = row.TotalGross - row.TotalNet;
      const dim  = row.TotalGross === 0;

      wc(ws, ec(r,0), row.month,           STYLES.rowLabel(bg, true));
      wc(ws, ec(r,1), row.TotalGross,       STYLES.num(bg, false, dim ? P.grey3 : P.grey1), C_FMT); ws[ec(r,1)].t = "n";
      wc(ws, ec(r,2), disc,                 STYLES.num(bg, false, dim ? P.grey3 : P.red),   C_FMT); ws[ec(r,2)].t = "n";
      wc(ws, ec(r,3), row.TotalNet,         STYLES.num(bg, true,  dim ? P.grey3 : P.maroon),C_FMT); ws[ec(r,3)].t = "n";
      wc(ws, ec(r,4), row.TotalCollected,   STYLES.num(bg, false, dim ? P.grey3 : P.blue),  C_FMT); ws[ec(r,4)].t = "n";
      wc(ws, ec(r,5), row.TotalOutstanding, STYLES.num(bg, false, dim ? P.grey3 : P.red),   C_FMT); ws[ec(r,5)].t = "n";
      ws[ec(r,6)] = { v:row.TotalTransactions, t:"n", s:STYLES.num(bg, false, dim ? P.grey3 : P.grey1), z:N_FMT };
      r++;
    });

    // Totals row
    const mg = monthly12.reduce((a,x) => a + x.TotalGross, 0);
    const mn = monthly12.reduce((a,x) => a + x.TotalNet, 0);
    const mc = monthly12.reduce((a,x) => a + x.TotalCollected, 0);
    const mo = monthly12.reduce((a,x) => a + x.TotalOutstanding, 0);
    const mt = monthly12.reduce((a,x) => a + x.TotalTransactions, 0);

    wc(ws, ec(r,0), "TOTAL",  STYLES.totalLabel);
    wc(ws, ec(r,1), mg,       STYLES.totalNum(), C_FMT); ws[ec(r,1)].t = "n";
    wc(ws, ec(r,2), mg - mn,  STYLES.totalNum(), C_FMT); ws[ec(r,2)].t = "n";
    wc(ws, ec(r,3), mn,       STYLES.totalNum(), C_FMT); ws[ec(r,3)].t = "n";
    wc(ws, ec(r,4), mc,       STYLES.totalNum(), C_FMT); ws[ec(r,4)].t = "n";
    wc(ws, ec(r,5), mo,       STYLES.totalNum(), C_FMT); ws[ec(r,5)].t = "n";
    ws[ec(r,6)] = { v:mt, t:"n", s:STYLES.totalNum(), z:N_FMT };
    r++; r++;

    wc(ws, ec(r,0), "* Months with ₱0 activity are included for completeness. Net Revenue = Gross less Discounts.", STYLES.footnote);
    merges.push({ s:{r,c:0}, e:{r,c:6} });

    ws["!cols"]      = [{ wch:14 },{ wch:20 },{ wch:16 },{ wch:20 },{ wch:18 },{ wch:18 },{ wch:14 }];
    ws["!merges"]    = merges;
    ws["!pageSetup"] = { paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1, fitToHeight:0 };
    ws["!ref"]       = `A1:${ec(r, 6)}`;
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Revenue");
  })();

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 3 — SERVICE REVENUE BREAKDOWN
  // ─────────────────────────────────────────────────────────────────────────
  (() => {
    const ws = {};
    const merges = [];
    let r = 0;

    wc(ws, ec(r,0), "CDJ ACCOUNTING AND AUDITING OFFICE", STYLES.bigTitle);
    merges.push({ s:{r,c:0}, e:{r,c:8} }); r++;
    wc(ws, ec(r,0), `SERVICE REVENUE BREAKDOWN — ${periodLabel}`, STYLES.subTitle);
    merges.push({ s:{r,c:0}, e:{r,c:8} }); r++;
    wc(ws, ec(r,0), `Generated: ${new Date().toLocaleString("en-PH")}`, STYLES.meta);
    merges.push({ s:{r,c:0}, e:{r,c:8} }); r++;
    r++;

    wc(ws, ec(r,0), "REVENUE BY SERVICE TYPE", STYLES.sectionHeader());
    merges.push({ s:{r,c:0}, e:{r,c:8} }); r++;

    const heads = ["NO.","SERVICE NAME","TIMES AVAILED","TOTAL QTY","GROSS REVENUE","DISCOUNTS","NET REVENUE","COLLECTED","OUTSTANDING"];
    const hBg   = [P.darkGreen, P.darkGreen, P.darkGreen, P.darkGreen, P.darkGreen, P.red, P.maroon, P.blue, P.maroon];
    heads.forEach((h, ci) => wc(ws, ec(r,ci), h, STYLES.colHead(hBg[ci])));
    r++;

    if (services.length === 0) {
      wc(ws, ec(r,0), "No data for selected period.", STYLES.rowLabel());
      merges.push({ s:{r,c:0}, e:{r,c:8} }); r++;
    } else {
      services.forEach((s2, i) => {
        const bg = i % 2 === 0 ? P.white : P.stripe;
        ws[ec(r,0)] = { v:i+1, t:"n", s:STYLES.num(bg), z:N_FMT };
        wc(ws, ec(r,1), s2.ServiceName || "—",              STYLES.rowLabel(bg, true));
        ws[ec(r,2)] = { v:parseInt(s2.TimesAvailed || 0),   t:"n", s:STYLES.num(bg), z:N_FMT };
        ws[ec(r,3)] = { v:parseInt(s2.TotalQty     || 0),   t:"n", s:STYLES.num(bg), z:N_FMT };
        ws[ec(r,4)] = { v:parseFloat(s2.TotalGross  || 0),  t:"n", s:STYLES.num(bg, false, P.grey1),  z:C_FMT };
        ws[ec(r,5)] = { v:parseFloat(s2.TotalDiscount || 0),t:"n", s:STYLES.num(bg, false, P.red),    z:C_FMT };
        ws[ec(r,6)] = { v:parseFloat(s2.TotalNet    || 0),  t:"n", s:STYLES.num(bg, true,  P.maroon), z:C_FMT };
        ws[ec(r,7)] = { v:parseFloat(s2.TotalCollected || 0),  t:"n", s:STYLES.num(bg, false, P.blue),  z:C_FMT };
        ws[ec(r,8)] = { v:parseFloat(s2.TotalOutstanding || 0),t:"n", s:STYLES.num(bg, false, P.red),   z:C_FMT };
        r++;
      });

      const tg = services.reduce((a,s2) => a + parseFloat(s2.TotalGross    || 0), 0);
      const td = services.reduce((a,s2) => a + parseFloat(s2.TotalDiscount || 0), 0);
      const tn = services.reduce((a,s2) => a + parseFloat(s2.TotalNet      || 0), 0);
      const tc = services.reduce((a,s2) => a + parseFloat(s2.TotalCollected|| 0), 0);
      const to = services.reduce((a,s2) => a + parseFloat(s2.TotalOutstanding||0),0);
      const ta = services.reduce((a,s2) => a + parseInt(s2.TimesAvailed    || 0), 0);
      const tq = services.reduce((a,s2) => a + parseInt(s2.TotalQty        || 0), 0);

      wc(ws, ec(r,0), "",      STYLES.totalLabel);
      wc(ws, ec(r,1), "TOTAL", STYLES.totalLabel);
      ws[ec(r,2)] = { v:ta, t:"n", s:STYLES.totalNum(), z:N_FMT };
      ws[ec(r,3)] = { v:tq, t:"n", s:STYLES.totalNum(), z:N_FMT };
      ws[ec(r,4)] = { v:tg, t:"n", s:STYLES.totalNum(), z:C_FMT };
      ws[ec(r,5)] = { v:td, t:"n", s:STYLES.totalNum(), z:C_FMT };
      ws[ec(r,6)] = { v:tn, t:"n", s:STYLES.totalNum(), z:C_FMT };
      ws[ec(r,7)] = { v:tc, t:"n", s:STYLES.totalNum(), z:C_FMT };
      ws[ec(r,8)] = { v:to, t:"n", s:STYLES.totalNum(), z:C_FMT };
      r++;
    }

    r++;
    wc(ws, ec(r,0), "* Net Revenue = Gross Revenue less Discounts. Collected + Outstanding = Net Revenue.", STYLES.footnote);
    merges.push({ s:{r,c:0}, e:{r,c:8} });

    ws["!cols"]      = [{ wch:5 },{ wch:36 },{ wch:14 },{ wch:10 },{ wch:20 },{ wch:16 },{ wch:20 },{ wch:18 },{ wch:18 }];
    ws["!merges"]    = merges;
    ws["!pageSetup"] = { paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1, fitToHeight:0 };
    ws["!ref"]       = `A1:${ec(r, 8)}`;
    XLSX.utils.book_append_sheet(wb, ws, "Service Breakdown");
  })();

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 4 — TOP CLIENTS
  // ─────────────────────────────────────────────────────────────────────────
  (() => {
    const ws = {};
    const merges = [];
    let r = 0;

    wc(ws, ec(r,0), "CDJ ACCOUNTING AND AUDITING OFFICE", STYLES.bigTitle);
    merges.push({ s:{r,c:0}, e:{r,c:7} }); r++;
    wc(ws, ec(r,0), `TOP CLIENTS BY REVENUE — ${periodLabel}`, STYLES.subTitle);
    merges.push({ s:{r,c:0}, e:{r,c:7} }); r++;
    wc(ws, ec(r,0), `Generated: ${new Date().toLocaleString("en-PH")}`, STYLES.meta);
    merges.push({ s:{r,c:0}, e:{r,c:7} }); r++;
    r++;

    wc(ws, ec(r,0), "CLIENT REVENUE RANKING", STYLES.sectionHeader());
    merges.push({ s:{r,c:0}, e:{r,c:7} }); r++;

    const heads = ["RANK","CLIENT NAME","CLIENT TYPE","TRANSACTIONS","GROSS REVENUE","NET REVENUE","COLLECTED","OUTSTANDING"];
    const hBg   = [P.darkGreen, P.darkGreen, P.darkGreen, P.darkGreen, P.darkGreen, P.maroon, P.blue, P.maroon];
    heads.forEach((h, ci) => wc(ws, ec(r,ci), h, STYLES.colHead(hBg[ci])));
    r++;

    if (topClients.length === 0) {
      wc(ws, ec(r,0), "No data for selected period.", STYLES.rowLabel());
      merges.push({ s:{r,c:0}, e:{r,c:7} }); r++;
    } else {
      topClients.forEach((c2, i) => {
        const bg = i % 2 === 0 ? P.white : P.stripe;
        ws[ec(r,0)] = { v:i+1, t:"n", s:STYLES.num(bg, true, P.maroon), z:N_FMT };
        wc(ws, ec(r,1), c2.ClientName || c2.ClientID || "—", STYLES.rowLabel(bg, true));
        wc(ws, ec(r,2), c2.ClientType || "—",                STYLES.rowLabel(bg));
        ws[ec(r,3)] = { v:parseInt(c2.TotalTransactions || 0), t:"n", s:STYLES.num(bg),                    z:N_FMT };
        ws[ec(r,4)] = { v:parseFloat(c2.TotalGross      || 0), t:"n", s:STYLES.num(bg),                    z:C_FMT };
        ws[ec(r,5)] = { v:parseFloat(c2.TotalNet        || 0), t:"n", s:STYLES.num(bg, true,  P.maroon),    z:C_FMT };
        ws[ec(r,6)] = { v:parseFloat(c2.TotalCollected  || 0), t:"n", s:STYLES.num(bg, false, P.blue),      z:C_FMT };
        ws[ec(r,7)] = { v:parseFloat(c2.TotalOutstanding|| 0), t:"n", s:STYLES.num(bg, false, P.red),       z:C_FMT };
        r++;
      });
    }

    r++;
    wc(ws, ec(r,0), "* Ranked by Net Revenue (descending). Limited to top 10 clients for the selected period.", STYLES.footnote);
    merges.push({ s:{r,c:0}, e:{r,c:7} });

    ws["!cols"]      = [{ wch:6 },{ wch:40 },{ wch:18 },{ wch:14 },{ wch:20 },{ wch:20 },{ wch:18 },{ wch:18 }];
    ws["!merges"]    = merges;
    ws["!pageSetup"] = { paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1, fitToHeight:0 };
    ws["!ref"]       = `A1:${ec(r, 7)}`;
    XLSX.utils.book_append_sheet(wb, ws, "Top Clients");
  })();

  const fname = `CDJ_Revenue_${year}${month ? `_${MONTHS[month-1].slice(0,3)}` : ""}.xlsx`;
  XLSX.writeFile(wb, fname, { bookType:"xlsx", type:"binary", cellStyles:true });
};

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Chart tooltip
const ChartTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1.5, p: 1.5, minWidth: 175,
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    }}>
      <Typography sx={{ fontSize:"0.72rem", fontWeight:700, color:"text.primary",
        borderBottom:`1px solid ${theme.palette.divider}`, pb:0.6, mb:0.6 }}>
        {label}
      </Typography>
      {payload.map(p => (
        <Stack key={p.name} direction="row" justifyContent="space-between" spacing={3} mb={0.2}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:p.color, flexShrink:0 }} />
            <Typography sx={{ fontSize:"0.7rem", color:"text.secondary" }}>{p.name}</Typography>
          </Stack>
          <Typography sx={{ fontSize:"0.7rem", fontWeight:700, color:p.color }}>
            {typeof p.value === "number" ? short(p.value) : p.value}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
};

// WooCommerce-style metric card
const MetricCard = ({ label, value, sub, icon, color, loading, selected, onClick }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box onClick={onClick}
      sx={{
        flex:1, p:2.5, cursor: onClick ? "pointer" : "default",
        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fff",
        border: `1px solid ${selected ? color : theme.palette.divider}`,
        borderBottom: `3px solid ${selected ? color : "transparent"}`,
        borderRadius: 1.5,
        transition: "all 0.15s ease",
        "&:hover": onClick ? {
          borderColor: color,
          bgcolor: isDark ? `${color}10` : `${color}06`,
        } : {},
      }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontSize:"0.7rem", color:"text.secondary", fontWeight:600,
            letterSpacing:"0.04em", textTransform:"uppercase", mb:0.75 }}>
            {label}
          </Typography>
          {loading
            ? <Skeleton width={100} height={30} />
            : <Typography sx={{ fontSize:"1.6rem", fontWeight:700, lineHeight:1, color:"text.primary", mb:0.5 }}>
                {value}
              </Typography>
          }
          {sub && (
            <Typography sx={{ fontSize:"0.68rem", color:"text.secondary" }}>{sub}</Typography>
          )}
        </Box>
        <Box sx={{
          width:32, height:32, borderRadius:1,
          bgcolor: `${color}15`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color, "& svg":{ fontSize:"1rem" }, ml:1, flexShrink:0,
        }}>
          {icon}
        </Box>
      </Stack>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const RevenueReport = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [year,        setYear]        = useState(new Date().getFullYear());
  const [month,       setMonth]       = useState("");
  const [activeTab,   setActiveTab]   = useState(0);
  const [chartMetric, setChartMetric] = useState("TotalNet");

  const C = {
    maroon:  "#B03A2E",
    gold:    "#C9A84C",
    blue:    "#2E86C1",
    dark:    "#7B241C",
    teal:    "#17A589",
    purple:  "#7D3C98",
  };

  const METRIC_OPTS = [
    { key:"TotalGross",       label:"Gross Revenue", color:C.maroon },
    { key:"TotalNet",         label:"Net Revenue",   color:C.gold   },
    { key:"TotalCollected",   label:"Collected",     color:C.blue   },
    { key:"TotalOutstanding", label:"Outstanding",   color:C.dark   },
  ];

  const RANK_COLORS = [C.maroon, C.gold, C.blue, C.teal, C.purple, "#E67E22", "#27AE60", "#2980B9"];

  // Queries
  const yearsQ   = useQuery({ queryKey:["rev-years"],              queryFn: async () => (await http.get("/revenue-available-years"))?.data?.data ?? [] });
  const summaryQ = useQuery({ queryKey:["rev-summary",year,month], queryFn: async () => { const p = { year }; if (month) p.month = month; return (await http.get("/revenue-summary-totals", { params:p }))?.data?.data ?? {}; }});
  const monthlyQ = useQuery({ queryKey:["rev-monthly",year],       queryFn: async () => (await http.get("/revenue-monthly", { params:{ year } }))?.data?.data ?? [] });
  const serviceQ = useQuery({ queryKey:["rev-service",year,month], queryFn: async () => { const p = { year }; if (month) p.month = month; return (await http.get("/revenue-by-service", { params:p }))?.data?.data ?? []; }});
  const clientQ  = useQuery({ queryKey:["rev-client",year,month],  queryFn: async () => { const p = { year, limit:10 }; if (month) p.month = month; return (await http.get("/revenue-by-client", { params:p }))?.data?.data ?? []; }});

  const summary    = summaryQ.data  || {};
  const monthly12  = scaffold12(monthlyQ.data);
  const services   = serviceQ.data  || [];
  const topClients = clientQ.data   || [];
  const years      = yearsQ.data    || [];
  const isLoading  = summaryQ.isLoading;
  const period     = month ? `${MONTHS[month-1]} ${year}` : `Full Year ${year}`;

  // Pre-compute totals
  const sT = {
    gross:   services.reduce((a,s) => a + parseFloat(s.TotalGross      || 0), 0),
    disc:    services.reduce((a,s) => a + parseFloat(s.TotalDiscount   || 0), 0),
    net:     services.reduce((a,s) => a + parseFloat(s.TotalNet        || 0), 0),
    coll:    services.reduce((a,s) => a + parseFloat(s.TotalCollected  || 0), 0),
    out:     services.reduce((a,s) => a + parseFloat(s.TotalOutstanding|| 0), 0),
    availed: services.reduce((a,s) => a + parseInt(s.TimesAvailed      || 0), 0),
    qty:     services.reduce((a,s) => a + parseInt(s.TotalQty          || 0), 0),
  };
  const mT = {
    gross: monthly12.reduce((a,r) => a + r.TotalGross, 0),
    net:   monthly12.reduce((a,r) => a + r.TotalNet, 0),
    coll:  monthly12.reduce((a,r) => a + r.TotalCollected, 0),
    out:   monthly12.reduce((a,r) => a + r.TotalOutstanding, 0),
    txn:   monthly12.reduce((a,r) => a + r.TotalTransactions, 0),
  };

  const activeMetric = METRIC_OPTS.find(m => m.key === chartMetric);
  const gridColor    = isDark ? "#ffffff0d" : "#0000000a";
  const axisProps    = { fontSize:11, fill: isDark ? "#888" : "#999" };

  // Shared table sx
  const tableSx = {
    width:"100%", borderCollapse:"collapse",
    "& thead th": {
      px:2, py:1.3, fontSize:"0.68rem", fontWeight:700, textAlign:"left",
      letterSpacing:"0.05em", textTransform:"uppercase",
      color: isDark ? "rgba(255,255,255,0.45)" : "#555",
      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#F9F6F5",
      borderBottom:`2px solid ${isDark ? "rgba(176,58,46,0.25)" : "rgba(176,58,46,0.18)"}`,
      whiteSpace:"nowrap",
    },
    "& tbody td": {
      px:2, py:1.1, fontSize:"0.8rem",
      borderBottom:`1px solid ${isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)"}`,
    },
    "& tbody tr:last-child td": { borderBottom:"none" },
    "& tbody tr:hover td": {
      bgcolor: isDark ? "rgba(176,58,46,0.06)" : "rgba(176,58,46,0.03)",
    },
    "& tfoot td": {
      px:2, py:1.25, fontSize:"0.8rem", fontWeight:800,
      bgcolor: isDark ? "rgba(176,58,46,0.1)" : "rgba(176,58,46,0.05)",
      borderTop:`2px solid ${isDark ? "rgba(176,58,46,0.35)" : "rgba(176,58,46,0.2)"}`,
    },
  };

  const amtTd = (val, color, bold = false) => (
    <td style={{ textAlign:"right", fontWeight:bold ? 700 : 400, color: color || (isDark ? "#e0e0e0" : "#2c3e50") }}>
      {fmt(val)}
    </td>
  );

  return (
    <Box sx={{ p:{ xs:2, md:3 }, maxWidth:1440, mx:"auto",
      bgcolor: isDark ? "transparent" : "#F8F7F6" }}>

      {/* ════════════════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════════════════ */}
      <Stack direction={{ xs:"column", sm:"row" }}
        justifyContent="space-between" alignItems={{ sm:"center" }} gap={2} mb={3}>
        <Box>
          <Typography sx={{ fontWeight:700, fontSize:{ xs:"1.2rem", md:"1.35rem" }, color:"text.primary", lineHeight:1.1 }}>
            Revenue
          </Typography>
          <Typography sx={{ fontSize:"0.72rem", color:"text.secondary", mt:0.25 }}>
            CDJ Accounting & Auditing Office &nbsp;·&nbsp; {period}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Box sx={{
            display:"flex", alignItems:"center", gap:1,
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
            border:`1px solid ${theme.palette.divider}`,
            borderRadius:1.5, px:1.5, py:0.6,
          }}>
            <FormControl variant="standard" size="small" sx={{
              minWidth:70,
              "& .MuiInput-root":{ fontSize:"0.78rem" },
              "& .MuiInput-root::before":{ display:"none" },
              "& .MuiInput-root::after":{ display:"none" },
            }}>
              <Select value={year} onChange={e => setYear(e.target.value)} disableUnderline
                sx={{ fontSize:"0.78rem", fontWeight:600 }}>
                {years.length === 0 && (
                  <MenuItem value={new Date().getFullYear()} sx={{ fontSize:"0.78rem" }}>
                    {new Date().getFullYear()}
                  </MenuItem>
                )}
                {years.map(y => (
                  <MenuItem key={y} value={y} sx={{ fontSize:"0.78rem" }}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ width:1, height:18, bgcolor:"divider" }} />
            <FormControl variant="standard" size="small" sx={{
              minWidth:100,
              "& .MuiInput-root":{ fontSize:"0.78rem" },
              "& .MuiInput-root::before":{ display:"none" },
              "& .MuiInput-root::after":{ display:"none" },
            }}>
              <Select value={month} onChange={e => setMonth(e.target.value)} disableUnderline
                sx={{ fontSize:"0.78rem", color: month ? "text.primary" : "text.secondary" }}>
                <MenuItem value="" sx={{ fontSize:"0.78rem" }}>All Months</MenuItem>
                {MONTHS.map((m, i) => (
                  <MenuItem key={i+1} value={i+1} sx={{ fontSize:"0.78rem" }}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button variant="outlined" size="small"
            disabled={summaryQ.isLoading || monthlyQ.isLoading || serviceQ.isLoading || clientQ.isLoading}
            onClick={() => exportToExcel({ year, month, summary, monthly12, services, topClients })}
            sx={{
              borderColor:C.maroon, color:C.maroon, fontWeight:700, textTransform:"none",
              borderRadius:1.5, px:2, fontSize:"0.75rem",
              "&:hover":{ borderColor:C.dark, color:C.dark, bgcolor:`${C.maroon}08` },
            }}>
            ↓ Export Excel
          </Button>
        </Stack>
      </Stack>

      {/* ════════════════════════════════════════════════════════════════════
          METRIC CARDS
      ════════════════════════════════════════════════════════════════════ */}
      <Box sx={{
        display:"grid",
        gridTemplateColumns:{ xs:"1fr 1fr", sm:"repeat(3,1fr)", lg:"repeat(6,1fr)" },
        gap:1.5, mb:3,
      }}>
        {[
          { label:"Gross Revenue",  value:fmt(summary.TotalGross),       sub:`Period: ${period}`,                                    icon:<TrendingUpIcon/>,           color:C.maroon, metric:"TotalGross"       },
          { label:"Net Revenue",    value:fmt(summary.TotalNet),         sub:`After discounts`,                                      icon:<TrendingUpIcon/>,           color:C.gold,   metric:"TotalNet"         },
          { label:"Collected",      value:fmt(summary.TotalCollected),   sub:`Rate: ${pct(summary.TotalCollected, summary.TotalNet)}`,icon:<PaidIcon/>,                 color:C.blue,   metric:"TotalCollected"   },
          { label:"Outstanding",    value:fmt(summary.TotalOutstanding), sub:`Discount: ${fmt(summary.TotalDiscount)}`,              icon:<AccountBalanceWalletIcon/>, color:C.dark,   metric:"TotalOutstanding" },
          { label:"Transactions",   value:summary.TotalTransactions ?? "—", sub:`Total invoices`,                                   icon:<ReceiptLongIcon/>,          color:C.teal,   metric:null               },
          { label:"Unique Clients", value:summary.UniqueClients ?? "—",     sub:`Active this ${month ? MONTHS[month-1] : "year"}`,  icon:<GroupIcon/>,                color:C.purple, metric:null               },
        ].map(card => (
          <MetricCard key={card.label} {...card}
            loading={isLoading}
            selected={card.metric === chartMetric}
            onClick={card.metric ? () => { setChartMetric(card.metric); setActiveTab(0); } : undefined}
          />
        ))}
      </Box>

      {/* ════════════════════════════════════════════════════════════════════
          TABS
      ════════════════════════════════════════════════════════════════════ */}
      <Box sx={{
        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fff",
        border:`1px solid ${theme.palette.divider}`, borderRadius:2,
        overflow:"hidden",
      }}>
        {/* Tab bar */}
        <Box sx={{
          borderBottom:`1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#FDFAF9", px:2,
        }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight:42,
              "& .MuiTab-root":{ minHeight:42, fontSize:"0.75rem", fontWeight:600, textTransform:"none", px:2, py:0, color:"text.secondary" },
              "& .Mui-selected":{ color:`${C.maroon} !important` },
              "& .MuiTabs-indicator":{ backgroundColor:C.maroon, height:2 },
            }}>
            <Tab label="Chart" />
            <Tab label="Monthly" />
            <Tab label="By Service" />
            <Tab label="By Client" />
          </Tabs>
        </Box>

        {/* ── TAB 0: AREA CHART ── */}
        {activeTab === 0 && (
          <Box p={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontSize:"0.85rem", fontWeight:700, color:"text.primary" }}>
                {activeMetric?.label} — {year}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {METRIC_OPTS.map(m => (
                  <Box key={m.key}
                    onClick={() => setChartMetric(m.key)}
                    sx={{
                      px:1.5, py:0.4, borderRadius:1, fontSize:"0.7rem", fontWeight:600,
                      cursor:"pointer", border:"1px solid",
                      borderColor: chartMetric === m.key ? m.color : "divider",
                      color:       chartMetric === m.key ? m.color : "text.secondary",
                      bgcolor:     chartMetric === m.key ? `${m.color}12` : "transparent",
                      transition:"all 0.12s",
                    }}>
                    {m.label}
                  </Box>
                ))}
              </Stack>
            </Stack>

            {monthlyQ.isLoading
              ? <Skeleton variant="rectangular" height={260} sx={{ borderRadius:1 }} />
              : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthly12} margin={{ top:4, right:16, bottom:0, left:0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={activeMetric?.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={activeMetric?.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" tick={axisProps} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={short} tick={axisProps} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={chartMetric}
                      name={activeMetric?.label}
                      stroke={activeMetric?.color}
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={false}
                      activeDot={{ r:5, strokeWidth:0, fill:activeMetric?.color }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }

            <Box sx={{ mt:2, pt:1.5, borderTop:`1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width:14, height:14, borderRadius:0.5, bgcolor:activeMetric?.color, flexShrink:0 }} />
                <Typography sx={{ fontSize:"0.75rem", color:"text.secondary" }}>
                  {activeMetric?.label} — {period}
                </Typography>
                <Box sx={{ flex:1 }} />
                <Typography sx={{ fontSize:"0.8rem", fontWeight:700, color:"text.primary" }}>
                  {summaryQ.isLoading ? "—" : fmt(summary[chartMetric])}
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}

        {/* ── TAB 1: MONTHLY TABLE ── */}
        {activeTab === 1 && (
          <Box sx={{ overflow:"auto" }}>
            <Box component="table" sx={tableSx}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign:"right" }}>Gross Revenue</th>
                  <th style={{ textAlign:"right", color: isDark ? "#e57373" : "#c0392b" }}>Discounts</th>
                  <th style={{ textAlign:"right", color: isDark ? "#d4a017" : "#7a6020" }}>Net Revenue</th>
                  <th style={{ textAlign:"right", color: isDark ? "#5dade2" : "#1a5276" }}>Collected</th>
                  <th style={{ textAlign:"right", color: isDark ? "#e08070" : "#7b1d14" }}>Outstanding</th>
                  <th style={{ textAlign:"right" }}>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {monthlyQ.isLoading
                  ? [...Array(12)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j}><Skeleton variant="text" /></td>
                        ))}
                      </tr>
                    ))
                  : monthly12.map(row => {
                      const has  = row.TotalGross > 0;
                      const disc = row.TotalGross - row.TotalNet;
                      return (
                        <tr key={row.month} style={{ opacity: has ? 1 : 0.3 }}>
                          <td style={{ fontWeight:600 }}>{row.month}</td>
                          {amtTd(row.TotalGross, null)}
                          {amtTd(disc, isDark ? "#e57373" : "#c0392b")}
                          {amtTd(row.TotalNet, isDark ? "#d4a017" : "#7a6020", true)}
                          {amtTd(row.TotalCollected, isDark ? "#5dade2" : "#1a5276")}
                          {amtTd(row.TotalOutstanding, isDark ? "#e08070" : "#7b1d14")}
                          <td style={{ textAlign:"right" }}>{row.TotalTransactions}</td>
                        </tr>
                      );
                    })
                }
              </tbody>
              {!monthlyQ.isLoading && (
                <tfoot>
                  <tr>
                    <td>TOTAL</td>
                    {amtTd(mT.gross, null)}
                    {amtTd(mT.gross - mT.net, isDark ? "#e57373" : "#c0392b")}
                    {amtTd(mT.net,   isDark ? "#d4a017" : "#7a6020")}
                    {amtTd(mT.coll,  isDark ? "#5dade2" : "#1a5276")}
                    {amtTd(mT.out,   isDark ? "#e08070" : "#7b1d14")}
                    <td style={{ textAlign:"right" }}>{mT.txn}</td>
                  </tr>
                </tfoot>
              )}
            </Box>
          </Box>
        )}

        {/* ── TAB 2: BY SERVICE ── */}
        {activeTab === 2 && (
          <Box sx={{ overflow:"auto" }}>
            <Box component="table" sx={tableSx}>
              <thead>
                <tr>
                  <th style={{ width:32 }}>#</th>
                  <th>Service Name</th>
                  <th style={{ textAlign:"right" }}>Availed</th>
                  <th style={{ textAlign:"right" }}>Qty</th>
                  <th style={{ textAlign:"right" }}>Gross</th>
                  <th style={{ textAlign:"right", color: isDark ? "#e57373" : "#c0392b" }}>Discount</th>
                  <th style={{ textAlign:"right", color: isDark ? "#d4a017" : "#7a6020" }}>Net Revenue</th>
                  <th style={{ textAlign:"right", color: isDark ? "#5dade2" : "#1a5276" }}>Collected</th>
                  <th style={{ textAlign:"right", color: isDark ? "#e08070" : "#7b1d14" }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {serviceQ.isLoading
                  ? [...Array(6)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(9)].map((_, j) => (
                          <td key={j}><Skeleton variant="text" /></td>
                        ))}
                      </tr>
                    ))
                  : services.length === 0
                  ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign:"center", padding:"32px 0", color:theme.palette.text.secondary }}>
                          No data for selected period
                        </td>
                      </tr>
                    )
                  : services.map((s, i) => (
                      <tr key={s.ServiceID ?? i}>
                        <td style={{ color:theme.palette.text.disabled, fontSize:"0.7rem" }}>{i+1}</td>
                        <td style={{ fontWeight:600 }}>{s.ServiceName}</td>
                        <td style={{ textAlign:"right" }}>{s.TimesAvailed ?? 0}</td>
                        <td style={{ textAlign:"right" }}>{s.TotalQty ?? 0}</td>
                        {amtTd(s.TotalGross,       null)}
                        {amtTd(s.TotalDiscount,    isDark ? "#e57373" : "#c0392b")}
                        {amtTd(s.TotalNet,         isDark ? "#d4a017" : "#7a6020", true)}
                        {amtTd(s.TotalCollected,   isDark ? "#5dade2" : "#1a5276")}
                        {amtTd(s.TotalOutstanding, isDark ? "#e08070" : "#7b1d14")}
                      </tr>
                    ))
                }
              </tbody>
              {services.length > 0 && !serviceQ.isLoading && (
                <tfoot>
                  <tr>
                    <td colSpan={2}>TOTAL</td>
                    <td style={{ textAlign:"right" }}>{sT.availed}</td>
                    <td style={{ textAlign:"right" }}>{sT.qty}</td>
                    {amtTd(sT.gross, null)}
                    {amtTd(sT.disc,  isDark ? "#e57373" : "#c0392b")}
                    {amtTd(sT.net,   isDark ? "#d4a017" : "#7a6020")}
                    {amtTd(sT.coll,  isDark ? "#5dade2" : "#1a5276")}
                    {amtTd(sT.out,   isDark ? "#e08070" : "#7b1d14")}
                  </tr>
                </tfoot>
              )}
            </Box>
          </Box>
        )}

        {/* ── TAB 3: BY CLIENT ── */}
        {activeTab === 3 && (
          <Box sx={{ overflow:"auto" }}>
            <Box component="table" sx={tableSx}>
              <thead>
                <tr>
                  <th style={{ width:40 }}>Rank</th>
                  <th>Client Name</th>
                  <th>Type</th>
                  <th style={{ textAlign:"right" }}>Transactions</th>
                  <th style={{ textAlign:"right" }}>Gross</th>
                  <th style={{ textAlign:"right", color: isDark ? "#d4a017" : "#7a6020" }}>Net Revenue</th>
                  <th style={{ textAlign:"right", color: isDark ? "#5dade2" : "#1a5276" }}>Collected</th>
                  <th style={{ textAlign:"right", color: isDark ? "#e08070" : "#7b1d14" }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {clientQ.isLoading
                  ? [...Array(8)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(8)].map((_, j) => (
                          <td key={j}><Skeleton variant="text" /></td>
                        ))}
                      </tr>
                    ))
                  : topClients.length === 0
                  ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign:"center", padding:"32px 0", color:theme.palette.text.secondary }}>
                          No data for selected period
                        </td>
                      </tr>
                    )
                  : topClients.map((c2, i) => (
                      <tr key={c2.ClientID ?? i}>
                        <td>
                          <Box sx={{
                            width:24, height:24, borderRadius:"50%",
                            bgcolor:`${RANK_COLORS[i % RANK_COLORS.length]}22`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>
                            <Typography sx={{ fontSize:"0.6rem", fontWeight:800, color:RANK_COLORS[i % RANK_COLORS.length] }}>
                              {i+1}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ fontWeight:600 }}>{c2.ClientName || c2.ClientID}</td>
                        <td>
                          {c2.ClientType
                            ? (
                                <Box component="span" sx={{
                                  fontSize:"0.68rem", fontWeight:600, px:0.8, py:0.25, borderRadius:0.75,
                                  bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                                  color:"text.secondary",
                                }}>
                                  {c2.ClientType}
                                </Box>
                              )
                            : (
                                <Typography component="span" sx={{ fontSize:"0.75rem", color:"text.disabled" }}>—</Typography>
                              )
                          }
                        </td>
                        <td style={{ textAlign:"right" }}>{c2.TotalTransactions ?? 0}</td>
                        {amtTd(c2.TotalGross,       null)}
                        {amtTd(c2.TotalNet,         isDark ? "#d4a017" : "#7a6020", true)}
                        {amtTd(c2.TotalCollected,   isDark ? "#5dade2" : "#1a5276")}
                        {amtTd(c2.TotalOutstanding, isDark ? "#e08070" : "#7b1d14")}
                      </tr>
                    ))
                }
              </tbody>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RevenueReport;