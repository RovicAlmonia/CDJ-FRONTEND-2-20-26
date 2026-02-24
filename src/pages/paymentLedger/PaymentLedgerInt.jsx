import React, { useState, useMemo } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, IconButton, Chip,
  useTheme, alpha, Grid,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { hookContainer } from "../../hooks/globalQuery";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtPHP = (v) =>
  "₱ " + parseFloat(v || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const fmtDate = (v) => v ? dayjs(v).format("MMM D, YYYY") : "—";

const statusColor = (s) =>
  s === "Paid" ? "success" : s === "Partial" ? "warning" : "error";

const methodColor = (m) =>
  m === "Check" ? "info" : m === "Cash" ? "success" : "default";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "primary", sub }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderTop: "3px solid",
        borderTopColor: `${color}.main`,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette[color]?.main || "#1976d2", 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 22, color: `${color}.main` } })}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.66rem", display: "block" }}
        >
          {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.3, fontSize: "1rem" }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ─── Summary Item ─────────────────────────────────────────────────────────────
function SummaryItem({ label, value, color = "text.primary", large = false }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {label}
      </Typography>
      <Typography
        fontWeight="bold"
        sx={{
          fontFamily: "monospace",
          color,
          fontSize: large ? "1rem" : "0.85rem",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PaymentLedgerInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchQuery, setSearchQuery]   = useState("");
  const [page, setPage]                 = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);

  const month = selectedDate ? selectedDate.month() + 1 : null;
  const year  = selectedDate ? selectedDate.year()      : null;
  const queryParam = month && year ? `?month=${month}&year=${year}` : "";

  const { data: ledgerRaw }  = hookContainer(`/selectpaymentledger${queryParam}`);
  const { data: summaryRaw } = hookContainer(`/selectpaymentledgersummary${queryParam}`);

  const allRows = Array.isArray(ledgerRaw?.data) ? ledgerRaw.data : [];
  const summary = summaryRaw?.data || {};

  const filtered = useMemo(() => {
    if (!searchQuery) return allRows;
    const q = searchQuery.toLowerCase();
    return allRows.filter((r) =>
      (r.ClientName || "").toLowerCase().includes(q) ||
      (r.PaymentMethod || "").toLowerCase().includes(q) ||
      (r.PaymentReference || "").toLowerCase().includes(q) ||
      (r.PaymentStatus || "").toLowerCase().includes(q) ||
      (r.ClientID || "").toLowerCase().includes(q)
    );
  }, [allRows, searchQuery]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const pageTotal = paginated.reduce((s, r) => s + parseFloat(r.PaymentAmount || 0), 0);
  const balance   = (parseFloat(summary.TotalNet || 0)) - (parseFloat(summary.TotalPaid || 0));

  // ── shared table styles ──
  const cellSx = {
    fontSize: "0.81rem",
    whiteSpace: "nowrap",
    px: 1.5,
    py: 0.9,
    borderBottom: "1px solid",
    borderColor: "divider",
  };
  const headerSx = {
    fontWeight: 700,
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    px: 1.5,
    py: 1.1,
    color: "text.secondary",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderBottom: "2px solid",
    borderColor: "divider",
    backgroundColor: darkMode ? alpha("#fff", 0.04) : alpha("#1a3a5c", 0.05),
  };

  const headers = [
    { label: "#",              align: "center" },
    { label: "Date",           align: "left"   },
    { label: "Client",         align: "left"   },
    { label: "Particulars",    align: "left"   },
    { label: "Mode",           align: "center" },
    { label: "Net Amount",     align: "right"  },
    { label: "Payment Amount", align: "right"  },
    { label: "Balance",        align: "right"  },
    { label: "Status",         align: "center" },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* ── Top toolbar ── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid", borderColor: "divider", borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Title bar */}
          <Box
            sx={{
              px: 2, py: 1.5,
              borderBottom: "1px solid", borderColor: "divider",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 1,
              backgroundColor: darkMode
                ? alpha("#fff", 0.03)
                : alpha("#1a3a5c", 0.04),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceWalletIcon fontSize="small" sx={{ color: "primary.main" }} />
              <Typography variant="subtitle2" fontWeight="bold">Payment Ledger</Typography>
              <Chip
                label={`${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
                size="small" color="primary" variant="outlined"
                sx={{ fontSize: "0.68rem", height: 20 }}
              />
              {selectedDate && (
                <Chip
                  label={selectedDate.format("MMMM YYYY")}
                  size="small" variant="outlined"
                  sx={{ fontSize: "0.68rem", height: 20 }}
                />
              )}
            </Box>
          </Box>

          {/* Filters row */}
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary"
                sx={{ display: "block", mb: 0.4, fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Select Month / Year
              </Typography>
              <DatePicker
                views={["year", "month"]}
                value={selectedDate}
                onChange={(v) => { setSelectedDate(v); setPage(0); }}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { width: 185 },
                    inputProps: { readOnly: true },
                  },
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary"
                sx={{ display: "block", mb: 0.4, fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Search
              </Typography>
              <TextField
                placeholder="Client, method, reference..."
                size="small"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchQuery(""); setPage(0); }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* ── Stat cards ── */}
        <Grid container spacing={1.5}>
          {[
            {
              label: "Total Collected",
              value: fmtPHP(summary.TotalPaid),
              icon: <PaidIcon />,
              color: "success",
              sub: `${summary.CountPaid || 0} fully paid`,
            },
            {
              label: "Net Total",
              value: fmtPHP(summary.TotalNet),
              icon: <TrendingUpIcon />,
              color: "primary",
              sub: `${summary.TotalRecords || 0} total records`,
            },
            {
              label: "Unpaid",
              value: `${summary.CountUnpaid || 0} record${summary.CountUnpaid !== 1 ? "s" : ""}`,
              icon: <PendingActionsIcon />,
              color: "error",
              sub: `Balance: ${fmtPHP(balance)}`,
            },
            {
              label: "Partial",
              value: `${summary.CountPartial || 0} record${summary.CountPartial !== 1 ? "s" : ""}`,
              icon: <AccountBalanceWalletIcon />,
              color: "warning",
              sub: "partially paid",
            },
          ].map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* ── Main Table ── */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
        >
          <TableContainer sx={{ overflowX: "auto", maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {headers.map((h) => (
                    <TableCell
                      key={h.label}
                      sx={{ ...headerSx, textAlign: h.align }}
                    >
                      {h.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <ReceiptLongIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                        <Typography variant="body2" color="text.disabled" fontSize="0.8rem" fontStyle="italic">
                          {searchQuery
                            ? `No records matching "${searchQuery}"`
                            : selectedDate
                            ? `No payment records for ${selectedDate.format("MMMM YYYY")}`
                            : "No payment records found."}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((row, index) => {
                    const isCheck = row.PaymentMethod === "Check";
                    return (
                      <TableRow
                        key={row.ID}
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                          "&:hover": { backgroundColor: "action.selected" },
                        }}
                      >
                        {/* # */}
                        <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.7rem", textAlign: "center", width: 40 }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>

                        {/* Date */}
                        <TableCell sx={cellSx}>
                          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                            {fmtDate(row.PaymentDate)}
                          </Typography>
                        </TableCell>

                        {/* Client */}
                        <TableCell sx={{ ...cellSx, fontWeight: 600, maxWidth: 170 }}>
                          <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.ClientName || row.ClientID || "—"}
                          </Box>
                        </TableCell>

                        {/* Particulars */}
                        <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                          <Typography variant="caption" color="text.secondary">
                            {row.PaymentReference
                              ? `Payment for SOA #${row.PaymentReference}`
                              : "—"}
                          </Typography>
                        </TableCell>

                        {/* Mode */}
                        <TableCell sx={{ ...cellSx, textAlign: "center" }}>
                          {row.PaymentMethod ? (
                            <Chip
                              label={row.PaymentMethod}
                              size="small"
                              color={methodColor(row.PaymentMethod)}
                              variant="outlined"
                              sx={{ fontSize: "0.68rem" }}
                            />
                          ) : "—"}
                        </TableCell>

                        {/* Net Amount */}
                        <TableCell sx={cellSx} align="right">
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "primary.main" }}>
                            {fmtPHP(row.Net)}
                          </Typography>
                        </TableCell>

                        {/* Payment Amount */}
                        <TableCell sx={cellSx} align="right">
                          <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                            {fmtPHP(row.PaymentAmount)}
                          </Typography>
                        </TableCell>

                        {/* Balance */}
                        <TableCell sx={cellSx} align="right">
                          <Typography variant="caption" fontWeight="bold" sx={{
                            fontFamily: "monospace",
                            color: (parseFloat(row.Net || 0) - parseFloat(row.PaymentAmount || 0)) > 0
                              ? "warning.main"
                              : "success.main",
                          }}>
                            {fmtPHP(parseFloat(row.Net || 0) - parseFloat(row.PaymentAmount || 0))}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={{ ...cellSx, textAlign: "center" }}>
                          <Chip
                            label={row.PaymentStatus || "—"}
                            size="small"
                            color={statusColor(row.PaymentStatus)}
                            sx={{ fontSize: "0.68rem" }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}

                {/* Page totals row */}
                {paginated.length > 0 && (
                  <TableRow
                    sx={{
                      backgroundColor: darkMode
                        ? alpha("#fff", 0.05)
                        : alpha("#1a3a5c", 0.04),
                    }}
                  >
                    <TableCell
                      colSpan={5}
                      sx={{ ...cellSx, fontWeight: "bold", fontSize: "0.72rem", borderTop: "2px solid", borderColor: "divider", color: "text.secondary" }}
                    >
                      PAGE TOTALS
                    </TableCell>
                    <TableCell sx={{ ...cellSx, borderTop: "2px solid", borderColor: "divider" }} align="right">
                      <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "primary.main" }}>
                        {fmtPHP(paginated.reduce((s, r) => s + parseFloat(r.Net || 0), 0))}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, borderTop: "2px solid", borderColor: "divider" }} align="right">
                      <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                        {fmtPHP(pageTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={3} sx={{ ...cellSx, borderTop: "2px solid", borderColor: "divider" }} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Paper>

        {/* ── Grand Summary strip ── */}
        {allRows.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid", borderColor: "divider", borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2, py: 1,
                borderBottom: "1px solid", borderColor: "divider",
                backgroundColor: darkMode ? alpha("#fff", 0.03) : alpha("#1a3a5c", 0.04),
                display: "flex", alignItems: "center", gap: 1,
              }}
            >
              <ReceiptLongIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.68rem" }}>
                {selectedDate ? `${selectedDate.format("MMMM YYYY")} — ` : ""}Grand Summary
              </Typography>
            </Box>
            <Box
              sx={{
                px: 2, py: 1.5,
                display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center",
              }}
            >
              <SummaryItem label="Gross Total"    value={fmtPHP(summary.TotalGross)}    color="text.primary" />
              <SummaryItem label="Total Discount" value={fmtPHP(summary.TotalDiscount)} color="error.main" />
              <SummaryItem label="Net Total"      value={fmtPHP(summary.TotalNet)}      color="primary.main" />
              <Box sx={{ width: "1px", height: 36, backgroundColor: "divider", mx: 1 }} />
              <SummaryItem label="Total Paid"     value={fmtPHP(summary.TotalPaid)}     color="success.main" large />
              <SummaryItem
                label="Balance"
                value={fmtPHP(balance)}
                color={balance > 0 ? "warning.main" : "success.main"}
                large
              />
            </Box>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}