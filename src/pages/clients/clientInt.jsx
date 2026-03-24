import React, { useState } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Typography, IconButton, Chip, Tooltip,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, InputAdornment, alpha, useTheme,
  Collapse,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "../../modules/context/AuthContext";

const emptyForm = {
  id: "", clientid: "", lnf: "", type: "", tradename: "",
  dateregistered: null, dateexpiration: null,
  dticertificationno: "", dtiexpirationdate: null,
  secidno: "", secexpirationdate: null,
  cdacertno: "", efpsaccount: "",
  taxclearancecertno: "", taxclearanceexpiration: null,
  philgeps: "", philgepscertno: "", philgepsexpiration: null,
  retentiontype: "", status: "Active",
};

const DATE_FIELD_OPTIONS = [
  { value: "DateRegistered",         label: "Date Registered" },
  { value: "DateExpiration",         label: "Date Expiration" },
  { value: "DTIExpirationDate",      label: "DTI Expiration" },
  { value: "SECExpirationDate",      label: "SEC Expiration" },
  { value: "TaxClearanceExpiration", label: "Tax Clearance Expiration" },
  { value: "PhilGEPSExpiration",     label: "PhilGEPS Expiration" },
];

const fmtDisplay = (val) => (val ? dayjs(val).format("MMM D, YYYY") : "—");
const fmtMoney = (val) =>
  "₱" + Number(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const statusColor = (s) => {
  if (s === "Paid")   return "success";
  if (s === "Posted") return "warning";
  if (s === "Active") return "primary";
  return "default";
};

const methodColor = (m) => {
  if (m === "GCash" || m === "Maya") return "info";
  if (m === "Check")                  return "warning";
  if (m === "Bank Transfer")          return "success";
  if (m === "Cash")                   return "default";
  return "default";
};

// ─── Add Payment Dialog ───────────────────────────────────────────────────────
function AddPaymentDialog({ open, onClose, onSave, billingId, netTotal, alreadyPaid, clientId, clientName, accessToken }) {
  const [method, setMethod] = useState("GCash");
  const [form, setForm] = useState({
    refNo: "", amount: "", date: null,
    checkDate: null, checkNo: "", checkAmount: "",
    bankDate: null, bankRef: "", bankAmount: "", bankName: "",
  });

  React.useEffect(() => {
    if (open) {
      setForm({ refNo: "", amount: "", date: null, checkDate: null, checkNo: "", checkAmount: "", bankDate: null, bankRef: "", bankAmount: "", bankName: "" });
      setMethod("GCash");
    }
  }, [open]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const rawAmt = parseFloat(
    method === "Check"         ? form.checkAmount :
    method === "Bank Transfer" ? form.bankAmount  : form.amount
  ) || 0;

  const net       = parseFloat(netTotal    || 0);
  const paid      = parseFloat(alreadyPaid || 0);
  const remaining = Math.max(0, net - paid);
  const isAddMore = paid > 0 && net > 0;

  const willBePosted  = rawAmt > 0 && remaining > 0 && rawAmt < remaining;
  const paymentStatus = willBePosted ? "Posted" : "Paid";
  const txnStatus     = paymentStatus;

  const handleSave = async () => {
    const base = {
      billingid:     billingId,
      clientid:      clientId,
      // ✅ FIX: always send paymentmethod with the correct key matching backend expectation
      paymentmethod: method,
      paymentstatus: paymentStatus,
      preparedBy:    accessToken?.userName || accessToken?.username || accessToken?.name || accessToken?.EmployeeName || "system",
    };

    const payload =
      method === "GCash" || method === "Maya" || method === "Cash"
        ? { ...base, referenceNumber: form.refNo, amount: form.amount, date: form.date ? dayjs(form.date).format("YYYY-MM-DD") : null }
      : method === "Check"
        ? { ...base, bankName: form.bankName, checkDate: form.checkDate ? dayjs(form.checkDate).format("YYYY-MM-DD") : null, checkNumber: form.checkNo, checkAmount: form.checkAmount }
      : { ...base, bankName: form.bankName, date: form.bankDate ? dayjs(form.bankDate).format("YYYY-MM-DD") : null, referenceNumber: form.bankRef, amount: form.bankAmount };

    try {
      await http.post("/postpayment", payload);
      if (billingId) {
        await http.post("/updatetransactionstatus", { id: billingId, status: txnStatus }).catch(() => {});
      }
      toast.success(`Payment saved as ${paymentStatus}!`);
      onSave();
      onClose();
    } catch {
      toast.error("Failed to record payment.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <PaymentIcon fontSize="small" sx={{ color: "primary.main" }} />
          <Typography variant="subtitle1" fontWeight="bold">Add Payment</Typography>
          {billingId  && <Chip label={`Transaction #${billingId}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
          {clientName && <Chip label={clientName} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        {net > 0 && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, backgroundColor: "action.hover" }}>
            {isAddMore && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Net Total</Typography>
                <Typography variant="caption" fontWeight={600}>{fmtMoney(net)}</Typography>
              </Box>
            )}
            {isAddMore && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Already Paid</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: "success.main" }}>− {fmtMoney(paid)}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: isAddMore ? "1px solid" : "none", borderColor: "divider", pt: isAddMore ? 0.5 : 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={isAddMore ? 700 : 400}>
                {isAddMore ? "Remaining Balance" : "Net Total to Pay"}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold" color={isAddMore ? "warning.main" : "success.main"}>
                {fmtMoney(remaining)}
              </Typography>
            </Box>
          </Box>
        )}
        {willBePosted && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, backgroundColor: alpha("#ed6c02", 0.10), border: "1px solid", borderColor: "warning.main" }}>
            <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 600 }}>
              ⚠ {fmtMoney(rawAmt)} entered is less than the remaining balance {fmtMoney(remaining)} — status will be <strong>Posted</strong>
            </Typography>
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Payment Method" select fullWidth size="small" value={method} onChange={e => setMethod(e.target.value)}>
              <MenuItem value="GCash">GCash</MenuItem>
              <MenuItem value="Maya">Maya</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            </TextField>
          </Grid>

          {method === "Cash" && <>
            <Grid item xs={12} sm={6}>
              <TextField label="Amount" fullWidth size="small" type="number" value={form.amount} onChange={e => f("amount", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker label="Date" value={form.date} onChange={v => f("date", v)} slotProps={{ textField: { fullWidth: true, size: "small" } }} />
            </Grid>
          </>}

          {(method === "GCash" || method === "Maya") && <>
            <Grid item xs={12} sm={6}>
              <TextField label="Reference Number" fullWidth size="small" value={form.refNo} onChange={e => f("refNo", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Amount" fullWidth size="small" type="number" value={form.amount} onChange={e => f("amount", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <DatePicker label="Date" value={form.date} onChange={v => f("date", v)} slotProps={{ textField: { fullWidth: true, size: "small" } }} />
            </Grid>
          </>}

          {method === "Check" && <>
            <Grid item xs={12} sm={6}>
              <TextField label="Bank Name" fullWidth size="small" value={form.bankName} onChange={e => f("bankName", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Check Number" fullWidth size="small" value={form.checkNo} onChange={e => f("checkNo", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker label="Check Date" value={form.checkDate} onChange={v => f("checkDate", v)} slotProps={{ textField: { fullWidth: true, size: "small" } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Check Amount" fullWidth size="small" type="number" value={form.checkAmount} onChange={e => f("checkAmount", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} />
            </Grid>
          </>}

          {method === "Bank Transfer" && <>
            <Grid item xs={12} sm={6}>
              <TextField label="Bank Name" fullWidth size="small" value={form.bankName} onChange={e => f("bankName", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Reference Number" fullWidth size="small" value={form.bankRef} onChange={e => f("bankRef", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker label="Date" value={form.bankDate} onChange={v => f("bankDate", v)} slotProps={{ textField: { fullWidth: true, size: "small" } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Amount" fullWidth size="small" type="number" value={form.bankAmount} onChange={e => f("bankAmount", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} />
            </Grid>
          </>}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color={willBePosted ? "warning" : "primary"} onClick={handleSave} startIcon={<SaveIcon />}>
          {willBePosted ? "Save as Posted" : "Save Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Expandable Service Detail Row ─────────────────────────────────────────────
function ServiceDateRow({ row, onAddPayment, theme, retentionType }) {
  const [expanded, setExpanded] = useState(false);
  const darkMode = theme.palette.mode === "dark";
  const details = Array.isArray(row.details) ? row.details : [];
  const cellSx = { fontSize: "0.80rem", px: 1.5, py: 0.8, borderBottom: "1px solid", borderColor: "divider" };

  return (
    <>
      <TableRow
        hover
        sx={{ cursor: "pointer", backgroundColor: expanded ? alpha(theme.palette.primary.main, darkMode ? 0.12 : 0.05) : "transparent" }}
        onClick={() => setExpanded(p => !p)}
      >
        <TableCell sx={{ ...cellSx, width: 40 }}>
          <IconButton size="small" sx={{ p: 0 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
          {row.TransactionDate ? dayjs(row.TransactionDate).format("YYYY") : (row.Date ? dayjs(row.Date).format("YYYY") : "—")}
        </TableCell>
        <TableCell sx={cellSx}>
          {row.TransactionDate ? dayjs(row.TransactionDate).format("MMM D, YYYY") : (row.Date ? dayjs(row.Date).format("MMM D, YYYY") : "—")}
        </TableCell>
        <TableCell sx={cellSx}>{row.BillingID || row.IDTransaction || "—"}</TableCell>
        <TableCell sx={{ ...cellSx, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.Particulars || "—"}
        </TableCell>
        <TableCell sx={{ ...cellSx, fontWeight: 600, color: "success.main" }}>
          {(row.Total ?? row.NetTotal) != null ? fmtMoney(row.Total ?? row.NetTotal) : "—"}
        </TableCell>
        <TableCell sx={cellSx}>
          <Chip label={row.Status || "—"} size="small" color={statusColor(row.Status)} sx={{ fontSize: "0.7rem" }} />
        </TableCell>
        <TableCell sx={cellSx}>{row.PreparedBy || "—"}</TableCell>
        <TableCell sx={cellSx} align="center" onClick={e => e.stopPropagation()}>
          <Button
            size="small"
            variant={row.Status === "Paid" ? "contained" : "outlined"}
            color={row.Status === "Paid" ? "success" : row.Status === "Posted" ? "warning" : "primary"}
            startIcon={<PaymentIcon sx={{ fontSize: "0.9rem !important" }} />}
            sx={{ fontSize: "0.7rem", py: 0.3, px: 1 }}
            disabled={row.Status === "Paid"}
            onClick={() => onAddPayment(
              row.BillingID ?? row.IDTransaction,
              row.Total ?? row.NetTotal,
              row.TotalPaid ?? 0
            )}
          >
            {row.Status === "Paid" ? "Paid" : row.Status === "Posted" ? "Add More" : "Pay"}
          </Button>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ backgroundColor: alpha(theme.palette.info.main, darkMode ? 0.08 : 0.04), px: 4, py: 1.5 }}>
              <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1, display: "block" }}>
                Billing Detail — {(row.TransactionDate || row.Date) ? dayjs(row.TransactionDate || row.Date).format("MMMM D, YYYY") : "this date"}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Billing ID", "Particulars", "Gross Total", "Discount", "Service Fee", "Net Total", "Status"].map(h => (
                      <TableCell key={h} sx={{ fontSize: "0.72rem", fontWeight: "bold", color: "text.secondary", py: 0.5, px: 1, textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1 }}>{row.BillingID ?? row.IDTransaction ?? "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1 }}>{row.Particulars || "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1 }}>{fmtMoney(row.GrossTotal)}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1, color: "error.main" }}>{fmtMoney(row.Discount)}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1, color: "info.main" }}>{fmtMoney(row.ServiceFee)}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1, fontWeight: 600, color: "success.main" }}>
                      {fmtMoney(row.Total ?? row.NetTotal)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", py: 0.5, px: 1 }}>
                      <Chip label={row.Status || "—"} size="small" color={statusColor(row.Status)} sx={{ fontSize: "0.68rem" }} />
                    </TableCell>
                  </TableRow>
                  {details.length > 0 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ fontSize: "0.70rem", fontWeight: "bold", color: "text.disabled", pt: 1, pb: 0.3, px: 1, textTransform: "uppercase" }}>
                          Service Line Items
                        </TableCell>
                      </TableRow>
                      {details.map((d, di) => (
                        <TableRow key={di}>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1 }}>{d.ServiceID || "—"}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1 }}>{d.ServiceName || "—"}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1 }}>{fmtMoney(d.Gross)}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1, color: "error.main" }}>{fmtMoney(d.Discount)}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1, color: "text.disabled" }}>—</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1, fontWeight: 600, color: "success.main" }}>{fmtMoney(d.Amount ?? d.Net)}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", py: 0.3, px: 1 }}>Qty: {d.QTY || 1} · Rate: {fmtMoney(d.Rate)}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>

              {(() => {
                const net     = Number(row.Total ?? row.NetTotal ?? 0);
                const isPaid  = row.Status === "Paid";
                const paid    = isPaid ? net : Number(row.TotalPaid ?? 0);
                const balance = isPaid ? 0 : Math.max(0, net - paid);
                const renewalMonths = (() => {
                  const srm = details[0]?.ServiceRenewalMonths;
                  if (srm) return Number(srm);
                  const rt = row.RetentionType || retentionType || "";
                  if (rt === "Monthly")     return 1;
                  if (rt === "Quarterly")   return 3;
                  if (rt === "Semi Annual") return 6;
                  if (rt === "Annual")      return 12;
                  return 1;
                })();
                const txnDate     = row.TransactionDate || row.Date;
                const nextBilling = (renewalMonths && txnDate) ? dayjs(txnDate).add(renewalMonths, "month") : null;
                const daysUntil   = nextBilling ? nextBilling.diff(dayjs(), "day") : null;
                const isOverdue   = daysUntil !== null && daysUntil < 0;

                return (
                  <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3, mb: nextBilling ? 1 : 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Amount Paid:&nbsp;<strong style={{ color: "#2e7d32" }}>{fmtMoney(paid)}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Balance:&nbsp;<strong style={{ color: balance > 0 ? "#c62828" : "#2e7d32" }}>{fmtMoney(balance)}</strong>
                      </Typography>
                    </Box>
                    {nextBilling && (
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Next Billing:&nbsp;
                          <strong style={{ color: "inherit" }}>{nextBilling.format("MMMM D, YYYY")}</strong>
                          &nbsp;—&nbsp;
                          {isOverdue
                            ? <strong style={{ color: "inherit" }}>Overdue by {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? "s" : ""}</strong>
                            : daysUntil === 0
                            ? <strong style={{ color: "inherit" }}>Due today</strong>
                            : <strong style={{ color: "inherit" }}>In {daysUntil} day{daysUntil !== 1 ? "s" : ""}</strong>
                          }
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })()}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─── Transaction Ledger Dialog ─────────────────────────────────────────────────
function TransactionLedgerDialog({ open, onClose, clientId, clientName, theme }) {
  const safeId = clientId ?? "";
  const { data: ledgerRaw } = hookContainer(
    safeId ? `/selecttransactionledger?clientid=${safeId}` : `/selecttransactionledger?clientid=__none__`
  );
  const transactions = Array.isArray(ledgerRaw?.data) ? ledgerRaw.data : [];
  const darkMode = theme.palette.mode === "dark";

  const headerSx = {
    fontWeight: "bold", fontSize: "0.75rem", whiteSpace: "nowrap",
    px: 1.5, py: 1, backgroundColor: "action.hover", color: "text.secondary",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "2px solid", borderColor: "divider",
  };
  const cellSx = { fontSize: "0.80rem", px: 1.5, py: 0.9, borderBottom: "1px solid", borderColor: "divider" };
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.Total ?? t.NetTotal ?? 0), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 2, maxHeight: "85vh" } }}>
      <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: alpha(theme.palette.info.main, darkMode ? 0.15 : 0.07) }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongIcon fontSize="small" sx={{ color: "info.main" }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "info.main" }}>Transaction Ledger</Typography>
          {clientName && <Chip label={clientName} size="small" variant="outlined" color="info" sx={{ fontSize: "0.7rem" }} />}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 1.2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 3, backgroundColor: "action.hover" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total Transactions: <strong>{transactions.length}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total Amount: <strong style={{ color: theme.palette.success.main }}>{fmtMoney(totalAmount)}</strong>
          </Typography>
        </Box>
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["#", "Billing ID", "Date", "Client ID", "Particulars", "Gross", "Discount", "Service Fee", "Net Total", "Status"].map(h => (
                  <TableCell key={h} sx={headerSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>No transactions found.</TableCell></TableRow>
              ) : transactions.map((t, i) => (
                <TableRow key={i} hover sx={{ backgroundColor: i % 2 === 0 ? "transparent" : "action.hover" }}>
                  <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", width: 40 }}>{i + 1}</TableCell>
                  <TableCell sx={cellSx}>{t.BillingID ?? t.IDTransaction ?? "—"}</TableCell>
                  <TableCell sx={cellSx}>{t.Date ? dayjs(t.Date).format("MMM D, YYYY") : "—"}</TableCell>
                  <TableCell sx={cellSx}>{t.ClientID || "—"}</TableCell>
                  <TableCell sx={{ ...cellSx, maxWidth: 280 }}>{t.Particulars || "—"}</TableCell>
                  <TableCell sx={cellSx}>{fmtMoney(t.GrossTotal)}</TableCell>
                  <TableCell sx={{ ...cellSx, color: "error.main" }}>{fmtMoney(t.Discount)}</TableCell>
                  <TableCell sx={{ ...cellSx, color: "info.main" }}>{fmtMoney(t.ServiceFee)}</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 600, color: "success.main" }}>{fmtMoney(t.Total ?? t.NetTotal)}</TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={t.Status || "—"} size="small" color={statusColor(t.Status)} sx={{ fontSize: "0.7rem" }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Payment Ledger Dialog ─────────────────────────────────────────────────────
function PaymentLedgerDialog({ open, onClose, clientId, clientName, theme }) {
  const safeId = clientId ?? "";
  const { data: paymentsRaw } = hookContainer(
    safeId ? `/selectpaymentledgerbyclient?clientid=${safeId}` : `/selectpaymentledgerbyclient?clientid=__none__`
  );
  const payments = Array.isArray(paymentsRaw?.data) ? paymentsRaw.data : [];
  const darkMode = theme.palette.mode === "dark";

  const headerSx = {
    fontWeight: "bold", fontSize: "0.75rem", whiteSpace: "nowrap",
    px: 1.5, py: 1, backgroundColor: "action.hover", color: "text.secondary",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "2px solid", borderColor: "divider",
  };
  const cellSx = { fontSize: "0.80rem", px: 1.5, py: 0.9, borderBottom: "1px solid", borderColor: "divider" };
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.Amount || p.PaymentAmount || p.amount || 0), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 2, maxHeight: "85vh" } }}>
      <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: alpha(theme.palette.success.main, darkMode ? 0.15 : 0.07) }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceWalletIcon fontSize="small" sx={{ color: "success.main" }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "success.main" }}>Payment Ledger</Typography>
          {clientName && <Chip label={clientName} size="small" variant="outlined" color="success" sx={{ fontSize: "0.7rem" }} />}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 1.2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 3, backgroundColor: "action.hover" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total Payments: <strong>{payments.length}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total Paid: <strong style={{ color: theme.palette.success.main }}>{fmtMoney(totalPaid)}</strong>
          </Typography>
        </Box>
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["#", "Client ID", "Method", "Payment Date", "Reference No.", "Gross", "Discount", "Service Fee", "Net", "Amount Paid", "Status", "Receipt"].map(h => (
                  <TableCell key={h} sx={headerSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={12} align="center" sx={{ py: 4, color: "text.secondary" }}>No payments recorded yet.</TableCell></TableRow>
              ) : payments.map((p, i) => {
                // ✅ FIX: exhaustive casing fallbacks for PaymentMethod column
                const rawMethod =
                  p.PaymentMethod ??
                  p.paymentmethod ??
                  p.Paymentmethod ??
                  p.payment_method ??
                  p.Method ??
                  p.method ??
                  "";
                const method = rawMethod.trim() !== "" ? rawMethod : "—";

                // ✅ FIX: exhaustive casing fallbacks for BillingID / TransactionHDRID
               const billingId =
  p.TransactionHDRID ??
  p.transactionhdrid ??
  p.TransactionHdrID ??
  p.TRANSACTIONHDRID ??
  p.BillingID ??
  p.billingid ??
  null;

                return (
                  <TableRow key={i} hover sx={{ backgroundColor: i % 2 === 0 ? "transparent" : "action.hover" }}>
                    <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", width: 40 }}>{i + 1}</TableCell>
                    <TableCell sx={cellSx}>{p.ClientID || p.clientid || "—"}</TableCell>
                    <TableCell sx={cellSx}>
                      {method !== "—"
                        ? <Chip label={method} size="small" color={methodColor(method)} sx={{ fontSize: "0.7rem" }} />
                        : <Typography variant="caption" color="text.disabled">—</Typography>
                      }
                    </TableCell>
                    <TableCell sx={cellSx}>{p.Date || p.PaymentDate || p.date || p.paymentdate ? dayjs(p.Date || p.PaymentDate || p.date || p.paymentdate).format("MMM D, YYYY") : "—"}</TableCell>
                    <TableCell sx={cellSx}>{p.ReferenceNumber || p.PaymentReference || p.referenceNumber || p.referenceNumber || "—"}</TableCell>
                    <TableCell sx={cellSx}>{fmtMoney(p.Gross ?? p.gross)}</TableCell>
                    <TableCell sx={{ ...cellSx, color: "error.main" }}>{fmtMoney(p.Discount ?? p.discount)}</TableCell>
                    <TableCell sx={{ ...cellSx, color: "info.main" }}>{fmtMoney(p.ServiceFee ?? p.servicefee ?? p.service_fee)}</TableCell>
                    <TableCell sx={cellSx}>{fmtMoney(p.Net ?? p.net)}</TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 600, color: "success.main" }}>
                      {fmtMoney(p.Amount ?? p.PaymentAmount ?? p.amount ?? p.paymentamount)}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={p.Status || p.PaymentStatus || p.status || p.paymentstatus || "—"}
                        size="small"
                        color={statusColor(p.Status || p.PaymentStatus || p.status || p.paymentstatus)}
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx} align="center">
                      <Tooltip title={billingId ? `Print Receipt #${billingId}` : "No transaction linked"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={!billingId}
                            onClick={() => {
                              const base = import.meta.env.VITE_API_URL;
                              window.open(`${base}/api/reports/receipt/${billingId}`, "_blank");
                            }}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Client Info Popup ─────────────────────────────────────────────────────────
function ClientInfoDialog({ open, onClose, client, accessToken, theme }) {
  const clientId = client?.ClientID ?? "";
  const { data: servicesRaw } = hookContainer(
    clientId ? `/selectclientservices?clientid=${clientId}` : `/selectclientservices?clientid=__none__`
  );
  const serviceRows = Array.isArray(servicesRaw?.data) ? servicesRaw.data : [];
  const darkMode = theme.palette.mode === "dark";

  const [paymentDialog, setPaymentDialog] = useState({ open: false, billingId: null, netTotal: 0, alreadyPaid: 0 });
  const [txLedger, setTxLedger] = useState(false);
  const [pyLedger, setPyLedger] = useState(false);
  const queryClient = useQueryClient();

  const currentYear  = React.useMemo(() => dayjs().year().toString(), []);
  const currentMonth = React.useMemo(() => dayjs().month() + 1, []);
  const [selYear,  setSelYear]  = useState(currentYear);
  const [selMonth, setSelMonth] = useState(currentMonth);

  React.useEffect(() => {
    if (open) { setSelYear(currentYear); setSelMonth(currentMonth); }
  }, [open, clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const headerSx = {
    fontWeight: "bold", fontSize: "0.75rem", whiteSpace: "nowrap",
    px: 1.5, py: 1, backgroundColor: "action.hover", color: "text.secondary",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "2px solid", borderColor: "divider", position: "sticky", top: 0, zIndex: 1,
  };

  if (!client) return null;

  const availableYears = [...new Set(
    serviceRows.map(r => r.Year?.toString() || (r.TransactionDate ? dayjs(r.TransactionDate).format("YYYY") : null)).filter(Boolean)
  )].sort((a, b) => b - a);

  const yearFiltered = serviceRows.filter(r => {
    const rowYear = r.Year?.toString() || (r.TransactionDate ? dayjs(r.TransactionDate).format("YYYY") : null);
    return rowYear === selYear;
  });

  const availableMonths = [...new Set(
    yearFiltered.map(r => {
      const d = r.TransactionDate || r.Date;
      return d ? dayjs(d).month() + 1 : null;
    }).filter(Boolean)
  )].sort((a, b) => a - b);

  const displayRows = selMonth === null
    ? yearFiltered
    : yearFiltered.filter(r => {
        const d = r.TransactionDate || r.Date;
        return d ? dayjs(d).month() + 1 === selMonth : false;
      });

  const infoItems = [
    { label: "Client ID",           value: client.ClientID },
    { label: "Type",                value: client.Type },
    { label: "Date Registered",     value: fmtDisplay(client.DateRegistered) },
    { label: "Date Expiration",     value: fmtDisplay(client.DateExpiration) },
    { label: "DTI Cert No.",        value: client.DTICertificationNo },
    { label: "DTI Expiration",      value: fmtDisplay(client.DTIExpirationDate) },
    { label: "SEC ID No.",          value: client.SECIDNo },
    { label: "SEC Expiration",      value: fmtDisplay(client.SECExpirationDate) },
    { label: "CDA Cert No.",        value: client.CDACertNo },
    { label: "EFPS Account",        value: client.EFPSAccount },
    { label: "Tax Clearance No.",   value: client.TaxClearanceCertNo },
    { label: "Tax Clearance Exp.",  value: fmtDisplay(client.TaxClearanceExpiration) },
    { label: "PhilGEPS",            value: client.PhilGEPS },
    { label: "PhilGEPS Cert No.",   value: client.PhilGEPSCertNo },
    { label: "PhilGEPS Expiration", value: fmtDisplay(client.PhilGEPSExpiration) },
    { label: "Retention Type",      value: client.RetentionType },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper"
        PaperProps={{ sx: { borderRadius: 2, maxHeight: "92vh" } }}>

        <DialogTitle sx={{ p: 0, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{
            px: 3, py: 2,
            background: darkMode
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.25)}, ${alpha(theme.palette.secondary.main, 0.15)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.10)}, ${alpha(theme.palette.secondary.main, 0.06)})`,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.15), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BusinessIcon sx={{ color: "primary.main" }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>{client.TradeName || "—"}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{client.LNF || ""}</Typography>
                <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                  <Chip label={client.Status || "—"} size="small" color={client.Status === "Active" ? "success" : "error"} sx={{ fontSize: "0.7rem", height: 18 }} />
                  {client.Type && <Chip label={client.Type} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 18 }} />}
                  {client.RetentionType && <Chip label={client.RetentionType} size="small" variant="outlined" color="primary" sx={{ fontSize: "0.7rem", height: 18 }} />}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button variant="outlined" size="small" color="info" startIcon={<ReceiptLongIcon />} onClick={() => setTxLedger(true)} sx={{ fontSize: "0.75rem" }}>
                Transaction Ledger
              </Button>
              <Button variant="outlined" size="small" color="success" startIcon={<AccountBalanceWalletIcon />} onClick={() => setPyLedger(true)} sx={{ fontSize: "0.75rem" }}>
                Payment Ledger
              </Button>
              <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5, display: "block" }}>
              Client Information
            </Typography>
            <Grid container spacing={1.5}>
              {infoItems.map(item => item.value && item.value !== "—" ? (
                <Grid item xs={6} sm={4} md={3} key={item.label}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.disabled", display: "block", fontSize: "0.68rem" }}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.80rem", fontWeight: 500 }}>{item.value || "—"}</Typography>
                  </Box>
                </Grid>
              ) : null)}
            </Grid>
          </Box>

          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
              <CalendarMonthIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Services Availed
              </Typography>
              <Chip label={`${displayRows.length} record${displayRows.length !== 1 ? "s" : ""}`}
                size="small" color="primary" variant="outlined" sx={{ fontSize: "0.68rem", height: 18 }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: "text.disabled", mr: 0.5, minWidth: 36 }}>Year:</Typography>
              {availableYears.length === 0
                ? <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                : availableYears.map(y => (
                  <Chip key={y} label={y} size="small" clickable
                    color={selYear === y ? "primary" : "default"}
                    variant={selYear === y ? "filled" : "outlined"}
                    onClick={() => { setSelYear(y); setSelMonth(null); }}
                    sx={{ fontSize: "0.70rem", height: 22 }}
                  />
                ))
              }
            </Box>

            {selYear && availableMonths.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "text.disabled", mr: 0.5, minWidth: 36 }}>Month:</Typography>
                <Chip label="All" size="small" clickable
                  color={selMonth === null ? "secondary" : "default"}
                  variant={selMonth === null ? "filled" : "outlined"}
                  onClick={() => setSelMonth(null)}
                  sx={{ fontSize: "0.70rem", height: 22 }}
                />
                {availableMonths.map(m => (
                  <Chip key={m} label={dayjs().month(m - 1).format("MMM")} size="small" clickable
                    color={selMonth === m ? "secondary" : "default"}
                    variant={selMonth === m ? "filled" : "outlined"}
                    onClick={() => setSelMonth(m)}
                    sx={{ fontSize: "0.70rem", height: 22 }}
                  />
                ))}
              </Box>
            )}

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headerSx, width: 40 }} />
                    {["Year", "Date", "Billing ID", "Particulars", "Total", "Status", "Prepared By", "Action"].map(h => (
                      <TableCell key={h} sx={headerSx}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No service records found{selYear ? ` for ${selMonth ? dayjs().month(selMonth - 1).format("MMMM") + " " : ""}${selYear}` : ""}.
                      </TableCell>
                    </TableRow>
                  ) : displayRows.map((row, i) => (
                    <ServiceDateRow
                      key={`${row.BillingID}-${i}`}
                      row={row}
                      theme={theme}
                      retentionType={client?.RetentionType}
                      onAddPayment={(billingId, netTotal, alreadyPaid) => {
                        setPaymentDialog({ open: true, billingId, netTotal, alreadyPaid: alreadyPaid || 0 });
                      }}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <AddPaymentDialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog({ open: false, billingId: null, netTotal: 0, alreadyPaid: 0 })}
        billingId={paymentDialog.billingId}
        netTotal={paymentDialog.netTotal}
        alreadyPaid={paymentDialog.alreadyPaid}
        clientId={client?.ClientID}
        clientName={client?.TradeName}
        accessToken={accessToken}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: [`/selectclientservices?clientid=${client?.ClientID}`] });
          queryClient.invalidateQueries({ queryKey: [`/selectpaymentledgerbyclient?clientid=${client?.ClientID}`] });
          queryClient.invalidateQueries({ queryKey: [`/selecttransactionledger?clientid=${client?.ClientID}`] });
        }}
      />

      <TransactionLedgerDialog open={txLedger} onClose={() => setTxLedger(false)} clientId={client?.ClientID} clientName={client?.TradeName} theme={theme} />
      <PaymentLedgerDialog     open={pyLedger} onClose={() => setPyLedger(false)} clientId={client?.ClientID} clientName={client?.TradeName} theme={theme} />
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ClientInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const { data: clientsRaw } = hookContainer("/selectclientss");
  const { accessToken } = useContext(AuthContext);

  const clientList = Array.isArray(clientsRaw?.data)
    ? clientsRaw.data.map((row, index) => ({ ...row, id: row.ID || index }))
    : [];

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateField, setDateField] = useState("DateRegistered");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [clientInfo, setClientInfo] = useState({ open: false, client: null });

  const filteredList = clientList.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (row.ClientID?.toString() || "").toLowerCase().includes(query) ||
      (row.LNF || "").toLowerCase().includes(query) ||
      (row.TradeName || "").toLowerCase().includes(query) ||
      (row.Type || "").toLowerCase().includes(query) ||
      (row.DTICertificationNo || "").toLowerCase().includes(query) ||
      (row.SECIDNo || "").toLowerCase().includes(query) ||
      (row.CDACertNo || "").toLowerCase().includes(query) ||
      (row.TaxClearanceCertNo || "").toLowerCase().includes(query) ||
      (row.PhilGEPSCertNo || "").toLowerCase().includes(query) ||
      (row.Status || "").toLowerCase().includes(query);
    const rowDate = row[dateField] ? dayjs(row[dateField]) : null;
    const matchesFrom   = !dateFrom || (rowDate && rowDate.isAfter(dayjs(dateFrom).subtract(1, "day")));
    const matchesTo     = !dateTo   || (rowDate && rowDate.isBefore(dayjs(dateTo).add(1, "day")));
    const matchesStatus = statusFilter === "All" || (row.Status || "") === statusFilter;
    return matchesSearch && matchesFrom && matchesTo && matchesStatus;
  });

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter !== "All";
  const handleClearFilters = () => { setSearchQuery(""); setDateFrom(null); setDateTo(null); setDateField("DateRegistered"); setStatusFilter("All"); setPage(0); };
  const handleOpen  = () => { setForm(emptyForm); setIsEdit(false); setOpen(true); };
  const handleClose = () => { setOpen(false); setForm(emptyForm); };
  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const fmt = (val) => (val ? dayjs(val).format("YYYY-MM-DD") : null);

  const handleEdit = (row) => {
    setForm({
      id: row.ID, clientid: row.ClientID || "", lnf: row.LNF || "",
      type: row.Type || "", tradename: row.TradeName || "",
      dateregistered: row.DateRegistered ? dayjs(row.DateRegistered) : null,
      dateexpiration: row.DateExpiration ? dayjs(row.DateExpiration) : null,
      dticertificationno: row.DTICertificationNo || "",
      dtiexpirationdate:  row.DTIExpirationDate  ? dayjs(row.DTIExpirationDate)  : null,
      secidno: row.SECIDNo || "",
      secexpirationdate:  row.SECExpirationDate  ? dayjs(row.SECExpirationDate)  : null,
      cdacertno: row.CDACertNo || "", efpsaccount: row.EFPSAccount || "",
      taxclearancecertno: row.TaxClearanceCertNo || "",
      taxclearanceexpiration: row.TaxClearanceExpiration ? dayjs(row.TaxClearanceExpiration) : null,
      philgeps: row.PhilGEPS || "", philgepscertno: row.PhilGEPSCertNo || "",
      philgepsexpiration: row.PhilGEPSExpiration ? dayjs(row.PhilGEPSExpiration) : null,
      retentiontype: row.RetentionType || "", status: row.Status || "Active",
    });
    setIsEdit(true); setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      dateregistered: fmt(form.dateregistered), dateexpiration: fmt(form.dateexpiration),
      dtiexpirationdate: fmt(form.dtiexpirationdate), secexpirationdate: fmt(form.secexpirationdate),
      taxclearanceexpiration: fmt(form.taxclearanceexpiration), philgepsexpiration: fmt(form.philgepsexpiration),
    };
    try {
      if (isEdit) { await http.post("/updateclientss", payload); toast.success("Client updated successfully!"); }
      else        { await http.post("/postclientss",   payload); toast.success("Client saved successfully!"); }
      queryClient.invalidateQueries({ queryKey: ["/selectclientss"] });
      handleClose();
    } catch { toast.error(isEdit ? "Failed to update client." : "Failed to save client."); }
  };

  const handleDeleteConfirm = (id) => setDeleteConfirm({ open: true, id });
  const handleDelete = async () => {
    try {
      await http.delete(`/deleteclientss?id=${deleteConfirm.id}`, {
        data: { deletedBy: accessToken?.userName || accessToken?.username || accessToken?.name || accessToken?.EmployeeName || "system" }
      });
      toast.success("Client deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["/selectclientss"] });
      setDeleteConfirm({ open: false, id: null });
    } catch { toast.error("Failed to delete client."); }
  };

  const paginatedList = filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalClients  = clientList.length;

  const cellSx = { fontSize: "0.82rem", whiteSpace: "nowrap", px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" };
  const headerSx = {
    fontWeight: "bold", fontSize: "0.78rem", whiteSpace: "nowrap",
    px: 1.5, py: 1.2, backgroundColor: "action.hover", color: "text.secondary",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "2px solid", borderColor: "divider",
  };

  const headerCells = [
    "#", "Client ID", "LNF", "Type", "Trade Name",
    "Date Registered", "Date Expiration",
    "DTI Cert. No.", "DTI Expiration",
    "SEC ID No.", "SEC Expiration",
    "CDA Cert No.", "EFPS",
    "Tax Clearance No.", "Tax Clearance Exp.",
    "PhilGEPS", "PhilGEPS Cert No.", "PhilGEPS Exp.",
    "Retention", "Status", "Actions",
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleAltIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight="bold">Client Records</Typography>
              <Chip label={hasActiveFilters ? `${filteredList.length} of ${totalClients}` : `${totalClients} record${totalClients !== 1 ? "s" : ""}`}
                size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }} />
            </Box>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpen}>Add Client</Button>
          </Box>

          <Box sx={{ px: 2, py: 1.5, borderBottom: hasActiveFilters ? "1px solid" : "none", borderColor: "divider", display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            <TextField placeholder="Search by name, type, LNF..." size="small" value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} sx={{ width: 240 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setSearchQuery(""); setPage(0); }}><ClearIcon fontSize="small" /></IconButton></InputAdornment> : null,
              }} />
            <TextField label="Status" select size="small" sx={{ width: 130 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "success.main" }} />Active</Box></MenuItem>
              <MenuItem value="Inactive"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "error.main" }} />Inactive</Box></MenuItem>
            </TextField>
            <TextField label="Filter by Date" select size="small" sx={{ width: 200 }} value={dateField} onChange={(e) => setDateField(e.target.value)}>
              {DATE_FIELD_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
            <DatePicker label="From" value={dateFrom} onChange={(val) => { setDateFrom(val); setPage(0); }}
              slotProps={{ textField: { size: "small", sx: { width: 150 } }, field: { clearable: true, onClear: () => setDateFrom(null) } }} />
            <DatePicker label="To" value={dateTo} onChange={(val) => { setDateTo(val); setPage(0); }} minDate={dateFrom || undefined}
              slotProps={{ textField: { size: "small", sx: { width: 150 } }, field: { clearable: true, onClear: () => setDateTo(null) } }} />
            {hasActiveFilters && <Button variant="outlined" size="small" color="warning" startIcon={<FilterAltOffIcon />} onClick={handleClearFilters}>Clear Filters</Button>}
          </Box>

          {hasActiveFilters && (
            <Box sx={{ px: 2, py: 0.8, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Active filters:</Typography>
              {searchQuery && <Chip label={`Search: "${searchQuery}"`} size="small" onDelete={() => { setSearchQuery(""); setPage(0); }} sx={{ fontSize: "0.7rem", height: 20 }} />}
              {statusFilter !== "All" && <Chip label={`Status: ${statusFilter}`} size="small" color={statusFilter === "Active" ? "success" : "error"} onDelete={() => { setStatusFilter("All"); setPage(0); }} sx={{ fontSize: "0.7rem", height: 20 }} />}
              <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>— {filteredList.length} result{filteredList.length !== 1 ? "s" : ""} found</Typography>
            </Box>
          )}
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <TableContainer sx={{ overflowX: "auto", maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>{headerCells.map((label) => <TableCell key={label} sx={headerSx}>{label}</TableCell>)}</TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow><TableCell colSpan={headerCells.length} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    {hasActiveFilters ? "No results match your filters." : "No client records found."}
                  </TableCell></TableRow>
                ) : paginatedList.map((row, index) => (
                  <TableRow key={row.id} hover sx={{ backgroundColor: index % 2 === 0 ? "transparent" : "action.hover", "&:hover": { backgroundColor: "action.selected" } }}>
                    <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 50 }}>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{ ...cellSx, cursor: "pointer", color: "primary.main", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}
                      onClick={() => setClientInfo({ open: true, client: row })}>{row.ClientID || "—"}</TableCell>
                    <TableCell sx={cellSx}>{row.LNF || "—"}</TableCell>
                    <TableCell sx={cellSx}><Chip label={row.Type || "—"} size="small" variant="outlined" sx={{ fontSize: "0.72rem" }} /></TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 600, cursor: "pointer", color: "primary.main" }}
                      onClick={() => setClientInfo({ open: true, client: row })}>{row.TradeName || "—"}</TableCell>
                    <TableCell sx={cellSx}>{fmtDisplay(row.DateRegistered)}</TableCell>
                    <TableCell sx={cellSx}>{fmtDisplay(row.DateExpiration)}</TableCell>
                    <TableCell sx={cellSx}>{row.DTICertificationNo || "—"}</TableCell>
                    <TableCell sx={cellSx}>{fmtDisplay(row.DTIExpirationDate)}</TableCell>
                    <TableCell sx={cellSx}>{row.SECIDNo || "—"}</TableCell>
                    <TableCell sx={cellSx}>{fmtDisplay(row.SECExpirationDate)}</TableCell>
                    <TableCell sx={cellSx}>{row.CDACertNo || "—"}</TableCell>
                    <TableCell sx={cellSx}><Chip label={row.EFPSAccount || "—"} size="small" color={row.EFPSAccount === "Yes" ? "success" : "default"} sx={{ fontSize: "0.72rem" }} /></TableCell>
                    <TableCell sx={cellSx}>{row.TaxClearanceCertNo || "—"}</TableCell>
                    <TableCell sx={cellSx}>{fmtDisplay(row.TaxClearanceExpiration)}</TableCell>
                    <TableCell sx={cellSx}><Chip label={row.PhilGEPS || "—"} size="small" color={row.PhilGEPS === "Yes" ? "success" : "default"} sx={{ fontSize: "0.72rem" }} /></TableCell>
                    <TableCell sx={cellSx}>{row.PhilGEPSCertNo || "—"}</TableCell>
                    <TableCell sx={cellSx}>{fmtDisplay(row.PhilGEPSExpiration)}</TableCell>
                    <TableCell sx={cellSx}><Chip label={row.RetentionType || "—"} size="small" variant="outlined" color="primary" sx={{ fontSize: "0.72rem" }} /></TableCell>
                    <TableCell sx={cellSx}><Chip label={row.Status || "—"} size="small" color={row.Status === "Active" ? "success" : "error"} sx={{ fontSize: "0.72rem" }} /></TableCell>
                    <TableCell sx={cellSx} align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row.ID)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div"
            count={filteredList.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ borderTop: "1px solid", borderColor: "divider" }} />
        </Paper>

        {/* Add / Edit Client Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: { maxHeight: "90vh", borderRadius: 2 } }}>
          <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1.5,
            backgroundColor: isEdit ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.07) : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.07),
            display: "flex", alignItems: "center", gap: 1 }}>
            {isEdit ? <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} /> : <AddIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: isEdit ? theme.palette.warning.main : theme.palette.primary.main }}>
              {isEdit ? "Edit Client" : "Add New Client"}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary" }}>Basic Information</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="Client ID" fullWidth size="small" value={form.clientid} onChange={(e) => handleChange("clientid", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="LNF" fullWidth size="small" value={form.lnf} onChange={(e) => handleChange("lnf", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Type" select fullWidth size="small" value={form.type} onChange={(e) => handleChange("type", e.target.value)}>
                  {["Corporation", "Sole Proprietorship", "COOP"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="Trade Name" fullWidth size="small" value={form.tradename} onChange={(e) => handleChange("tradename", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Date Registered" value={form.dateregistered} onChange={(val) => handleChange("dateregistered", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Date Expiration" value={form.dateexpiration} onChange={(val) => handleChange("dateexpiration", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>DTI Details</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="DTI Certification No." fullWidth size="small" value={form.dticertificationno} onChange={(e) => handleChange("dticertificationno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="DTI Expiration Date" value={form.dtiexpirationdate} onChange={(val) => handleChange("dtiexpirationdate", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>SEC Details</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="SEC ID No." fullWidth size="small" value={form.secidno} onChange={(e) => handleChange("secidno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="SEC Expiration Date" value={form.secexpirationdate} onChange={(val) => handleChange("secexpirationdate", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>CDA Details</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="CDA Cert No." fullWidth size="small" value={form.cdacertno} onChange={(e) => handleChange("cdacertno", e.target.value)} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>Tax Clearance</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="Tax Clearance Cert No." fullWidth size="small" value={form.taxclearancecertno} onChange={(e) => handleChange("taxclearancecertno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Tax Clearance Expiration" value={form.taxclearanceexpiration} onChange={(val) => handleChange("taxclearanceexpiration", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>PhilGEPS Details</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="PhilGEPS" select fullWidth size="small" value={form.philgeps} onChange={(e) => handleChange("philgeps", e.target.value)}>
                  {["Yes", "No"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="PhilGEPS Cert No." fullWidth size="small" value={form.philgepscertno} onChange={(e) => handleChange("philgepscertno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="PhilGEPS Expiration" value={form.philgepsexpiration} onChange={(val) => handleChange("philgepsexpiration", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>Other Details</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="EFPS Account" select fullWidth size="small" value={form.efpsaccount} onChange={(e) => handleChange("efpsaccount", e.target.value)}>
                  {["Yes", "No"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Retention Type" select fullWidth size="small" value={form.retentiontype} onChange={(e) => handleChange("retentiontype", e.target.value)}>
                  {["Monthly", "Quarterly", "Semi Annual"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Status" select fullWidth size="small" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                  {["Active", "Inactive"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit}>{isEdit ? "Update" : "Save"}</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>Confirm Delete</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>Are you sure you want to delete this client record? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
            <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>

        <ClientInfoDialog
          open={clientInfo.open}
          onClose={() => setClientInfo({ open: false, client: null })}
          client={clientInfo.client}
          accessToken={accessToken}
          theme={theme}
        />

      </Box>
    </LocalizationProvider>
  );
}