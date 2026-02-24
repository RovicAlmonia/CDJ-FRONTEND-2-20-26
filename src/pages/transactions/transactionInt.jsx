import React, { useState, useRef } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Typography, IconButton, Chip, Tooltip,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, InputAdornment, Divider, alpha, useTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";

const emptyHdr = {
  id: "", transactiondate: null, clientid: "", particulars: "",
  grosstotal: 0, discount: 0, nettotal: 0, status: "Active",
};

const emptyDtl = {
  id: "", serviceid: "", servicename: "", rate: "", qty: 1,
  gross: 0, discount: 0, net: 0,
};

const fmtPHP = (v) =>
  "₱ " + parseFloat(v || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const fmtDate = (v) => v ? dayjs(v).format("MMM D, YYYY") : "—";

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  const lower = keys.map((k) => k.toLowerCase());
  for (const ok of Object.keys(obj)) {
    if (lower.includes(ok.toLowerCase()) && obj[ok] !== undefined && obj[ok] !== null && obj[ok] !== "") {
      return obj[ok];
    }
  }
  return undefined;
};

const normalizeDtl = (r) => ({
  ID:          pick(r, "ID", "id")                                                   ?? "",
  ServiceID:   pick(r, "ServiceID", "serviceId", "serviceid", "service_id")         ?? "",
  ServiceName: pick(r, "ServiceName", "serviceName", "servicename", "service_name") ?? "—",
  Rate:        pick(r, "Rate", "rate")                                               ?? 0,
  QTY:         pick(r, "QTY", "Qty", "qty", "quantity", "Quantity")                 ?? 1,
  Gross:       pick(r, "Gross", "gross")                                             ?? 0,
  Discount:    pick(r, "Discount", "discount")                                       ?? 0,
  Net:         pick(r, "Net", "net")                                                 ?? 0,
});

export default function TransactionInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const printRef = useRef();

  const { data: hdrRaw }      = hookContainer("/selecttransactionhdr");
  const { data: clientsRaw }  = hookContainer("/selectclientss");
  const { data: servicesRaw } = hookContainer("/selectserviceslist");

  const hdrList = Array.isArray(hdrRaw?.data)
    ? hdrRaw.data.map((r, i) => ({ ...r, id: r.ID || i })) : [];
  const clientList  = Array.isArray(clientsRaw?.data)  ? clientsRaw.data  : [];
  const serviceList = Array.isArray(servicesRaw?.data) ? servicesRaw.data : [];

  // HDR state
  const [hdrForm, setHdrForm] = useState(emptyHdr);
  const [isEdit, setIsEdit]   = useState(false);
  const [open, setOpen]       = useState(false);

  // DTL state
  const [dtlRows, setDtlRows] = useState([]);
  const [dtlForm, setDtlForm] = useState(emptyDtl);
  const [dtlEdit, setDtlEdit] = useState(false);

  // Table / filter state
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // ── Receipt state ──
  const [receiptOpen, setReceiptOpen]     = useState(false);
  const [receiptMode, setReceiptMode]     = useState("single");
  const [receiptClient, setReceiptClient] = useState(null);
  const [receiptData, setReceiptData]     = useState(null);
  const [receiptDtls, setReceiptDtls]     = useState([]);
  const [receiptGroups, setReceiptGroups] = useState([]);

  const filteredList = hdrList.filter((row) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      (row.ClientID || "").toLowerCase().includes(q) ||
      (row.Particulars || "").toLowerCase().includes(q) ||
      (row.Status || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || row.Status === statusFilter;
    return matchSearch && matchStatus;
  });

  const hasFilters = searchQuery || statusFilter !== "All";

  const paginatedList = filteredList.slice(
    page * rowsPerPage, page * rowsPerPage + rowsPerPage
  );

  // ── HDR helpers ──
  const hdrChange = (f, v) => setHdrForm((p) => ({ ...p, [f]: v }));

  const computeHdrTotals = (rows) => {
    const gross    = rows.reduce((s, r) => s + parseFloat(pick(r, "gross", "Gross")       || 0), 0);
    const discount = rows.reduce((s, r) => s + parseFloat(pick(r, "discount", "Discount") || 0), 0);
    const net      = rows.reduce((s, r) => s + parseFloat(pick(r, "net", "Net")           || 0), 0);
    setHdrForm((p) => ({ ...p, grosstotal: gross, discount, nettotal: net }));
  };

  const handleOpen = () => {
    setHdrForm(emptyHdr); setDtlRows([]); setDtlForm(emptyDtl);
    setDtlEdit(false); setIsEdit(false); setOpen(true);
  };

  const handleEdit = async (row) => {
    setHdrForm({
      id: row.ID, transactiondate: row.TransactionDate ? dayjs(row.TransactionDate) : null,
      clientid: row.ClientID || "", particulars: row.Particulars || "",
      grosstotal: row.GrossTotal || 0, discount: row.Discount || 0,
      nettotal: row.NetTotal || 0, status: row.Status || "Active",
    });
    try {
      const res = await http.get(`/selecttransactiondtlbyhdr?hdrid=${row.ID}`);
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
      setDtlRows(rows.map((r, i) => ({ ...r, _key: r.ID || i })));
    } catch { setDtlRows([]); }
    setDtlForm(emptyDtl); setDtlEdit(false); setIsEdit(true); setOpen(true);
  };

  const handleClose = () => { setOpen(false); setHdrForm(emptyHdr); setDtlRows([]); };

  const handleSubmitHdr = async () => {
    if (!hdrForm.clientid) { toast.error("Client is required."); return; }
    const payload = {
      ...hdrForm,
      transactiondate: hdrForm.transactiondate
        ? dayjs(hdrForm.transactiondate).format("YYYY-MM-DD") : null,
    };
    try {
      let hdrId = hdrForm.id;
      if (isEdit) {
        await http.post("/updatetransactionhdr", payload);
        toast.success("Transaction updated!");
      } else {
        const res = await http.post("/posttransactionhdr", payload);
        hdrId = res?.data?.data?.insertId || res?.data?.insertId;
        toast.success("Transaction saved!");
      }
      for (const dtl of dtlRows) {
        if (dtl._new)          await http.post("/posttransactiondtl",    { ...dtl, transactionhdrid: hdrId });
        else if (dtl._updated) await http.post("/updatetransactiondtl",  dtl);
      }
      queryClient.invalidateQueries("/selecttransactionhdr");
      handleClose();
    } catch { toast.error("Failed to save transaction."); }
  };

  const handleDeleteConfirm = (id) => setDeleteConfirm({ open: true, id });

  const handleDelete = async () => {
    try {
      await http.delete(`/deletetransactiondtlbyhdr?hdrid=${deleteConfirm.id}`);
      await http.delete(`/deletetransactionhdr?id=${deleteConfirm.id}`);
      toast.success("Transaction deleted.");
      queryClient.invalidateQueries("/selecttransactionhdr");
      setDeleteConfirm({ open: false, id: null });
    } catch { toast.error("Failed to delete."); }
  };

  // ── DTL helpers ──
  const dtlChange = (f, v) => {
    setDtlForm((p) => {
      const updated = { ...p, [f]: v };
      if (f === "serviceid") {
        const svc = serviceList.find((s) => String(s.ServiceID) === String(v));
        if (svc) { updated.servicename = svc.ServiceName; updated.rate = svc.ServiceRate; }
      }
      const rate = parseFloat(updated.rate || 0);
      const qty  = parseFloat(updated.qty  || 1);
      const disc = parseFloat(updated.discount || 0);
      updated.gross = rate * qty;
      updated.net   = updated.gross - disc;
      return updated;
    });
  };

  const addDtlRow = () => {
    if (!dtlForm.servicename) { toast.error("Service name is required."); return; }
    if (dtlEdit) {
      const updated = dtlRows.map((r) =>
        r._key === dtlForm._key ? { ...dtlForm, _updated: !dtlForm._new } : r
      );
      setDtlRows(updated); computeHdrTotals(updated);
    } else {
      const updated = [...dtlRows, { ...dtlForm, _key: Date.now(), _new: true }];
      setDtlRows(updated); computeHdrTotals(updated);
    }
    setDtlForm(emptyDtl); setDtlEdit(false);
  };

  const editDtlRow  = (row) => { setDtlForm(row); setDtlEdit(true); };

  const removeDtlRow = async (row) => {
    if (row.ID && !row._new) {
      try { await http.delete(`/deletetransactiondtl?id=${row.ID}`); } catch { /**/ }
    }
    const updated = dtlRows.filter((r) => r._key !== row._key);
    setDtlRows(updated); computeHdrTotals(updated);
  };

  // ── Receipt helpers ──
  const fetchDtlForHdr = async (hdrId) => {
    try {
      const res = await http.get(`/selecttransactiondtlbyhdr?hdrid=${hdrId}`);
      const raw = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];
      return raw.map(normalizeDtl);
    } catch { return []; }
  };

  const handleViewReceipt = async (row) => {
    const cName = clientName(row.ClientID);
    setReceiptClient({ id: row.ClientID, name: cName });
    setReceiptData(row);
    setReceiptDtls([]);
    setReceiptGroups([]);
    setReceiptMode("single");

    const dtls = await fetchDtlForHdr(row.ID);
    setReceiptDtls(dtls);
    setReceiptOpen(true);
  };

  /**
   * Combined receipt — only includes transactions that are NOT fully Paid.
   */
  const handleViewCombinedReceipt = async (clientId) => {
    const cName = clientName(clientId);
    setReceiptClient({ id: clientId, name: cName });
    setReceiptMode("combined");
    setReceiptGroups([]);
    setReceiptOpen(true);

    // ✅ Exclude Paid transactions from the combined receipt
    const clientHdrs = hdrList.filter(
      (h) => String(h.ClientID) === String(clientId) && h.Status !== "Paid"
    );

    const groups = await Promise.all(
      clientHdrs.map(async (hdr) => ({
        hdr,
        dtls: await fetchDtlForHdr(hdr.ID),
      }))
    );
    setReceiptGroups(groups);
  };

  // Combined receipt grand totals (already filtered to non-Paid)
  const combinedGross    = receiptGroups.reduce((s, g) => s + parseFloat(g.hdr.GrossTotal || 0), 0);
  const combinedDiscount = receiptGroups.reduce((s, g) => s + parseFloat(g.hdr.Discount   || 0), 0);
  const combinedNet      = receiptGroups.reduce((s, g) => s + parseFloat(g.hdr.NetTotal   || 0), 0);

  // Count unpaid/active transactions per client (for showing the combined button)
  const unpaidClientCount = (clientId) =>
    hdrList.filter(
      (h) => String(h.ClientID) === String(clientId) && h.Status !== "Paid"
    ).length;

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Transaction Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #000; }
        h2,h3 { text-align: center; margin-bottom: 4px; }
        p  { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #1a3a5c; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
        .section-hdr { background: #e8f0fe; font-weight: bold; font-size: 11px; padding: 4px 8px; }
        .total-row td { font-weight: bold; border-top: 2px solid #1a3a5c; }
        .grand-total td { font-weight: bold; background: #1a3a5c; color: #fff; font-size: 12px; }
        .right { text-align: right; }
        .label { color: #666; font-size: 10px; text-transform: uppercase; }
        .value { font-weight: 600; font-size: 12px; }
        .divider { border: none; border-top: 1px solid #ccc; margin: 8px 0; }
        .info-grid { display: flex; gap: 32px; margin: 10px 0; flex-wrap: wrap; }
        .info-col  { min-width: 120px; }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── Styles ──
  const cellSx = {
    fontSize: "0.82rem", whiteSpace: "nowrap",
    px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider",
  };
  const headerSx = {
    fontWeight: "bold", fontSize: "0.78rem", whiteSpace: "nowrap",
    px: 1.5, py: 1.2, backgroundColor: "action.hover", color: "text.secondary",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "2px solid", borderColor: "divider",
  };
  const dtlCellSx   = { ...cellSx, py: 0.6 };
  const dtlHeaderSx = { ...headerSx, py: 1 };

  const clientName = (id) => {
    const c = clientList.find((x) => String(x.ClientID) === String(id));
    return c ? c.TradeName || c.LNF || id : id;
  };

  const statusColor = (s) =>
    s === "Paid" ? "success" : s === "Posted" ? "primary" : "warning";

  const sameClientCount = (clientId) =>
    hdrList.filter((h) => String(h.ClientID) === String(clientId)).length;

  // ── Receipt DTL table ──
  const ReceiptDtlTable = ({ dtls }) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {["#", "Service", "Rate", "QTY", "Gross", "Disc.", "Net"].map((h) => (
              <TableCell key={h} sx={{
                ...headerSx, py: 0.8,
                backgroundColor: darkMode ? "#1a2a3a" : "#1a3a5c",
                color: "#fff",
              }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dtls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center"
                sx={{ py: 1.5, color: "text.secondary", fontSize: "0.78rem" }}>
                No line items.
              </TableCell>
            </TableRow>
          ) : dtls.map((dtl, i) => (
            <TableRow key={dtl.ID || i} sx={{ backgroundColor: i % 2 === 0 ? "transparent" : "action.hover" }}>
              <TableCell sx={{ ...cellSx, color: "text.disabled", width: 32, textAlign: "center" }}>{i + 1}</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{dtl.ServiceName}</TableCell>
              <TableCell sx={cellSx} align="right">
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(dtl.Rate)}</Typography>
              </TableCell>
              <TableCell sx={{ ...cellSx, textAlign: "center" }}>{dtl.QTY}</TableCell>
              <TableCell sx={cellSx} align="right">
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(dtl.Gross)}</Typography>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(dtl.Discount)}</Typography>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(dtl.Net)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* ── Toolbar ── */}
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptLongIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight="bold">Transaction Records</Typography>
              <Chip
                label={hasFilters
                  ? `${filteredList.length} of ${hdrList.length}`
                  : `${hdrList.length} record${hdrList.length !== 1 ? "s" : ""}`}
                size="small" color="primary" variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            </Box>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpen}>
              New Transaction
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ px: 2, py: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center",
            borderBottom: hasFilters ? "1px solid" : "none", borderColor: "divider" }}>
            <TextField
              placeholder="Search client, particulars..."
              size="small" value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              sx={{ width: 240 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchQuery(""); setPage(0); }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <TextField label="Status" select size="small" sx={{ width: 130 }}
              value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="All">All</MenuItem>
              {["Active", "Posted", "Paid"].map((s) => (
                <MenuItem key={s} value={s}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%",
                      backgroundColor: s === "Paid" ? "success.main" : s === "Posted" ? "primary.main" : "warning.main" }} />
                    {s}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            {hasFilters && (
              <Button variant="outlined" size="small" color="warning" startIcon={<FilterAltOffIcon />}
                onClick={() => { setSearchQuery(""); setStatusFilter("All"); setPage(0); }}>
                Clear Filters
              </Button>
            )}
          </Box>

          {hasFilters && (
            <Box sx={{ px: 2, py: 0.8, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Active filters:</Typography>
              {searchQuery && (
                <Chip label={`Search: "${searchQuery}"`} size="small"
                  onDelete={() => { setSearchQuery(""); setPage(0); }}
                  sx={{ fontSize: "0.7rem", height: 20 }} />
              )}
              {statusFilter !== "All" && (
                <Chip label={`Status: ${statusFilter}`} size="small" color={statusColor(statusFilter)}
                  onDelete={() => { setStatusFilter("All"); setPage(0); }}
                  sx={{ fontSize: "0.7rem", height: 20 }} />
              )}
              <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                — {filteredList.length} result{filteredList.length !== 1 ? "s" : ""} found
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ── Main Table ── */}
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <TableContainer sx={{ overflowX: "auto", maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["#", "Date", "Client", "Particulars", "Gross", "Discount", "Net", "Status", "Actions"].map((h) => (
                    <TableCell key={h} sx={headerSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      {hasFilters ? "No results match your filters." : "No transaction records found."}
                    </TableCell>
                  </TableRow>
                ) : paginatedList.map((row, index) => {
                  // Only show combined button if client has 2+ unpaid transactions
                  const unpaidCount = unpaidClientCount(row.ClientID);
                  return (
                    <TableRow key={row.id} hover sx={{
                      backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                      "&:hover": { backgroundColor: "action.selected" },
                    }}>
                      <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 50 }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={cellSx}>{fmtDate(row.TransactionDate)}</TableCell>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          {clientName(row.ClientID)}
                          {/* ✅ Only show combined chip if there are 2+ unpaid transactions */}
                          {unpaidCount > 1 && (
                            <Chip
                              label={`${unpaidCount} unpaid`}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: "0.62rem", height: 16, cursor: "pointer" }}
                              onClick={() => handleViewCombinedReceipt(row.ClientID)}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx} title={row.Particulars}>
                        <Box sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.Particulars || "—"}
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx} align="right">
                        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>
                          {fmtPHP(row.GrossTotal)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx} align="right">
                        <Typography variant="body2" sx={{ fontFamily: "monospace", color: "error.main" }}>
                          {fmtPHP(row.Discount)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx} align="right">
                        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                          {fmtPHP(row.NetTotal)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Chip label={row.Status || "—"} size="small" color={statusColor(row.Status)} sx={{ fontSize: "0.72rem" }} />
                      </TableCell>
                      <TableCell sx={cellSx} align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <Tooltip title="View Receipt">
                            <IconButton size="small" color="primary" onClick={() => handleViewReceipt(row)}>
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* ✅ Combined receipt action button — only for unpaid */}
                          {unpaidCount > 1 && (
                            <Tooltip title={`Combined Receipt (${unpaidCount} unpaid transactions)`}>
                              <IconButton size="small" color="info" onClick={() => handleViewCombinedReceipt(row.ClientID)}>
                                <ReceiptLongIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]} component="div"
            count={filteredList.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Paper>

        {/* ── Add / Edit Dialog ── */}
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth scroll="paper"
          PaperProps={{ sx: { maxHeight: "95vh", borderRadius: 2 } }}>
          <DialogTitle sx={{
            borderBottom: "1px solid", borderColor: "divider", pb: 1.5,
            backgroundColor: isEdit
              ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.07)
              : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.07),
            display: "flex", alignItems: "center", gap: 1,
          }}>
            {isEdit
              ? <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              : <AddIcon  fontSize="small" sx={{ color: theme.palette.primary.main }} />}
            <Typography variant="subtitle1" fontWeight="bold"
              sx={{ color: isEdit ? theme.palette.warning.main : theme.palette.primary.main }}>
              {isEdit ? "Edit Transaction" : "New Transaction"}
            </Typography>
            {isEdit && (
              <Chip label={`Record ID ${hdrForm.id}`} size="small" color="warning"
                variant="outlined" sx={{ fontSize: "0.7rem", height: 20, ml: 1 }} />
            )}
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary" }}>
                  Transaction Header
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker label="Transaction Date" value={hdrForm.transactiondate}
                  onChange={(v) => hdrChange("transactiondate", v)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Client" select fullWidth size="small"
                  value={hdrForm.clientid} onChange={(e) => hdrChange("clientid", e.target.value)}>
                  {clientList.map((c) => (
                    <MenuItem key={c.ClientID} value={c.ClientID}>
                      {c.TradeName || c.LNF || c.ClientID}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Status" select fullWidth size="small"
                  value={hdrForm.status} onChange={(e) => hdrChange("status", e.target.value)}>
                  {["Active", "Posted", "Paid"].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Particulars / Explanation" fullWidth size="small" multiline rows={2}
                  value={hdrForm.particulars} onChange={(e) => hdrChange("particulars", e.target.value)} />
              </Grid>

              {/* DTL Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1.5 }}>
                  Service Line Items
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid", borderColor: "divider",
                    backgroundColor: dtlEdit
                      ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.07)
                      : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.07),
                    display: "flex", alignItems: "center", gap: 1 }}>
                    {dtlEdit
                      ? <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                      : <AddIcon  fontSize="small" sx={{ color: theme.palette.primary.main }} />}
                    <Typography variant="caption" fontWeight="bold"
                      sx={{ color: dtlEdit ? theme.palette.warning.main : theme.palette.primary.main }}>
                      {dtlEdit ? "Edit Line Item" : "Add Line Item"}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={1.5} alignItems="flex-end">
                      <Grid item xs={12} sm={3}>
                        <TextField label="Service" select fullWidth size="small"
                          value={dtlForm.serviceid}
                          onChange={(e) => dtlChange("serviceid", e.target.value)}>
                          {serviceList.map((s) => (
                            <MenuItem key={s.ServiceID} value={String(s.ServiceID)}>
                              {s.ServiceName}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField label="Service Name" fullWidth size="small"
                          value={dtlForm.servicename}
                          onChange={(e) => dtlChange("servicename", e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField label="Rate (₱)" fullWidth size="small" type="number"
                          value={dtlForm.rate} onChange={(e) => dtlChange("rate", e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <TextField label="QTY" fullWidth size="small" type="number"
                          inputProps={{ min: 1, step: 1 }}
                          value={dtlForm.qty} onChange={(e) => dtlChange("qty", e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField label="Gross (₱)" fullWidth size="small" type="number"
                          value={dtlForm.gross} InputProps={{ readOnly: true }} />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField label="Discount (₱)" fullWidth size="small" type="number"
                          value={dtlForm.discount} onChange={(e) => dtlChange("discount", e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField label="Net (₱)" fullWidth size="small" type="number"
                          value={dtlForm.net} InputProps={{ readOnly: true }} />
                      </Grid>
                      <Grid item xs={6} sm={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        {dtlEdit && (
                          <Button size="small" variant="outlined"
                            onClick={() => { setDtlForm(emptyDtl); setDtlEdit(false); }}>
                            Cancel
                          </Button>
                        )}
                        <Button size="small" variant="contained"
                          color={dtlEdit ? "warning" : "primary"}
                          startIcon={dtlEdit ? <EditIcon /> : <AddIcon />}
                          onClick={addDtlRow}>
                          {dtlEdit ? "Update Line" : "Add Line"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {["#", "Service", "Service Name", "Rate", "QTY", "Gross", "Discount", "Net", ""].map((h) => (
                            <TableCell key={h} sx={dtlHeaderSx}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dtlRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 3, color: "text.secondary", fontSize: "0.8rem" }}>
                              No line items added yet.
                            </TableCell>
                          </TableRow>
                        ) : dtlRows.map((row, i) => (
                          <TableRow key={row._key} hover sx={{ backgroundColor: i % 2 === 0 ? "transparent" : "action.hover" }}>
                            <TableCell sx={{ ...dtlCellSx, color: "text.disabled", width: 40, textAlign: "center" }}>{i + 1}</TableCell>
                            <TableCell sx={dtlCellSx}>
                              <Chip label={row.serviceid || row.ServiceID || "—"} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                            </TableCell>
                            <TableCell sx={{ ...dtlCellSx, fontWeight: 600 }}>{row.servicename || row.ServiceName || "—"}</TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.rate || row.Rate)}</Typography>
                            </TableCell>
                            <TableCell sx={{ ...dtlCellSx, textAlign: "center" }}>{row.qty || row.QTY}</TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.gross || row.Gross)}</Typography>
                            </TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(row.discount || row.Discount)}</Typography>
                            </TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(row.net || row.Net)}</Typography>
                            </TableCell>
                            <TableCell sx={dtlCellSx} align="center">
                              <Box sx={{ display: "flex", gap: 0.3 }}>
                                <Tooltip title="Edit line">
                                  <IconButton size="small" onClick={() => editDtlRow(row)}>
                                    <EditIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove line">
                                  <IconButton size="small" color="error" onClick={() => removeDtlRow(row)}>
                                    <DeleteIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {dtlRows.length > 0 && (
                          <TableRow sx={{ backgroundColor: darkMode ? alpha("#fff", 0.04) : alpha("#000", 0.03) }}>
                            <TableCell colSpan={5} sx={{ ...dtlCellSx, fontWeight: "bold", fontSize: "0.78rem" }}>TOTALS</TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace" }}>{fmtPHP(hdrForm.grosstotal)}</Typography>
                            </TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(hdrForm.discount)}</Typography>
                            </TableCell>
                            <TableCell sx={dtlCellSx} align="right">
                              <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(hdrForm.nettotal)}</Typography>
                            </TableCell>
                            <TableCell sx={dtlCellSx} />
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Summary */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, minWidth: 280 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mb: 1.5 }}>
                      Transaction Summary
                    </Typography>
                    {[
                      { label: "Gross Total", value: hdrForm.grosstotal, color: "text.primary" },
                      { label: "Discount",    value: hdrForm.discount,   color: "error.main" },
                      { label: "Net Total",   value: hdrForm.nettotal,   color: "success.main" },
                    ].map(({ label, value, color }) => (
                      <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color }}>{fmtPHP(value)}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle2" fontWeight="bold">NET TOTAL</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                        {fmtPHP(hdrForm.nettotal)}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2, gap: 1 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmitHdr}>
              {isEdit ? "Update" : "Save Transaction"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Receipt Dialog (Single + Combined) ── */}
        <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{
            borderBottom: "1px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {receiptMode === "combined"
                ? <ReceiptLongIcon fontSize="small" color="info" />
                : <ReceiptIcon fontSize="small" color="primary" />}
              <Typography variant="subtitle1" fontWeight="bold">
                {receiptMode === "combined"
                  ? `Combined Receipt — ${receiptClient?.name}`
                  : "Transaction Receipt"}
              </Typography>
              {receiptMode === "combined" && (
                <Chip
                  label={`${receiptGroups.length} unpaid transaction${receiptGroups.length !== 1 ? "s" : ""}`}
                  size="small" color="info" variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {/* ✅ Only show Combined button from single view if client has unpaid transactions */}
              {receiptMode === "single" && unpaidClientCount(receiptData?.ClientID) > 1 && (
                <Tooltip title="View combined receipt for all unpaid transactions of this client">
                  <Button size="small" variant="outlined" color="info"
                    startIcon={<ReceiptLongIcon fontSize="small" />}
                    onClick={() => handleViewCombinedReceipt(receiptData.ClientID)}
                    sx={{ fontSize: "0.72rem" }}>
                    Combined
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="Print Receipt">
                <IconButton size="small" onClick={handlePrint}><PrintIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box ref={printRef}>

              {/* ── SINGLE RECEIPT ── */}
              {receiptMode === "single" && receiptData && (
                <>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">OFFICIAL RECEIPT</Typography>
                    <Typography variant="caption" color="text.secondary">Transaction Record</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[
                      { label: "Transaction ID", value: `#${receiptData.ID}` },
                      { label: "Date",           value: fmtDate(receiptData.TransactionDate) },
                      { label: "Client",         value: clientName(receiptData.ClientID) },
                      { label: "Status",         value: receiptData.Status },
                    ].map(({ label, value }) => (
                      <Grid item xs={6} key={label}>
                        <Typography variant="caption" color="text.secondary"
                          sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {label === "Status"
                            ? <Chip label={value} size="small" color={statusColor(value)} sx={{ fontSize: "0.7rem" }} />
                            : value}
                        </Typography>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                        Particulars
                      </Typography>
                      <Typography variant="body2">{receiptData.Particulars || "—"}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="caption" fontWeight="bold" color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 1 }}>
                    Service Details
                  </Typography>
                  <ReceiptDtlTable dtls={receiptDtls} />
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                    <Divider sx={{ width: "100%", mb: 1 }} />
                    {[
                      { label: "Gross Total", value: receiptData.GrossTotal, color: "text.primary" },
                      { label: "Discount",    value: receiptData.Discount,   color: "error.main" },
                    ].map(({ label, value, color }) => (
                      <Box key={label} sx={{ display: "flex", justifyContent: "space-between", width: 260 }}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", color }}>{fmtPHP(value)}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ width: 260, my: 0.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: 260 }}>
                      <Typography variant="subtitle2" fontWeight="bold">NET TOTAL</Typography>
                      <Typography variant="subtitle2" fontWeight="bold"
                        sx={{ fontFamily: "monospace", color: "success.main" }}>
                        {fmtPHP(receiptData.NetTotal)}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1.5 }} />
                  <Typography variant="caption" color="text.secondary"
                    sx={{ display: "block", textAlign: "center", fontStyle: "italic" }}>
                    This is an official transaction record. Thank you.
                  </Typography>
                </>
              )}

              {/* ── COMBINED RECEIPT ── */}
              {receiptMode === "combined" && (
                <>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">COMBINED OFFICIAL RECEIPT</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{receiptClient?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unpaid / Partial Transactions — {receiptGroups.length} record{receiptGroups.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {receiptGroups.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading transactions… (or all transactions are fully paid)
                      </Typography>
                    </Box>
                  ) : (
                    receiptGroups.map((group, gi) => (
                      <Box key={group.hdr.ID || gi} sx={{ mb: 3 }}>
                        <Box sx={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          flexWrap: "wrap", gap: 1,
                          px: 1.5, py: 1,
                          backgroundColor: darkMode ? alpha("#fff", 0.05) : alpha("#1a3a5c", 0.07),
                          borderRadius: 1, mb: 1,
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary" }}>
                              TXN #{group.hdr.ID}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {fmtDate(group.hdr.TransactionDate)}
                            </Typography>
                            <Chip label={group.hdr.Status || "—"} size="small"
                              color={statusColor(group.hdr.Status)} sx={{ fontSize: "0.65rem", height: 18 }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", maxWidth: 300,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {group.hdr.Particulars || "—"}
                          </Typography>
                        </Box>

                        <ReceiptDtlTable dtls={group.dtls} />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, gap: 3, flexWrap: "wrap", pr: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Gross: <strong style={{ fontFamily: "monospace" }}>{fmtPHP(group.hdr.GrossTotal)}</strong>
                          </Typography>
                          <Typography variant="caption" color="error.main">
                            Discount: <strong style={{ fontFamily: "monospace" }}>{fmtPHP(group.hdr.Discount)}</strong>
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            Net: <strong style={{ fontFamily: "monospace" }}>{fmtPHP(group.hdr.NetTotal)}</strong>
                          </Typography>
                        </Box>

                        {gi < receiptGroups.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))
                  )}

                  {receiptGroups.length > 0 && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{
                        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5,
                        backgroundColor: darkMode ? alpha("#fff", 0.04) : alpha("#1a3a5c", 0.05),
                        borderRadius: 2, p: 2,
                      }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", alignSelf: "flex-start" }}>
                          GRAND TOTAL — {receiptClient?.name}
                        </Typography>
                        <Divider sx={{ width: "100%", my: 0.5 }} />
                        {[
                          { label: "Total Gross",    value: combinedGross,    color: "text.primary" },
                          { label: "Total Discount", value: combinedDiscount, color: "error.main" },
                        ].map(({ label, value, color }) => (
                          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", color }}>{fmtPHP(value)}</Typography>
                          </Box>
                        ))}
                        <Divider sx={{ width: 300, my: 0.5 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                          <Typography variant="subtitle1" fontWeight="bold">TOTAL NET</Typography>
                          <Typography variant="subtitle1" fontWeight="bold"
                            sx={{ fontFamily: "monospace", color: "success.main" }}>
                            {fmtPHP(combinedNet)}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mt: 2, mb: 1.5 }} />
                      <Typography variant="caption" color="text.secondary"
                        sx={{ display: "block", textAlign: "center", fontStyle: "italic" }}>
                        This combined receipt covers all outstanding transactions for {receiptClient?.name}. Thank you.
                      </Typography>
                    </>
                  )}
                </>
              )}

            </Box>
          </DialogContent>

          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2, gap: 1 }}>
            <Button onClick={() => setReceiptOpen(false)}>Close</Button>
            {receiptMode === "single" && unpaidClientCount(receiptData?.ClientID) > 1 && (
              <Button variant="outlined" color="info"
                startIcon={<ReceiptLongIcon />}
                onClick={() => handleViewCombinedReceipt(receiptData.ClientID)}>
                View Combined Receipt
              </Button>
            )}
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
              Print Receipt
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete Confirm ── */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })}
          PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>Confirm Delete</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>
              This will permanently delete the transaction and all its line items. This cannot be undone.
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