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
  alpha,
  useTheme,
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
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";

const emptyForm = {
  id: "",
  clientid: "",
  lnf: "",
  type: "",
  tradename: "",
  dateregistered: null,
  dateexpiration: null,
  dticertificationno: "",
  dtiexpirationdate: null,
  secidno: "",
  secexpirationdate: null,
  cdacertno: "",
  efpsaccount: "",
  taxclearancecertno: "",
  taxclearanceexpiration: null,
  philgeps: "",
  philgepscertno: "",
  philgepsexpiration: null,
  retentiontype: "",
  status: "Active",
};

const DATE_FIELD_OPTIONS = [
  { value: "DateRegistered", label: "Date Registered" },
  { value: "DateExpiration", label: "Date Expiration" },
  { value: "DTIExpirationDate", label: "DTI Expiration" },
  { value: "SECExpirationDate", label: "SEC Expiration" },
  { value: "TaxClearanceExpiration", label: "Tax Clearance Expiration" },
  { value: "PhilGEPSExpiration", label: "PhilGEPS Expiration" },
];

export default function ClientInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const { data: clientsRaw } = hookContainer("/selectclientss");

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

  const filteredList = clientList.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
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
    const matchesFrom = !dateFrom || (rowDate && rowDate.isAfter(dayjs(dateFrom).subtract(1, "day")));
    const matchesTo = !dateTo || (rowDate && rowDate.isBefore(dayjs(dateTo).add(1, "day")));
    const matchesStatus = statusFilter === "All" || (row.Status || "") === statusFilter;

    return matchesSearch && matchesFrom && matchesTo && matchesStatus;
  });

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter !== "All";

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFrom(null);
    setDateTo(null);
    setDateField("DateRegistered");
    setStatusFilter("All");
    setPage(0);
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
      lnf: row.LNF || "",
      type: row.Type || "",
      tradename: row.TradeName || "",
      dateregistered: row.DateRegistered ? dayjs(row.DateRegistered) : null,
      dateexpiration: row.DateExpiration ? dayjs(row.DateExpiration) : null,
      dticertificationno: row.DTICertificationNo || "",
      dtiexpirationdate: row.DTIExpirationDate ? dayjs(row.DTIExpirationDate) : null,
      secidno: row.SECIDNo || "",
      secexpirationdate: row.SECExpirationDate ? dayjs(row.SECExpirationDate) : null,
      cdacertno: row.CDACertNo || "",
      efpsaccount: row.EFPSAccount || "",
      taxclearancecertno: row.TaxClearanceCertNo || "",
      taxclearanceexpiration: row.TaxClearanceExpiration ? dayjs(row.TaxClearanceExpiration) : null,
      philgeps: row.PhilGEPS || "",
      philgepscertno: row.PhilGEPSCertNo || "",
      philgepsexpiration: row.PhilGEPSExpiration ? dayjs(row.PhilGEPSExpiration) : null,
      retentiontype: row.RetentionType || "",
      status: row.Status || "Active",
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const fmt = (val) => (val ? dayjs(val).format("YYYY-MM-DD") : null);

  const handleSubmit = async () => {
    const payload = {
      ...form,
      dateregistered: fmt(form.dateregistered),
      dateexpiration: fmt(form.dateexpiration),
      dtiexpirationdate: fmt(form.dtiexpirationdate),
      secexpirationdate: fmt(form.secexpirationdate),
      taxclearanceexpiration: fmt(form.taxclearanceexpiration),
      philgepsexpiration: fmt(form.philgepsexpiration),
    };
    try {
      if (isEdit) {
        await http.post("/updateclientss", payload);
        toast.success("Client updated successfully!");
      } else {
        await http.post("/postclientss", payload);
        toast.success("Client saved successfully!");
      }
      queryClient.invalidateQueries("/selectclientss");
      handleClose();
    } catch {
      toast.error(isEdit ? "Failed to update client." : "Failed to save client.");
    }
  };

  const handleDeleteConfirm = (id) => setDeleteConfirm({ open: true, id });

  const handleDelete = async () => {
    try {
      await http.delete(`/deleteclientss?id=${deleteConfirm.id}`);
      toast.success("Client deleted successfully!");
      queryClient.invalidateQueries("/selectclientss");
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error("Failed to delete client.");
    }
  };

  const paginatedList = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const fmtDisplay = (val) => (val ? dayjs(val).format("MMM D, YYYY") : "—");

  const totalClients = clientList.length;

  // ── Identical to servicesListInt ──
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

        {/* ── Toolbar Paper — same as servicesListInt right panel toolbar ── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Top bar: title + Add button */}
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
              <PeopleAltIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Client Records
              </Typography>
              <Chip
                label={
                  hasActiveFilters
                    ? `${filteredList.length} of ${totalClients}`
                    : `${totalClients} record${totalClients !== 1 ? "s" : ""}`
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
              Add Client
            </Button>
          </Box>

          {/* Filter bar */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: hasActiveFilters ? "1px solid" : "none",
              borderColor: "divider",
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            {/* Search */}
            <TextField
              placeholder="Search by name, type, LNF..."
              size="small"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              sx={{ width: 240 }}
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

            {/* Status */}
            <TextField
              label="Status"
              select
              size="small"
              sx={{ width: 130 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "success.main" }} />
                  Active
                </Box>
              </MenuItem>
              <MenuItem value="Inactive">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "error.main" }} />
                  Inactive
                </Box>
              </MenuItem>
            </TextField>

            {/* Date field */}
            <TextField
              label="Filter by Date"
              select
              size="small"
              sx={{ width: 200 }}
              value={dateField}
              onChange={(e) => setDateField(e.target.value)}
            >
              {DATE_FIELD_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            {/* Date From */}
            <DatePicker
              label="From"
              value={dateFrom}
              onChange={(val) => { setDateFrom(val); setPage(0); }}
              slotProps={{
                textField: { size: "small", sx: { width: 150 } },
                field: { clearable: true, onClear: () => setDateFrom(null) },
              }}
            />

            {/* Date To */}
            <DatePicker
              label="To"
              value={dateTo}
              onChange={(val) => { setDateTo(val); setPage(0); }}
              minDate={dateFrom || undefined}
              slotProps={{
                textField: { size: "small", sx: { width: 150 } },
                field: { clearable: true, onClear: () => setDateTo(null) },
              }}
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                color="warning"
                startIcon={<FilterAltOffIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* Active filter chips — same pattern as servicesListInt search result row */}
          {hasActiveFilters && (
            <Box
              sx={{
                px: 2,
                py: 0.8,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Active filters:
              </Typography>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size="small"
                  onDelete={() => { setSearchQuery(""); setPage(0); }}
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
              {statusFilter !== "All" && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  size="small"
                  color={statusFilter === "Active" ? "success" : "error"}
                  onDelete={() => { setStatusFilter("All"); setPage(0); }}
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
              {dateFrom && (
                <Chip
                  label={`From: ${dayjs(dateFrom).format("MMM D, YYYY")}`}
                  size="small"
                  color="primary"
                  onDelete={() => { setDateFrom(null); setPage(0); }}
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
              {dateTo && (
                <Chip
                  label={`To: ${dayjs(dateTo).format("MMM D, YYYY")}`}
                  size="small"
                  color="primary"
                  onDelete={() => { setDateTo(null); setPage(0); }}
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
              <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                — {filteredList.length} result{filteredList.length !== 1 ? "s" : ""} found
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ── Table Paper — identical structure to servicesListInt ── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <TableContainer sx={{ overflowX: "auto", maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {headerCells.map((label) => (
                    <TableCell key={label} sx={headerSx}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={headerCells.length}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
                    >
                      {hasActiveFilters
                        ? "No results match your filters."
                        : "No client records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedList.map((row, index) => {
                    const rowNumber = page * rowsPerPage + index + 1;
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                          "&:hover": { backgroundColor: "action.selected" },
                        }}
                      >
                        {/* Row number — same as servicesListInt */}
                        <TableCell
                          sx={{
                            ...cellSx,
                            color: "text.disabled",
                            fontSize: "0.72rem",
                            textAlign: "center",
                            width: 50,
                          }}
                        >
                          {rowNumber}
                        </TableCell>

                        <TableCell sx={cellSx}>{row.ClientID || "—"}</TableCell>
                        <TableCell sx={cellSx}>{row.LNF || "—"}</TableCell>

                        {/* Type — Chip outlined, same as servicesListInt ServiceID */}
                        <TableCell sx={cellSx}>
                          <Chip
                            label={row.Type || "—"}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.72rem" }}
                          />
                        </TableCell>

                        {/* Trade Name — bold like servicesListInt ServiceName */}
                        <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                          {row.TradeName || "—"}
                        </TableCell>

                        <TableCell sx={cellSx}>{fmtDisplay(row.DateRegistered)}</TableCell>
                        <TableCell sx={cellSx}>{fmtDisplay(row.DateExpiration)}</TableCell>
                        <TableCell sx={cellSx}>{row.DTICertificationNo || "—"}</TableCell>
                        <TableCell sx={cellSx}>{fmtDisplay(row.DTIExpirationDate)}</TableCell>
                        <TableCell sx={cellSx}>{row.SECIDNo || "—"}</TableCell>
                        <TableCell sx={cellSx}>{fmtDisplay(row.SECExpirationDate)}</TableCell>
                        <TableCell sx={cellSx}>{row.CDACertNo || "—"}</TableCell>

                        {/* EFPS — Chip like servicesListInt */}
                        <TableCell sx={cellSx}>
                          <Chip
                            label={row.EFPSAccount || "—"}
                            size="small"
                            color={row.EFPSAccount === "Yes" ? "success" : "default"}
                            sx={{ fontSize: "0.72rem" }}
                          />
                        </TableCell>

                        <TableCell sx={cellSx}>{row.TaxClearanceCertNo || "—"}</TableCell>
                        <TableCell sx={cellSx}>{fmtDisplay(row.TaxClearanceExpiration)}</TableCell>

                        {/* PhilGEPS */}
                        <TableCell sx={cellSx}>
                          <Chip
                            label={row.PhilGEPS || "—"}
                            size="small"
                            color={row.PhilGEPS === "Yes" ? "success" : "default"}
                            sx={{ fontSize: "0.72rem" }}
                          />
                        </TableCell>

                        <TableCell sx={cellSx}>{row.PhilGEPSCertNo || "—"}</TableCell>
                        <TableCell sx={cellSx}>{fmtDisplay(row.PhilGEPSExpiration)}</TableCell>

                        {/* Retention */}
                        <TableCell sx={cellSx}>
                          <Chip
                            label={row.RetentionType || "—"}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: "0.72rem" }}
                          />
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={cellSx}>
                          <Chip
                            label={row.Status || "—"}
                            size="small"
                            color={row.Status === "Active" ? "success" : "error"}
                            sx={{ fontSize: "0.72rem" }}
                          />
                        </TableCell>

                        {/* Actions — identical to servicesListInt */}
                        <TableCell sx={cellSx} align="center">
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(row)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteConfirm(row.ID)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination — identical to servicesListInt */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Paper>

        {/* ── Add/Edit Dialog — same header tint pattern as servicesListInt form header ── */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          scroll="paper"
          PaperProps={{ sx: { maxHeight: "90vh", borderRadius: 2 } }}
        >
          <DialogTitle
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
            {isEdit ? (
              <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
            ) : (
              <AddIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
            )}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: isEdit ? theme.palette.warning.main : theme.palette.primary.main }}
            >
              {isEdit ? "Edit Client" : "Add New Client"}
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>

              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary" }}>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Client ID" fullWidth size="small" value={form.clientid}
                  onChange={(e) => handleChange("clientid", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="LNF" fullWidth size="small" value={form.lnf}
                  onChange={(e) => handleChange("lnf", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Type" select fullWidth size="small" value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}>
                  {["Corporation", "Sole Proprietorship", "COOP"].map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Trade Name" fullWidth size="small" value={form.tradename}
                  onChange={(e) => handleChange("tradename", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker label="Date Registered" value={form.dateregistered}
                  onChange={(val) => handleChange("dateregistered", val)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker label="Date Expiration" value={form.dateexpiration}
                  onChange={(val) => handleChange("dateexpiration", val)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>

              {/* DTI */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  DTI Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="DTI Certification No." fullWidth size="small"
                  value={form.dticertificationno}
                  onChange={(e) => handleChange("dticertificationno", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker label="DTI Expiration Date" value={form.dtiexpirationdate}
                  onChange={(val) => handleChange("dtiexpirationdate", val)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>

              {/* SEC */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  SEC Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="SEC ID No." fullWidth size="small" value={form.secidno}
                  onChange={(e) => handleChange("secidno", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker label="SEC Expiration Date" value={form.secexpirationdate}
                  onChange={(val) => handleChange("secexpirationdate", val)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>

              {/* CDA */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  CDA Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="CDA Cert No." fullWidth size="small" value={form.cdacertno}
                  onChange={(e) => handleChange("cdacertno", e.target.value)} />
              </Grid>

              {/* Tax Clearance */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  Tax Clearance
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tax Clearance Cert No." fullWidth size="small"
                  value={form.taxclearancecertno}
                  onChange={(e) => handleChange("taxclearancecertno", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker label="Tax Clearance Expiration" value={form.taxclearanceexpiration}
                  onChange={(val) => handleChange("taxclearanceexpiration", val)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>

              {/* PhilGEPS */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  PhilGEPS Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="PhilGEPS" select fullWidth size="small" value={form.philgeps}
                  onChange={(e) => handleChange("philgeps", e.target.value)}>
                  {["Yes", "No"].map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="PhilGEPS Cert No." fullWidth size="small"
                  value={form.philgepscertno}
                  onChange={(e) => handleChange("philgepscertno", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker label="PhilGEPS Expiration" value={form.philgepsexpiration}
                  onChange={(val) => handleChange("philgepsexpiration", val)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </Grid>

              {/* Other */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "text.secondary", mt: 1 }}>
                  Other Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="EFPS Account" select fullWidth size="small"
                  value={form.efpsaccount}
                  onChange={(e) => handleChange("efpsaccount", e.target.value)}>
                  {["Yes", "No"].map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Retention Type" select fullWidth size="small"
                  value={form.retentiontype}
                  onChange={(e) => handleChange("retentiontype", e.target.value)}>
                  {["Monthly", "Quarterly", "Semi Annual"].map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Status" select fullWidth size="small" value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}>
                  {["Active", "Inactive"].map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
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

        {/* Delete Confirmation */}
        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, id: null })}
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>
              Are you sure you want to delete this client record? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
            <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
}