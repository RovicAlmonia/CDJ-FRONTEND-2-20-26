import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Divider,
  alpha,
  useTheme,
  Collapse,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import PaymentIcon from "@mui/icons-material/Payment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";

const emptyForm = {
  id: "",
  clientid: "",
  gross: "",
  discount: "",
  net: "",
  paymentamount: "",
  paymentdate: null,
  paymentmethod: "",
  paymentreference: "",
  paymentstatus: "Unpaid",
};

const PAYMENT_METHODS = ["Cash", "Check", "Bank Transfer", "GCash", "Maya"];
const PAYMENT_STATUSES = ["Unpaid", "Partial", "Paid"];

export default function BillingInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();

  const { data: billingRaw } = hookContainer("/selectbillinghdr");
  const { data: hdrRaw } = hookContainer("/selecttransactionhdr");
  const { data: clientsRaw } = hookContainer("/selectclientss");

  const billingList = Array.isArray(billingRaw?.data)
    ? billingRaw.data.map((r, i) => ({ ...r, id: r.ID || i }))
    : [];
  const transactionList = Array.isArray(hdrRaw?.data) ? hdrRaw.data : [];
  const clientList = Array.isArray(clientsRaw?.data) ? clientsRaw.data : [];

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  // Enrich billing rows with client info + transaction breakdown
  const enrichedList = billingList.map((b) => {
    const client = clientList.find(
      (c) => String(c.ClientID) === String(b.ClientID)
    );
    const clientTxns = transactionList.filter(
      (t) => String(t.ClientID) === String(b.ClientID)
    );
    return {
      ...b,
      tradename: client?.TradeName || client?.LNF || "—",
      type: client?.Type || "—",
      retentiontype: client?.RetentionType || "—",
      clientstatus: client?.Status || "—",
      transactions: clientTxns,
    };
  });

  const filteredList = enrichedList.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (row.ClientID?.toString() || "").toLowerCase().includes(query) ||
      (row.tradename || "").toLowerCase().includes(query) ||
      (row.PaymentStatus || "").toLowerCase().includes(query)
    );
  });

  const paginatedList = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const grandGross    = enrichedList.reduce((s, r) => s + parseFloat(r.Gross         || 0), 0);
  const grandDiscount = enrichedList.reduce((s, r) => s + parseFloat(r.Discount      || 0), 0);
  const grandNet      = enrichedList.reduce((s, r) => s + parseFloat(r.Net           || 0), 0);
  const grandPaid     = enrichedList.reduce((s, r) => s + parseFloat(r.PaymentAmount || 0), 0);

  // ── handleChange: auto-fill gross/discount/net from transactions when client selected ──
  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "clientid") {
        const clientTxns = transactionList.filter(
          (t) => String(t.ClientID) === String(value)
        );
        const autoGross    = clientTxns.reduce((s, t) => s + parseFloat(t.GrossTotal || 0), 0);
        const autoDiscount = clientTxns.reduce((s, t) => s + parseFloat(t.Discount   || 0), 0);
        const autoNet      = clientTxns.reduce((s, t) => s + parseFloat(t.NetTotal   || 0), 0);

        updated.gross    = autoGross.toFixed(2);
        updated.discount = autoDiscount.toFixed(2);
        updated.net      = autoNet.toFixed(2);

        // Reset payment fields when client changes
        updated.paymentamount    = "";
        updated.paymentstatus    = "Unpaid";
        updated.paymentdate      = null;
        updated.paymentmethod    = "";
        updated.paymentreference = "";

        return updated;
      }

      // Recalculate net when gross or discount changes
      const gross    = parseFloat(field === "gross"    ? value : updated.gross)    || 0;
      const discount = parseFloat(field === "discount" ? value : updated.discount) || 0;
      const payment  = parseFloat(field === "paymentamount" ? value : updated.paymentamount) || 0;

      updated.net = (gross - discount).toFixed(2);

      // Auto-set payment status
      if (field === "paymentamount" || field === "gross" || field === "discount") {
        const net = gross - discount;
        if (payment <= 0)        updated.paymentstatus = "Unpaid";
        else if (payment >= net) updated.paymentstatus = "Paid";
        else                     updated.paymentstatus = "Partial";
      }

      return updated;
    });
  };

  const handleOpen = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm({
      id: row.ID,
      clientid: row.ClientID || "",
      gross: row.Gross || "",
      discount: row.Discount || "",
      net: row.Net || "",
      paymentamount: row.PaymentAmount || "",
      paymentdate: row.PaymentDate ? dayjs(row.PaymentDate) : null,
      paymentmethod: row.PaymentMethod || "",
      paymentreference: row.PaymentReference || "",
      paymentstatus: row.PaymentStatus || "Unpaid",
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const fmt = (val) => (val ? dayjs(val).format("YYYY-MM-DD") : null);

  const handleSubmit = async () => {
    if (!form.clientid) {
      toast.error("Client ID is required.");
      return;
    }
    const payload = {
      ...form,
      gross: parseFloat(form.gross) || 0,
      discount: parseFloat(form.discount) || 0,
      net: parseFloat(form.net) || 0,
      paymentamount: parseFloat(form.paymentamount) || 0,
      paymentdate: fmt(form.paymentdate),
    };
    try {
      if (isEdit) {
        await http.post("/updatebillinghdr", payload);
        toast.success("Billing record updated!");
      } else {
        await http.post("/postbillinghdr", payload);
        toast.success("Billing record saved!");
      }
      queryClient.invalidateQueries("/selectbillinghdr");
      handleClose();
    } catch {
      toast.error(isEdit ? "Failed to update." : "Failed to save.");
    }
  };

  const handleDeleteConfirm = (id) => setDeleteConfirm({ open: true, id });

  const handleDelete = async () => {
    try {
      await http.delete(`/deletebillinghdr?id=${deleteConfirm.id}`);
      toast.success("Billing record deleted!");
      queryClient.invalidateQueries("/selectbillinghdr");
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error("Failed to delete.");
    }
  };

  // ── Print Receipt: writes full HTML to a new window — never blank ──
  const handlePrint = (row) => {
    const fmtM = (val) =>
      parseFloat(val || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const fmtD = (val) => (val ? dayjs(val).format("MMM D, YYYY") : "—");

    const txnRows = (row.transactions || [])
      .map(
        (txn) => `
          <tr>
            <td>${fmtD(txn.TransactionDate)}</td>
            <td>${txn.Particulars || "—"}</td>
            <td class="right">₱ ${fmtM(txn.GrossTotal)}</td>
            <td class="right">₱ ${fmtM(txn.Discount)}</td>
            <td class="right">₱ ${fmtM(txn.NetTotal)}</td>
            <td>${txn.Status || "—"}</td>
          </tr>`
      )
      .join("");

    const balance = parseFloat(row.Net || 0) - parseFloat(row.PaymentAmount || 0);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt #${row.ID}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #000; padding: 40px; background: #fff; }
    h2 { text-align: center; font-size: 22px; letter-spacing: 2px; margin-bottom: 4px; }
    .sub { text-align: center; color: #555; font-size: 12px; margin-bottom: 20px; }
    hr { border: none; border-top: 1px solid #333; margin: 14px 0; }
    hr.thick { border-top: 2px solid #000; }
    .info-grid { display: flex; justify-content: space-between; margin-bottom: 16px; gap: 16px; }
    .info-left, .info-right { flex: 1; }
    .info-right { text-align: right; }
    .info-left p, .info-right p { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th { background: #f0f0f0; text-align: left; padding: 6px 8px; border-bottom: 1px solid #000; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; }
    .right { text-align: right; }
    .no-txn { text-align: center; color: #999; padding: 12px; }
    .totals { margin-top: 16px; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .totals p { font-size: 13px; }
    .totals .bold { font-weight: bold; }
    .totals .green { color: #1a7a1a; font-weight: bold; }
    .totals .red { color: #c0392b; font-weight: bold; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ccc; padding-top: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h2>OFFICIAL RECEIPT</h2>
  <p class="sub">Billing Record #${row.ID}</p>
  <hr class="thick"/>
  <div class="info-grid">
    <div class="info-left">
      <p><strong>Client ID:</strong> ${row.ClientID || "—"}</p>
      <p><strong>Trade Name:</strong> ${row.tradename || "—"}</p>
      <p><strong>Type:</strong> ${row.type || "—"}</p>
      <p><strong>Retention:</strong> ${row.retentiontype || "—"}</p>
    </div>
    <div class="info-right">
      <p><strong>Payment Date:</strong> ${fmtD(row.PaymentDate)}</p>
      <p><strong>Payment Method:</strong> ${row.PaymentMethod || "—"}</p>
      <p><strong>Reference #:</strong> ${row.PaymentReference || "—"}</p>
      <p><strong>Status:</strong> ${row.PaymentStatus || "—"}</p>
    </div>
  </div>
  <hr/>
  <p><strong>Transaction Details:</strong></p>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Particulars</th>
        <th class="right">Gross (₱)</th>
        <th class="right">Discount (₱)</th>
        <th class="right">Net (₱)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${txnRows || `<tr><td colspan="6" class="no-txn">No transactions linked to this client.</td></tr>`}
    </tbody>
  </table>
  <hr/>
  <div class="totals">
    <p>Gross Total: ₱ ${fmtM(row.Gross)}</p>
    <p>Discount: &nbsp;&nbsp;&nbsp;₱ ${fmtM(row.Discount)}</p>
    <p class="bold">Net Total: &nbsp;₱ ${fmtM(row.Net)}</p>
    <p class="green">Amount Paid: ₱ ${fmtM(row.PaymentAmount)}</p>
    <p class="${balance > 0 ? "red" : "green"}">Balance: &nbsp;&nbsp;&nbsp;&nbsp;₱ ${fmtM(balance)}</p>
  </div>
  <div class="footer">Printed on ${dayjs().format("MMMM D, YYYY h:mm A")}</div>
  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=820,height=680");
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site to print.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const fmtMoney = (val) =>
    parseFloat(val || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtDate = (val) =>
    val ? dayjs(val).format("MMM D, YYYY") : "—";

  const paymentStatusColor = (s) => {
    if (s === "Paid") return "success";
    if (s === "Partial") return "warning";
    return "error";
  };

  const totalRecords = enrichedList.length;

  const cellSx = {
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
    px: 1.5,
    py: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const headerSx = {
    fontWeight: "bold",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
    px: 1.5,
    py: 1.2,
    backgroundColor: "action.hover",
    color: "text.secondary",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid",
    borderColor: "divider",
  };

  const subHeaderSx = {
    ...headerSx,
    backgroundColor: "transparent",
    fontSize: "0.72rem",
    py: 0.8,
    borderBottom: "1px solid",
  };

  const readOnlySx = {
    "& .MuiOutlinedInput-root": { backgroundColor: "action.hover" },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* ── Summary Cards ── */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {[
            { label: "Total Billing Records", value: totalRecords,                    mono: false, color: "primary.main" },
            { label: "Grand Gross",           value: `₱ ${fmtMoney(grandGross)}`,    mono: true,  color: "text.primary"  },
            { label: "Grand Discount",        value: `₱ ${fmtMoney(grandDiscount)}`, mono: true,  color: "error.main"    },
            { label: "Grand Net",             value: `₱ ${fmtMoney(grandNet)}`,      mono: true,  color: "text.primary"  },
            { label: "Total Payments",        value: `₱ ${fmtMoney(grandPaid)}`,     mono: true,  color: "success.main"  },
          ].map((card) => (
            <Paper
              key={card.label}
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                flex: 1,
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {card.label}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: card.color,
                  fontFamily: card.mono ? "monospace" : "inherit",
                  fontSize: card.mono ? "0.95rem" : "1.2rem",
                }}
              >
                {card.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* ── Toolbar ── */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Billing Records
              </Typography>
              <Chip
                label={
                  searchQuery
                    ? `${filteredList.length} of ${totalRecords}`
                    : `${totalRecords} record${totalRecords !== 1 ? "s" : ""}`
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add Billing
            </Button>
          </Box>

          <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by client ID, name, status..."
              size="small"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              sx={{ width: 280 }}
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

          {searchQuery && (
            <Box sx={{ px: 2, py: 0.8, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">Search results for:</Typography>
              <Chip
                label={searchQuery}
                size="small"
                onDelete={() => { setSearchQuery(""); setPage(0); }}
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                — {filteredList.length} result{filteredList.length !== 1 ? "s" : ""} found
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ── Table ── */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
        >
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...headerSx, width: 40 }} />
                  <TableCell sx={{ ...headerSx, width: 50 }}>#</TableCell>
                  <TableCell sx={headerSx}>Client ID</TableCell>
                  <TableCell sx={headerSx}>Trade Name</TableCell>
                  <TableCell sx={headerSx}>Retention</TableCell>
                  <TableCell sx={headerSx} align="right">Gross (₱)</TableCell>
                  <TableCell sx={headerSx} align="right">Discount (₱)</TableCell>
                  <TableCell sx={headerSx} align="right">Net (₱)</TableCell>
                  <TableCell sx={headerSx} align="right">Paid (₱)</TableCell>
                  <TableCell sx={headerSx} align="right">Balance (₱)</TableCell>
                  <TableCell sx={headerSx}>Method</TableCell>
                  <TableCell sx={headerSx}>Payment Date</TableCell>
                  <TableCell sx={headerSx} align="center">Status</TableCell>
                  <TableCell sx={headerSx} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      {searchQuery ? "No results match your search." : "No billing records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedList.map((row, index) => {
                    const isExpanded = expandedRow === row.ID;
                    const rowNumber = page * rowsPerPage + index + 1;
                    const balance = parseFloat(row.Net || 0) - parseFloat(row.PaymentAmount || 0);
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          hover
                          sx={{
                            backgroundColor: isExpanded
                              ? "action.selected"
                              : index % 2 === 0
                              ? "transparent"
                              : "action.hover",
                            "&:hover": { backgroundColor: "action.selected" },
                          }}
                        >
                          <TableCell sx={{ ...cellSx, width: 40, textAlign: "center" }}>
                            <IconButton
                              size="small"
                              onClick={() => setExpandedRow(isExpanded ? null : row.ID)}
                            >
                              {isExpanded
                                ? <KeyboardArrowUpIcon fontSize="small" />
                                : <KeyboardArrowDownIcon fontSize="small" />}
                            </IconButton>
                          </TableCell>

                          <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center" }}>
                            {rowNumber}
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Chip label={row.ClientID || "—"} size="small" variant="outlined" sx={{ fontSize: "0.72rem" }} />
                          </TableCell>
                          <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{row.tradename}</TableCell>
                          <TableCell sx={cellSx}>
                            <Chip label={row.retentiontype || "—"} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.72rem" }} />
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                              ₱ {fmtMoney(row.Gross)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "error.main" }}>
                              ₱ {fmtMoney(row.Discount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                              ₱ {fmtMoney(row.Net)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "success.main" }}>
                              ₱ {fmtMoney(row.PaymentAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                                color: balance <= 0 ? "success.main" : "error.main",
                              }}
                            >
                              ₱ {fmtMoney(balance)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            {row.PaymentMethod ? (
                              <Chip label={row.PaymentMethod} size="small" variant="outlined" sx={{ fontSize: "0.72rem" }} />
                            ) : "—"}
                          </TableCell>
                          <TableCell sx={cellSx}>{fmtDate(row.PaymentDate)}</TableCell>
                          <TableCell sx={cellSx} align="center">
                            <Chip
                              label={row.PaymentStatus || "Unpaid"}
                              size="small"
                              color={paymentStatusColor(row.PaymentStatus)}
                              sx={{ fontSize: "0.72rem" }}
                            />
                          </TableCell>
                          <TableCell sx={cellSx} align="center">
                            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                              <Tooltip title="Print Receipt">
                                <IconButton size="small" color="primary" onClick={() => handlePrint(row)}>
                                  <PrintIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(row)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row.ID)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* ── Expanded transaction breakdown ── */}
                        <TableRow>
                          <TableCell colSpan={14} sx={{ p: 0, borderBottom: isExpanded ? "1px solid" : "none", borderColor: "divider" }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ px: 5, py: 1.5, backgroundColor: "action.hover" }}>
                                <Typography
                                  variant="caption"
                                  fontWeight="bold"
                                  sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}
                                >
                                  Transaction Breakdown — {row.tradename}
                                </Typography>
                                <Table size="small" sx={{ mt: 1 }}>
                                  <TableHead>
                                    <TableRow>
                                      {["Date", "Particulars", "Gross (₱)", "Discount (₱)", "Net (₱)", "Status"].map((h) => (
                                        <TableCell key={h} sx={subHeaderSx}>{h}</TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {row.transactions.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 2, color: "text.disabled", fontSize: "0.78rem" }}>
                                          No transactions linked to this client.
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      row.transactions.map((txn) => (
                                        <TableRow key={txn.ID} hover>
                                          <TableCell sx={{ ...cellSx, fontSize: "0.78rem" }}>{fmtDate(txn.TransactionDate)}</TableCell>
                                          <TableCell sx={{ ...cellSx, fontSize: "0.78rem", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {txn.Particulars || "—"}
                                          </TableCell>
                                          <TableCell sx={{ ...cellSx, fontSize: "0.78rem" }} align="right">
                                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>₱ {fmtMoney(txn.GrossTotal)}</Typography>
                                          </TableCell>
                                          <TableCell sx={{ ...cellSx, fontSize: "0.78rem" }} align="right">
                                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>₱ {fmtMoney(txn.Discount)}</Typography>
                                          </TableCell>
                                          <TableCell sx={{ ...cellSx, fontSize: "0.78rem" }} align="right">
                                            <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>₱ {fmtMoney(txn.NetTotal)}</Typography>
                                          </TableCell>
                                          <TableCell sx={{ ...cellSx, fontSize: "0.78rem" }}>
                                            <Chip
                                              label={txn.Status || "—"}
                                              size="small"
                                              color={txn.Status === "Paid" ? "success" : txn.Status === "Posted" ? "primary" : "default"}
                                              sx={{ fontSize: "0.68rem", height: 18 }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                    {row.transactions.length > 0 && (
                                      <TableRow>
                                        <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: "bold", fontSize: "0.78rem" }}>Subtotal</TableCell>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold", fontSize: "0.78rem" }} align="right">
                                          <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace" }}>₱ {fmtMoney(row.Gross)}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold", fontSize: "0.78rem" }} align="right">
                                          <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "error.main" }}>₱ {fmtMoney(row.Discount)}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold", fontSize: "0.78rem" }} align="right">
                                          <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>₱ {fmtMoney(row.Net)}</Typography>
                                        </TableCell>
                                        <TableCell sx={cellSx} />
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>

                                {/* Payment summary in expanded view */}
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                                  <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5, minWidth: 220 }}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                      Payment Summary
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.8 }}>
                                      <Typography variant="caption" color="text.secondary">Method</Typography>
                                      <Typography variant="caption" fontWeight="bold">{row.PaymentMethod || "—"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography variant="caption" color="text.secondary">Reference #</Typography>
                                      <Typography variant="caption" fontWeight="bold">{row.PaymentReference || "—"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography variant="caption" color="text.secondary">Date Paid</Typography>
                                      <Typography variant="caption" fontWeight="bold">{fmtDate(row.PaymentDate)}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 0.8 }} />
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography variant="caption" color="text.secondary">Amount Paid</Typography>
                                      <Typography variant="caption" fontWeight="bold" sx={{ color: "success.main", fontFamily: "monospace" }}>
                                        ₱ {fmtMoney(row.PaymentAmount)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography variant="caption" color="text.secondary">Balance</Typography>
                                      <Typography
                                        variant="caption"
                                        fontWeight="bold"
                                        sx={{
                                          color: (parseFloat(row.Net || 0) - parseFloat(row.PaymentAmount || 0)) <= 0
                                            ? "success.main"
                                            : "error.main",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        ₱ {fmtMoney(parseFloat(row.Net || 0) - parseFloat(row.PaymentAmount || 0))}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Box>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Paper>

        {/* ── Add/Edit Dialog ──
            disableRestoreFocus  → fixes aria-hidden warning on close
            component="div"      → fixes <h6> inside <h2> nesting warning
        ── */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          disableRestoreFocus
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle
            component="div"
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 1.5,
              backgroundColor: isEdit
                ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.07)
                : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.07),
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {isEdit
              ? <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              : <PaymentIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: isEdit ? theme.palette.warning.main : theme.palette.primary.main }}
            >
              {isEdit ? "Edit Billing Record" : "Add Billing Record"}
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>

              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary" }}>
                  Billing Details
                </Typography>
              </Grid>

              {/* Client selector — triggers auto-fill of gross/discount/net */}
              <Grid item xs={12}>
                <TextField
  label="Client ID"
  select
  fullWidth
  size="small"
  id="client-id-input"                
  value={form.clientid}
  onChange={(e) => handleChange("clientid", e.target.value)}
>
                  {clientList.map((c) => (
                    <MenuItem key={c.ID} value={c.ClientID}>
                      {c.ClientID} — {c.TradeName || c.LNF || ""}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Gross — read-only, auto-filled from transactions */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gross (₱)"
                  fullWidth
                  size="small"
                  type="number"
                  value={form.gross}
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                  helperText="Auto-filled from transactions"
                />
              </Grid>

              {/* Discount — read-only, auto-filled from transactions */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Discount (₱)"
                  fullWidth
                  size="small"
                  type="number"
                  value={form.discount}
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                  helperText="Auto-filled from transactions"
                />
              </Grid>

              {/* Net — read-only, computed */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Net (₱)"
                  fullWidth
                  size="small"
                  value={form.net}
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                  helperText="Gross minus Discount"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  Payment Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Payment Amount (₱)"
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={form.paymentamount}
                  onChange={(e) => handleChange("paymentamount", e.target.value)}
                />
              </Grid>

              {/* DatePicker: id passed via slotProps fixes label-for mismatch warning */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Payment Date"
                  value={form.paymentdate}
                  onChange={(val) => handleChange("paymentdate", val)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      id: "payment-date-input",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
  label="Payment Method"
  select
  fullWidth
  size="small"
  id="payment-method-input"           
  value={form.paymentmethod}
  onChange={(e) => handleChange("paymentmethod", e.target.value)}
>
                  <MenuItem value="">— None —</MenuItem>
                  {PAYMENT_METHODS.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Reference No."
                  fullWidth
                  size="small"
                  value={form.paymentreference}
                  onChange={(e) => handleChange("paymentreference", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
  label="Payment Status"
  select
  fullWidth
  size="small"
  id="payment-status-input"         
  value={form.paymentstatus}
  onChange={(e) => handleChange("paymentstatus", e.target.value)}
>
                  {PAYMENT_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEdit ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete Confirmation ──
            disableRestoreFocus  → fixes aria-hidden warning on close
            component="div"      → fixes <h6> inside <h2> nesting warning
        ── */}
        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, id: null })}
          disableRestoreFocus
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle component="div" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight="bold">Confirm Delete</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>
              Are you sure you want to delete this billing record? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
            <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>


      </Box>
    </LocalizationProvider>
  );
}