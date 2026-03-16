import React, { useState, useRef } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Typography, IconButton, Chip, Tooltip,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, InputAdornment, Divider, alpha, useTheme,
  ListSubheader,
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
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "../../modules/context/AuthContext";

const emptyHdr = {
  id: "", transactiondate: null, clientid: "", particulars: "",
  grosstotal: 0, discount: 0, nettotal: 0, status: "Active",
};
const emptyDtl = {
  id: "", serviceid: "", servicename: "", rate: "", qty: 1,
  gross: 0, discount: 0, net: 0,
};
const emptyClientForm = {
  id: "", clientid: "", lnf: "", type: "", tradename: "",
  dateregistered: null, dateexpiration: null,
  dticertificationno: "", dtiexpirationdate: null,
  secidno: "", secexpirationdate: null,
  cdacertno: "", efpsaccount: "", taxclearancecertno: "",
  taxclearanceexpiration: null, philgeps: "", philgepscertno: "",
  philgepsexpiration: null, retentiontype: "", status: "Active",
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
    if (lower.includes(ok.toLowerCase()) && obj[ok] !== undefined && obj[ok] !== null && obj[ok] !== "") return obj[ok];
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

// ─── Searchable Select ────────────────────────────────────────────────────────
// Renders a MUI TextField[select] with a sticky search box as first item
function SearchableSelect({ label, value, onChange, options, size = "small", fullWidth = true, children, ...rest }) {
  const [search, setSearch] = React.useState("");

  const handleClose = () => setSearch("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TextField
      label={label}
      select
      fullWidth={fullWidth}
      size={size}
      value={value}
      onChange={onChange}
      SelectProps={{
        onClose: handleClose,
        MenuProps: {
          autoFocus: false,
          PaperProps: { sx: { maxHeight: 320 } },
        },
      }}
      {...rest}
    >
      {/* Sticky search input inside the dropdown */}
      <ListSubheader sx={{ p: 0, lineHeight: "normal", backgroundColor: "background.paper" }}>
        <TextField
          size="small"
          autoFocus
          placeholder="Search…"
          fullWidth
          value={search}
          onChange={(e) => { e.stopPropagation(); setSearch(e.target.value); }}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSearch(""); }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ px: 1, pt: 1, pb: 0.5 }}
        />
      </ListSubheader>

      {filtered.length === 0 ? (
        <MenuItem disabled sx={{ fontSize: "0.8rem", color: "text.disabled" }}>No results found</MenuItem>
      ) : (
        filtered.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.85rem" }}>
            {o.label}
          </MenuItem>
        ))
      )}
    </TextField>
  );
}

export default function TransactionInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const printRef = useRef();
  const { accessToken } = useContext(AuthContext);

  const { data: hdrRaw }      = hookContainer("/selecttransactionhdr");
  const { data: clientsRaw }  = hookContainer("/selectclientss");
  const { data: servicesRaw } = hookContainer("/selectserviceslist");

  const hdrList     = Array.isArray(hdrRaw?.data)      ? hdrRaw.data.map((r, i) => ({ ...r, id: r.ID || i })) : [];
  const clientList  = Array.isArray(clientsRaw?.data)  ? clientsRaw.data  : [];
  const serviceList = Array.isArray(servicesRaw?.data) ? servicesRaw.data : [];

  // Transaction state
  const [hdrForm, setHdrForm] = useState(emptyHdr);
  const [isEdit, setIsEdit]   = useState(false);
  const [open, setOpen]       = useState(false);
  const [dtlRows, setDtlRows] = useState([]);
  const [dtlForm, setDtlForm] = useState(emptyDtl);
  const [dtlEdit, setDtlEdit] = useState(false);

  // Table / filter state
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Receipt state
  const [receiptOpen, setReceiptOpen]     = useState(false);
  const [receiptMode, setReceiptMode]     = useState("single");
  const [receiptClient, setReceiptClient] = useState(null);
  const [receiptData, setReceiptData]     = useState(null);
  const [receiptDtls, setReceiptDtls]     = useState([]);
  const [receiptGroups, setReceiptGroups] = useState([]);

  // Add Client state
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientForm, setClientForm]             = useState(emptyClientForm);

  // Dropdown options for SearchableSelect
  const clientOptions = clientList.map((c) => ({
    value: c.ClientID,
    label: c.TradeName || c.LNF || c.ClientID,
  }));
  const serviceOptions = serviceList.map((s) => ({
    value: String(s.ServiceID),
    label: s.ServiceName,
  }));

  // Filtered list
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
  const paginatedList = filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Transaction HDR helpers
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
      transactiondate: hdrForm.transactiondate ? dayjs(hdrForm.transactiondate).format("YYYY-MM-DD") : null,
    };
    try {
      let hdrId = hdrForm.id;
      if (isEdit) {
        await http.post("/updatetransactionhdr", payload);
        toast.success("Transaction updated!");
      } else {
        const res = await http.post("/posttransactionhdr", payload);
        hdrId = res?.data?.data?.id;
        if (!hdrId) { toast.error("Failed to get transaction ID. Line items not saved."); return; }
        toast.success("Transaction saved!");
      }
      for (const dtl of dtlRows) {
        if (dtl._new)          await http.post("/posttransactiondtl",   { ...dtl, transactionhdrid: hdrId });
        else if (dtl._updated) await http.post("/updatetransactiondtl", dtl);
      }
      queryClient.invalidateQueries("/selecttransactionhdr");
      handleClose();
    } catch (err) {
      console.error("handleSubmitHdr error:", err);
      toast.error("Failed to save transaction.");
    }
  };

  const handleDeleteConfirm = (id) => setDeleteConfirm({ open: true, id });
  const handleDelete = async () => {
    const deletedBy = accessToken?.username || accessToken?.name || accessToken?.EmployeeName || "system";
    try {
      await http.delete(`/deletetransactiondtlbyhdr?hdrid=${deleteConfirm.id}`, { data: { deletedBy } });
      await http.delete(`/deletetransactionhdr?id=${deleteConfirm.id}`, { data: { deletedBy } });
      toast.success("Transaction deleted.");
      queryClient.invalidateQueries("/selecttransactionhdr");
      setDeleteConfirm({ open: false, id: null });
    } catch { toast.error("Failed to delete."); }
  };

  // DTL helpers
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
      const updated = dtlRows.map((r) => r._key === dtlForm._key ? { ...dtlForm, _updated: !dtlForm._new } : r);
      setDtlRows(updated); computeHdrTotals(updated);
    } else {
      const updated = [...dtlRows, { ...dtlForm, _key: Date.now(), _new: true }];
      setDtlRows(updated); computeHdrTotals(updated);
    }
    setDtlForm(emptyDtl); setDtlEdit(false);
  };
  const editDtlRow = (row) => { setDtlForm(row); setDtlEdit(true); };
  const removeDtlRow = async (row) => {
    if (row.ID && !row._new) { try { await http.delete(`/deletetransactiondtl?id=${row.ID}`); } catch { /**/ } }
    const updated = dtlRows.filter((r) => r._key !== row._key);
    setDtlRows(updated); computeHdrTotals(updated);
  };

  // Add Client helpers
  const handleClientDialogOpen  = () => { setClientForm(emptyClientForm); setClientDialogOpen(true); };
  const handleClientDialogClose = () => { setClientDialogOpen(false); setClientForm(emptyClientForm); };
  const handleClientChange = (field, value) => setClientForm((prev) => ({ ...prev, [field]: value }));
  const fmtDay = (val) => (val ? dayjs(val).format("YYYY-MM-DD") : null);
  const handleClientSubmit = async () => {
    const payload = {
      ...clientForm,
      dateregistered:         fmtDay(clientForm.dateregistered),
      dateexpiration:         fmtDay(clientForm.dateexpiration),
      dtiexpirationdate:      fmtDay(clientForm.dtiexpirationdate),
      secexpirationdate:      fmtDay(clientForm.secexpirationdate),
      taxclearanceexpiration: fmtDay(clientForm.taxclearanceexpiration),
      philgepsexpiration:     fmtDay(clientForm.philgepsexpiration),
    };
    try {
      await http.post("/postclientss", payload);
      toast.success("Client saved successfully!");
      queryClient.invalidateQueries("/selectclientss");
      handleClientDialogClose();
    } catch { toast.error("Failed to save client."); }
  };

  // Receipt helpers
  const fetchDtlForHdr = async (hdrId) => {
    try {
      const res = await http.get(`/selecttransactiondtlbyhdr?hdrid=${hdrId}`);
      const raw = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      return raw.map(normalizeDtl);
    } catch { return []; }
  };
  const handleViewReceipt = async (row) => {
    setReceiptClient({ id: row.ClientID, name: clientName(row.ClientID) });
    setReceiptData(row); setReceiptDtls([]); setReceiptGroups([]); setReceiptMode("single");
    setReceiptDtls(await fetchDtlForHdr(row.ID)); setReceiptOpen(true);
  };
  const handleViewCombinedReceipt = async (clientId) => {
    setReceiptClient({ id: clientId, name: clientName(clientId) });
    setReceiptMode("combined"); setReceiptGroups([]); setReceiptOpen(true);
    const clientHdrs = hdrList.filter((h) => String(h.ClientID) === String(clientId) && h.Status !== "Paid");
    setReceiptGroups(await Promise.all(clientHdrs.map(async (hdr) => ({ hdr, dtls: await fetchDtlForHdr(hdr.ID) }))));
  };

  const combinedGross    = receiptGroups.reduce((s, g) => s + parseFloat(g.hdr.GrossTotal || 0), 0);
  const combinedDiscount = receiptGroups.reduce((s, g) => s + parseFloat(g.hdr.Discount   || 0), 0);
  const combinedNet      = receiptGroups.reduce((s, g) => s + parseFloat(g.hdr.NetTotal   || 0), 0);
  const unpaidClientCount = (clientId) =>
    hdrList.filter((h) => String(h.ClientID) === String(clientId) && h.Status !== "Paid").length;

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Receipt</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th{background:#1a3a5c;color:#fff;padding:6px 8px;font-size:11px}
      td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:11px}</style>
      </head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  // Style helpers
  const cellSx = { fontSize: "0.82rem", whiteSpace: "nowrap", px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" };
  const headerSx = { fontWeight: "bold", fontSize: "0.78rem", whiteSpace: "nowrap", px: 1.5, py: 1.2, backgroundColor: "action.hover", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid", borderColor: "divider" };
  const dtlCellSx   = { ...cellSx, py: 0.6 };
  const dtlHeaderSx = { ...headerSx, py: 1 };

  const clientName = (id) => {
    const c = clientList.find((x) => String(x.ClientID) === String(id));
    return c ? c.TradeName || c.LNF || id : id;
  };
  const statusColor = (s) => s === "Paid" ? "success" : s === "Posted" ? "primary" : "warning";

  const ReceiptDtlTable = ({ dtls }) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {["#", "Service", "Rate", "QTY", "Gross", "Disc.", "Net"].map((h) => (
              <TableCell key={h} sx={{ ...headerSx, py: 0.8, backgroundColor: darkMode ? "#1a2a3a" : "#1a3a5c", color: "#fff" }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dtls.length === 0 ? (
            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 1.5, color: "text.secondary", fontSize: "0.78rem" }}>No line items.</TableCell></TableRow>
          ) : dtls.map((dtl, i) => (
            <TableRow key={dtl.ID || i} sx={{ backgroundColor: i % 2 === 0 ? "transparent" : "action.hover" }}>
              <TableCell sx={{ ...cellSx, color: "text.disabled", width: 32, textAlign: "center" }}>{i + 1}</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{dtl.ServiceName}</TableCell>
              <TableCell sx={cellSx} align="right"><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(dtl.Rate)}</Typography></TableCell>
              <TableCell sx={{ ...cellSx, textAlign: "center" }}>{dtl.QTY}</TableCell>
              <TableCell sx={cellSx} align="right"><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(dtl.Gross)}</Typography></TableCell>
              <TableCell sx={cellSx} align="right"><Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(dtl.Discount)}</Typography></TableCell>
              <TableCell sx={cellSx} align="right"><Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(dtl.Net)}</Typography></TableCell>
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
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptLongIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight="bold">Billing/SOA Records</Typography>
              <Chip
                label={hasFilters ? `${filteredList.length} of ${hdrList.length}` : `${hdrList.length} record${hdrList.length !== 1 ? "s" : ""}`}
                size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<PeopleAltIcon />} onClick={handleClientDialogOpen} color="success">Add Client</Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpen}>New Billing</Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ px: 2, py: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", borderBottom: hasFilters ? "1px solid" : "none", borderColor: "divider" }}>
            <TextField
              placeholder="Search client, particulars..." size="small" value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} sx={{ width: 240 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchQuery(""); setPage(0); }}><ClearIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <TextField label="Status" select size="small" sx={{ width: 130 }} value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="All">All</MenuItem>
              {["Active", "Posted", "Paid"].map((s) => (
                <MenuItem key={s} value={s}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s === "Paid" ? "success.main" : s === "Posted" ? "primary.main" : "warning.main" }} />{s}
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
              {searchQuery && <Chip label={`Search: "${searchQuery}"`} size="small" onDelete={() => { setSearchQuery(""); setPage(0); }} sx={{ fontSize: "0.7rem", height: 20 }} />}
              {statusFilter !== "All" && <Chip label={`Status: ${statusFilter}`} size="small" color={statusColor(statusFilter)} onDelete={() => { setStatusFilter("All"); setPage(0); }} sx={{ fontSize: "0.7rem", height: 20 }} />}
              <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>— {filteredList.length} result{filteredList.length !== 1 ? "s" : ""} found</Typography>
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
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>{hasFilters ? "No results match your filters." : "No transaction records found."}</TableCell></TableRow>
                ) : paginatedList.map((row, index) => {
                  const unpaidCount = unpaidClientCount(row.ClientID);
                  return (
                    <TableRow key={row.id} hover sx={{ backgroundColor: index % 2 === 0 ? "transparent" : "action.hover", "&:hover": { backgroundColor: "action.selected" } }}>
                      <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 50 }}>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell sx={cellSx}>{fmtDate(row.TransactionDate)}</TableCell>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          {clientName(row.ClientID)}
                          {unpaidCount > 1 && (
                            <Chip label={`${unpaidCount} unpaid`} size="small" color="info" variant="outlined"
                              sx={{ fontSize: "0.62rem", height: 16, cursor: "pointer" }}
                              onClick={() => handleViewCombinedReceipt(row.ClientID)} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx} title={row.Particulars}>
                        <Box sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.Particulars || "—"}</Box>
                      </TableCell>
                      <TableCell sx={cellSx} align="right"><Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.GrossTotal)}</Typography></TableCell>
                      <TableCell sx={cellSx} align="right"><Typography variant="body2" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(row.Discount)}</Typography></TableCell>
                      <TableCell sx={cellSx} align="right"><Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(row.NetTotal)}</Typography></TableCell>
                      <TableCell sx={cellSx}><Chip label={row.Status || "—"} size="small" color={statusColor(row.Status)} sx={{ fontSize: "0.72rem" }} /></TableCell>
                      <TableCell sx={cellSx} align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <Tooltip title="View Receipt"><IconButton size="small" color="primary" onClick={() => handleViewReceipt(row)}><ReceiptIcon fontSize="small" /></IconButton></Tooltip>
                          {unpaidCount > 1 && (
                            <Tooltip title={`Combined Receipt (${unpaidCount} unpaid transactions)`}>
                              <IconButton size="small" color="info" onClick={() => handleViewCombinedReceipt(row.ClientID)}><ReceiptLongIcon fontSize="small" /></IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row.ID)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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

        {/* ══════════════════════════════════════════════════
            ADD CLIENT DIALOG
        ══════════════════════════════════════════════════ */}
        <Dialog open={clientDialogOpen} onClose={handleClientDialogClose} maxWidth="md" fullWidth scroll="paper"
          PaperProps={{ sx: { maxHeight: "90vh", borderRadius: 2 } }}>
          <DialogTitle sx={{
            borderBottom: "1px solid", borderColor: "divider", pb: 1.5,
            backgroundColor: alpha(theme.palette.success.main, darkMode ? 0.15 : 0.07),
            display: "flex", alignItems: "center", gap: 1,
          }}>
            <PeopleAltIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
            <Typography component="span" variant="subtitle1" fontWeight="bold" sx={{ color: theme.palette.success.main }}>
              Add New Client
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary" }}>Basic Information</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="Client ID" fullWidth size="small" value={clientForm.clientid} onChange={(e) => handleClientChange("clientid", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="LNF" fullWidth size="small" value={clientForm.lnf} onChange={(e) => handleClientChange("lnf", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Type" select fullWidth size="small" value={clientForm.type} onChange={(e) => handleClientChange("type", e.target.value)}>
                  {["Corporation", "Sole Proprietorship", "COOP"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="Trade Name" fullWidth size="small" value={clientForm.tradename} onChange={(e) => handleClientChange("tradename", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Date Registered" value={clientForm.dateregistered} onChange={(val) => handleClientChange("dateregistered", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Date Expiration" value={clientForm.dateexpiration} onChange={(val) => handleClientChange("dateexpiration", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>DTI Details</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="DTI Certification No." fullWidth size="small" value={clientForm.dticertificationno} onChange={(e) => handleClientChange("dticertificationno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="DTI Expiration Date" value={clientForm.dtiexpirationdate} onChange={(val) => handleClientChange("dtiexpirationdate", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>SEC Details</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="SEC ID No." fullWidth size="small" value={clientForm.secidno} onChange={(e) => handleClientChange("secidno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="SEC Expiration Date" value={clientForm.secexpirationdate} onChange={(val) => handleClientChange("secexpirationdate", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>CDA Details</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="CDA Cert No." fullWidth size="small" value={clientForm.cdacertno} onChange={(e) => handleClientChange("cdacertno", e.target.value)} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>Tax Clearance</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField label="Tax Clearance Cert No." fullWidth size="small" value={clientForm.taxclearancecertno} onChange={(e) => handleClientChange("taxclearancecertno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Tax Clearance Expiration" value={clientForm.taxclearanceexpiration} onChange={(val) => handleClientChange("taxclearanceexpiration", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>PhilGEPS Details</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="PhilGEPS" select fullWidth size="small" value={clientForm.philgeps} onChange={(e) => handleClientChange("philgeps", e.target.value)}>
                  {["Yes", "No"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="PhilGEPS Cert No." fullWidth size="small" value={clientForm.philgepscertno} onChange={(e) => handleClientChange("philgepscertno", e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="PhilGEPS Expiration" value={clientForm.philgepsexpiration} onChange={(val) => handleClientChange("philgepsexpiration", val)} slotProps={{ textField: { fullWidth: true, size: "small" } }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>Other Details</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="EFPS Account" select fullWidth size="small" value={clientForm.efpsaccount} onChange={(e) => handleClientChange("efpsaccount", e.target.value)}>
                  {["Yes", "No"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Retention Type" select fullWidth size="small" value={clientForm.retentiontype} onChange={(e) => handleClientChange("retentiontype", e.target.value)}>
                  {["Monthly", "Quarterly", "Semi Annual"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Status" select fullWidth size="small" value={clientForm.status} onChange={(e) => handleClientChange("status", e.target.value)}>
                  {["Active", "Inactive"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2, gap: 1 }}>
            <Button onClick={handleClientDialogClose}>Cancel</Button>
            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleClientSubmit}>Save Client</Button>
          </DialogActions>
        </Dialog>

        {/* ══════════════════════════════════════════════════
            ADD / EDIT TRANSACTION DIALOG
        ══════════════════════════════════════════════════ */}
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth scroll="paper"
          PaperProps={{ sx: { maxHeight: "95vh", borderRadius: 2.5, overflow: "hidden" } }}>

          <DialogTitle sx={{
            borderBottom: "1px solid", borderColor: "divider",
            py: 1.5, px: 2.5,
            backgroundColor: isEdit
              ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.06)
              : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.06),
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: isEdit ? alpha(theme.palette.warning.main, 0.15) : alpha(theme.palette.primary.main, 0.12),
              }}>
                {isEdit
                  ? <EditIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                  : <AddIcon  sx={{ fontSize: 16, color: theme.palette.primary.main }} />}
              </Box>
              <Typography component="span" variant="subtitle1" fontWeight="bold"
                sx={{ color: isEdit ? theme.palette.warning.main : theme.palette.primary.main }}>
                {isEdit ? "Edit Transaction" : "New Billing"}
              </Typography>
              {isEdit && (
                <Chip label={`ID #${hdrForm.id}`} size="small" color="warning" variant="outlined"
                  sx={{ fontSize: "0.68rem", height: 20 }} />
              )}
            </Box>
            <Button
              variant="outlined" size="small" color="success"
              startIcon={<PeopleAltIcon sx={{ fontSize: "14px !important" }} />}
              onClick={handleClientDialogOpen}
              sx={{ fontSize: "0.72rem", height: 30, px: 1.5, borderRadius: "7px", textTransform: "none", fontWeight: 600 }}
            >
              Add Client
            </Button>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Box sx={{ width: 3, height: 16, borderRadius: 2, backgroundColor: isEdit ? "warning.main" : "primary.main" }} />
                  <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.7rem" }}>
                    Billing/SOA Header
                  </Typography>
                </Box>
              </Grid>

              {/* Row 1: Date | Client (searchable) | Status */}
              <Grid item xs={12} sm={4}>
                <DatePicker label="Billing Date" value={hdrForm.transactiondate} onChange={(v) => hdrChange("transactiondate", v)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                {/* ── Searchable Client dropdown ── */}
                <SearchableSelect
                  label="Client"
                  value={hdrForm.clientid}
                  onChange={(e) => hdrChange("clientid", e.target.value)}
                  options={clientOptions}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Status" select fullWidth size="small" value={hdrForm.status} onChange={(e) => hdrChange("status", e.target.value)}>
                  {["Active", "Posted", "Paid"].map((s) => (
                    <MenuItem key={s} value={s}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: s === "Paid" ? "success.main" : s === "Posted" ? "primary.main" : "warning.main" }} />
                        {s}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField label="Particulars / Explanation" fullWidth size="small" multiline rows={2}
                  value={hdrForm.particulars} onChange={(e) => hdrChange("particulars", e.target.value)} />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ mt: 0.5, mb: 1.5 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 3, height: 16, borderRadius: 2, backgroundColor: dtlEdit ? "warning.main" : "primary.main" }} />
                  <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.7rem" }}>
                    Service Line Items
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid", borderColor: "divider",
                    backgroundColor: dtlEdit ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.07) : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.07),
                    display: "flex", alignItems: "center", gap: 1 }}>
                    {dtlEdit ? <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} /> : <AddIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
                    <Typography variant="caption" fontWeight="bold" sx={{ color: dtlEdit ? theme.palette.warning.main : theme.palette.primary.main }}>
                      {dtlEdit ? "Edit Line Item" : "Add Line Item"}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={1.5} alignItems="flex-end">
                      <Grid item xs={12} sm={3}>
                        {/* ── Searchable Service dropdown ── */}
                        <SearchableSelect
                          label="Service"
                          value={dtlForm.serviceid}
                          onChange={(e) => dtlChange("serviceid", e.target.value)}
                          options={serviceOptions}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}><TextField label="Service Name" fullWidth size="small" value={dtlForm.servicename} onChange={(e) => dtlChange("servicename", e.target.value)} /></Grid>
                      <Grid item xs={6} sm={1.5}><TextField label="Rate (₱)" fullWidth size="small" type="number" value={dtlForm.rate} onChange={(e) => dtlChange("rate", e.target.value)} /></Grid>
                      <Grid item xs={6} sm={1}><TextField label="QTY" fullWidth size="small" type="number" inputProps={{ min: 1, step: 1 }} value={dtlForm.qty} onChange={(e) => dtlChange("qty", e.target.value)} /></Grid>
                      <Grid item xs={6} sm={1.5}><TextField label="Gross (₱)" fullWidth size="small" type="number" value={dtlForm.gross} InputProps={{ readOnly: true }} /></Grid>
                      <Grid item xs={6} sm={1.5}><TextField label="Discount (₱)" fullWidth size="small" type="number" value={dtlForm.discount} onChange={(e) => dtlChange("discount", e.target.value)} /></Grid>
                      <Grid item xs={6} sm={1.5}><TextField label="Net (₱)" fullWidth size="small" type="number" value={dtlForm.net} InputProps={{ readOnly: true }} /></Grid>
                      <Grid item xs={6} sm={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        {dtlEdit && <Button size="small" variant="outlined" onClick={() => { setDtlForm(emptyDtl); setDtlEdit(false); }}>Cancel</Button>}
                        <Button size="small" variant="contained" color={dtlEdit ? "warning" : "primary"} startIcon={dtlEdit ? <EditIcon /> : <AddIcon />} onClick={addDtlRow}>{dtlEdit ? "Update Line" : "Add Line"}</Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>{["#", "Service", "Service Name", "Rate", "QTY", "Gross", "Discount", "Net", ""].map((h) => <TableCell key={h} sx={dtlHeaderSx}>{h}</TableCell>)}</TableRow>
                      </TableHead>
                      <TableBody>
                        {dtlRows.length === 0 ? (
                          <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3, color: "text.secondary", fontSize: "0.8rem" }}>No line items added yet.</TableCell></TableRow>
                        ) : dtlRows.map((row, i) => (
                          <TableRow key={row._key} hover sx={{ backgroundColor: i % 2 === 0 ? "transparent" : "action.hover" }}>
                            <TableCell sx={{ ...dtlCellSx, color: "text.disabled", width: 40, textAlign: "center" }}>{i + 1}</TableCell>
                            <TableCell sx={dtlCellSx}><Chip label={row.serviceid || row.ServiceID || "—"} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} /></TableCell>
                            <TableCell sx={{ ...dtlCellSx, fontWeight: 600 }}>{row.servicename || row.ServiceName || "—"}</TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.rate || row.Rate)}</Typography></TableCell>
                            <TableCell sx={{ ...dtlCellSx, textAlign: "center" }}>{row.qty || row.QTY}</TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.gross || row.Gross)}</Typography></TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(row.discount || row.Discount)}</Typography></TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(row.net || row.Net)}</Typography></TableCell>
                            <TableCell sx={dtlCellSx} align="center">
                              <Box sx={{ display: "flex", gap: 0.3 }}>
                                <Tooltip title="Edit line"><IconButton size="small" onClick={() => editDtlRow(row)}><EditIcon sx={{ fontSize: 13 }} /></IconButton></Tooltip>
                                <Tooltip title="Remove line"><IconButton size="small" color="error" onClick={() => removeDtlRow(row)}><DeleteIcon sx={{ fontSize: 13 }} /></IconButton></Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {dtlRows.length > 0 && (
                          <TableRow sx={{ backgroundColor: darkMode ? alpha("#fff", 0.04) : alpha("#000", 0.03) }}>
                            <TableCell colSpan={5} sx={{ ...dtlCellSx, fontWeight: "bold", fontSize: "0.78rem" }}>TOTALS</TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace" }}>{fmtPHP(hdrForm.grosstotal)}</Typography></TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "error.main" }}>{fmtPHP(hdrForm.discount)}</Typography></TableCell>
                            <TableCell sx={dtlCellSx} align="right"><Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(hdrForm.nettotal)}</Typography></TableCell>
                            <TableCell sx={dtlCellSx} />
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Paper elevation={0} sx={{
                    border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, minWidth: 300,
                    backgroundColor: darkMode ? alpha("#fff", 0.03) : alpha(theme.palette.primary.main, 0.02),
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <Box sx={{ width: 3, height: 14, borderRadius: 2, backgroundColor: "primary.main" }} />
                      <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.68rem" }}>
                        Billing Summary
                      </Typography>
                    </Box>
                    {[
                      { label: "Gross Total", value: hdrForm.grosstotal, color: "text.primary" },
                      { label: "Discount",    value: hdrForm.discount,   color: "error.main" },
                    ].map(({ label, value, color }) => (
                      <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.4 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>{label}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", color, fontSize: "0.8rem" }}>{fmtPHP(value)}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      backgroundColor: darkMode ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.success.main, 0.07),
                      borderRadius: 1.5, px: 1.5, py: 1, mt: 0.5,
                    }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: "0.82rem" }}>NET TOTAL</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main", fontSize: "1rem" }}>
                        {fmtPHP(hdrForm.nettotal)}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 2.5, py: 1.5, gap: 1,
            backgroundColor: darkMode ? alpha("#fff", 0.02) : alpha("#000", 0.01) }}>
            <Button onClick={handleClose} sx={{ textTransform: "none", fontWeight: 500 }}>Cancel</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmitHdr}
              color={isEdit ? "warning" : "primary"}
              sx={{ textTransform: "none", fontWeight: 600, px: 2.5, borderRadius: "8px" }}>
              {isEdit ? "Update Transaction" : "Save Transaction"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ══════════════════════════════════════════════════
            RECEIPT DIALOG
        ══════════════════════════════════════════════════ */}
        <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {receiptMode === "combined" ? <ReceiptLongIcon fontSize="small" color="info" /> : <ReceiptIcon fontSize="small" color="primary" />}
              <Typography component="span" variant="subtitle1" fontWeight="bold">
                {receiptMode === "combined" ? `Combined Receipt — ${receiptClient?.name}` : "Transaction Receipt"}
              </Typography>
              {receiptMode === "combined" && <Chip label={`${receiptGroups.length} unpaid transaction${receiptGroups.length !== 1 ? "s" : ""}`} size="small" color="info" variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }} />}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {receiptMode === "single" && unpaidClientCount(receiptData?.ClientID) > 1 && (
                <Button size="small" variant="outlined" color="info" startIcon={<ReceiptLongIcon fontSize="small" />}
                  onClick={() => handleViewCombinedReceipt(receiptData.ClientID)} sx={{ fontSize: "0.72rem" }}>Combined</Button>
              )}
              <Tooltip title="Print Receipt"><IconButton size="small" onClick={handlePrint}><PrintIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box ref={printRef}>
              {receiptMode === "single" && receiptData && (
                <>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">OFFICIAL RECEIPT</Typography>
                    <Typography variant="caption" color="text.secondary">Billing/SOA Record</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[{ label: "Transaction ID", value: `#${receiptData.ID}` }, { label: "Date", value: fmtDate(receiptData.TransactionDate) }, { label: "Client", value: clientName(receiptData.ClientID) }, { label: "Status", value: receiptData.Status }].map(({ label, value }) => (
                      <Grid item xs={6} key={label}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.05em" }}>{label}</Typography>
                        <Typography variant="body2" fontWeight={600}>{label === "Status" ? <Chip label={value} size="small" color={statusColor(value)} sx={{ fontSize: "0.7rem" }} /> : value}</Typography>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.05em" }}>Particulars</Typography>
                      <Typography variant="body2">{receiptData.Particulars || "—"}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 1 }}>Service Details</Typography>
                  <ReceiptDtlTable dtls={receiptDtls} />
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                    <Divider sx={{ width: "100%", mb: 1 }} />
                    {[{ label: "Gross Total", value: receiptData.GrossTotal, color: "text.primary" }, { label: "Discount", value: receiptData.Discount, color: "error.main" }].map(({ label, value, color }) => (
                      <Box key={label} sx={{ display: "flex", justifyContent: "space-between", width: 260 }}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", color }}>{fmtPHP(value)}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ width: 260, my: 0.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: 260 }}>
                      <Typography variant="subtitle2" fontWeight="bold">NET TOTAL</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(receiptData.NetTotal)}</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", fontStyle: "italic" }}>This is an official transaction record. Thank you.</Typography>
                </>
              )}

              {receiptMode === "combined" && (
                <>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">COMBINED OFFICIAL RECEIPT</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{receiptClient?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Unpaid / Partial Transactions — {receiptGroups.length} record{receiptGroups.length !== 1 ? "s" : ""}</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {receiptGroups.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}><Typography variant="body2" color="text.secondary">Loading transactions…</Typography></Box>
                  ) : receiptGroups.map((group, gi) => (
                    <Box key={group.hdr.ID || gi} sx={{ mb: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, px: 1.5, py: 1, backgroundColor: darkMode ? alpha("#fff", 0.05) : alpha("#1a3a5c", 0.07), borderRadius: 1, mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary" }}>TXN #{group.hdr.ID}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{fmtDate(group.hdr.TransactionDate)}</Typography>
                          <Chip label={group.hdr.Status || "—"} size="small" color={statusColor(group.hdr.Status)} sx={{ fontSize: "0.65rem", height: 18 }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.hdr.Particulars || "—"}</Typography>
                      </Box>
                      <ReceiptDtlTable dtls={group.dtls} />
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, gap: 3, flexWrap: "wrap", pr: 1 }}>
                        <Typography variant="caption" color="text.secondary">Gross: <strong style={{ fontFamily: "monospace" }}>{fmtPHP(group.hdr.GrossTotal)}</strong></Typography>
                        <Typography variant="caption" color="error.main">Discount: <strong style={{ fontFamily: "monospace" }}>{fmtPHP(group.hdr.Discount)}</strong></Typography>
                        <Typography variant="caption" color="success.main">Net: <strong style={{ fontFamily: "monospace" }}>{fmtPHP(group.hdr.NetTotal)}</strong></Typography>
                      </Box>
                      {gi < receiptGroups.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                  {receiptGroups.length > 0 && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, backgroundColor: darkMode ? alpha("#fff", 0.04) : alpha("#1a3a5c", 0.05), borderRadius: 2, p: 2 }}>
                        <Typography component="span" variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", alignSelf: "flex-start" }}>GRAND TOTAL — {receiptClient?.name}</Typography>
                        <Divider sx={{ width: "100%", my: 0.5 }} />
                        {[{ label: "Total Gross", value: combinedGross, color: "text.primary" }, { label: "Total Discount", value: combinedDiscount, color: "error.main" }].map(({ label, value, color }) => (
                          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", color }}>{fmtPHP(value)}</Typography>
                          </Box>
                        ))}
                        <Divider sx={{ width: 300, my: 0.5 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: 300 }}>
                          <Typography variant="subtitle1" fontWeight="bold">TOTAL NET</Typography>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>{fmtPHP(combinedNet)}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ mt: 2, mb: 1.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", fontStyle: "italic" }}>This combined receipt covers all outstanding transactions for {receiptClient?.name}. Thank you.</Typography>
                    </>
                  )}
                </>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2, gap: 1 }}>
            <Button onClick={() => setReceiptOpen(false)}>Close</Button>
            {receiptMode === "single" && unpaidClientCount(receiptData?.ClientID) > 1 && (
              <Button variant="outlined" color="info" startIcon={<ReceiptLongIcon />} onClick={() => handleViewCombinedReceipt(receiptData.ClientID)}>View Combined Receipt</Button>
            )}
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print Receipt</Button>
          </DialogActions>
        </Dialog>

        {/* ══════════════════════════════════════════════════
            DELETE CONFIRM
        ══════════════════════════════════════════════════ */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography component="span" variant="subtitle1" fontWeight="bold">Confirm Delete</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>This will permanently delete the Billing and all its line items. This cannot be undone.</Typography>
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