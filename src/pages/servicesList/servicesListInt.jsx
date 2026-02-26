import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  useTheme,
  TablePagination,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────

// Convert total months → friendly display string
function monthsToLabel(totalMonths) {
  if (!totalMonths && totalMonths !== 0) return "—";
  const m = parseInt(totalMonths);
  if (m < 12) return `${m} month${m !== 1 ? "s" : ""}`;
  const years = Math.floor(m / 12);
  const months = m % 12;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
}

// Renewal display chip for the table
function RenewalChip({ totalMonths }) {
  if (!totalMonths && totalMonths !== 0)
    return <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>;
  const m = parseInt(totalMonths);
  const color = m <= 3 ? "error" : m <= 12 ? "warning" : m <= 36 ? "info" : "success";
  return (
    <Chip
      icon={<AutorenewIcon sx={{ fontSize: "0.75rem !important" }} />}
      label={monthsToLabel(m)}
      size="small"
      color={color}
      variant="outlined"
      sx={{ fontSize: "0.7rem", height: 20 }}
    />
  );
}

// Presets
const RENEWAL_PRESETS = [
  { label: "1 Month",  totalMonths: 1  },
  { label: "3 Months", totalMonths: 3  },
  { label: "6 Months", totalMonths: 6  },
  { label: "1 Year",   totalMonths: 12 },
  { label: "2 Years",  totalMonths: 24 },
  { label: "3 Years",  totalMonths: 36 },
  { label: "5 Years",  totalMonths: 60 },
  { label: "6 Years",  totalMonths: 72 },
];

const emptyForm = {
  id: "",
  serviceid: "",
  servicename: "",
  servicerate: "",
  servicerenewalmonths: 12,
  manualValue: "1",
  manualUnit: "years",
};

export default function ServicesListInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const { data: servicesRaw } = hookContainer("/selectserviceslist");

  const servicesList = Array.isArray(servicesRaw?.data)
    ? servicesRaw.data.map((row, index) => ({ ...row, id: row.ID || index }))
    : [];

  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // ── Filter + paginate ───────────────────────────────────────
  const filteredList = servicesList.filter((row) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (row.ServiceID?.toString() || "").toLowerCase().includes(q) ||
      (row.ServiceName || "").toLowerCase().includes(q) ||
      (row.ServiceRate?.toString() || "").includes(q) ||
      monthsToLabel(row.ServiceRenewalMonths).toLowerCase().includes(q)
    );
  });

  const paginatedList = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ── Form helpers ────────────────────────────────────────────
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePresetClick = (totalMonths) => {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const useYears = months === 0 && years >= 1;
    setForm((prev) => ({
      ...prev,
      servicerenewalmonths: totalMonths,
      manualValue: useYears ? years.toString() : totalMonths.toString(),
      manualUnit: useYears ? "years" : "months",
    }));
  };

  const handleManualValueChange = (value) => {
    const num = parseInt(value) || 0;
    const total = form.manualUnit === "years" ? num * 12 : num;
    setForm((prev) => ({ ...prev, manualValue: value, servicerenewalmonths: total }));
  };

  const handleManualUnitChange = (unit) => {
    const num = parseInt(form.manualValue) || 0;
    const total = unit === "years" ? num * 12 : num;
    setForm((prev) => ({ ...prev, manualUnit: unit, servicerenewalmonths: total }));
  };

  // ── CRUD ────────────────────────────────────────────────────
  const handleNew = () => { setForm(emptyForm); setIsEdit(false); setOpen(true); };

  const handleEdit = (row) => {
    const totalMonths = parseInt(row.ServiceRenewalMonths) || 12;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const useYears = months === 0 && years >= 1;
    setForm({
      id: row.ID,
      serviceid: row.ServiceID || "",
      servicename: row.ServiceName || "",
      servicerate: row.ServiceRate || "",
      servicerenewalmonths: totalMonths,
      manualValue: useYears ? years.toString() : totalMonths.toString(),
      manualUnit: useYears ? "years" : "months",
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setForm(emptyForm); setIsEdit(false); };

  const handleSave = async () => {
    if (!form.servicename) { toast.error("Service Name is required."); return; }
    if (!form.servicerenewalmonths || form.servicerenewalmonths < 1) {
      toast.error("Renewal period must be at least 1 month."); return;
    }
    const payload = {
      id: form.id,
      serviceid: form.serviceid,
      servicename: form.servicename,
      servicerate: parseFloat(form.servicerate) || 0,
      servicerenewalmonths: form.servicerenewalmonths,
    };
    try {
      if (isEdit) {
        await http.post("/updateserviceslist", payload);
        toast.success("Service updated successfully!");
      } else {
        await http.post("/postserviceslist", payload);
        toast.success("Service saved successfully!");
      }
      queryClient.invalidateQueries("/selectserviceslist");
      handleClose();
    } catch {
      toast.error(isEdit ? "Failed to update service." : "Failed to save service.");
    }
  };

  const handleDeleteConfirm = (id) => setDeleteConfirm({ open: true, id });

  const handleDelete = async () => {
    try {
      await http.delete(`/deleteserviceslist?id=${deleteConfirm.id}`);
      toast.success("Service record deleted.");
      queryClient.invalidateQueries("/selectserviceslist");
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error("Failed to delete service.");
    }
  };

  // ── Styles ──────────────────────────────────────────────────
  const cellSx = {
    fontSize: "0.82rem", whiteSpace: "nowrap", px: 1.5, py: 1,
    borderBottom: "1px solid", borderColor: "divider",
  };
  const headerSx = {
    fontWeight: "bold", fontSize: "0.78rem", whiteSpace: "nowrap", px: 1.5, py: 1.2,
    backgroundColor: "action.hover", color: "text.secondary",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "2px solid", borderColor: "divider",
  };
  const headerCells = ["#", "Service ID", "Service Name / Description", "Rate (₱)", "Renewal Period", "Actions"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by name, ID, rate, renewal..."
          size="small" value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          sx={{ width: 300 }}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {searchQuery && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {filteredList.length} of {servicesList.length} record(s)
            </Typography>
          )}
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleNew}>
            Add Service
          </Button>
        </Box>
      </Box>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto", maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headerCells.map((label) => (
                  <TableCell key={label} sx={{
                    ...headerSx,
                    ...(label === "Rate (₱)" ? { textAlign: "right" } : {}),
                    ...(label === "Renewal Period" || label === "Actions" ? { textAlign: "center" } : {}),
                  }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center" sx={{ py: 5 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <MiscellaneousServicesIcon sx={{ fontSize: 30, color: "text.disabled" }} />
                      <Typography variant="body2" color="text.disabled" fontSize="0.8rem" fontStyle="italic">
                        {searchQuery ? `No records found matching "${searchQuery}"` : "No service records on file."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((row, index) => (
                  <TableRow key={row.id} hover sx={{
                    backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                    "&:hover": { backgroundColor: "action.selected" },
                  }}>
                    <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 50 }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip label={row.ServiceID || "—"} size="small" variant="outlined" sx={{ fontSize: "0.72rem", fontFamily: "monospace" }} />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{row.ServiceName || "—"}</TableCell>
                    <TableCell sx={cellSx} align="right">
                      <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.82rem", color: "success.main" }}>
                        ₱ {row.ServiceRate != null
                          ? parseFloat(row.ServiceRate).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "0.00"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx} align="center">
                      <RenewalChip totalMonths={row.ServiceRenewalMonths} />
                    </TableCell>
                    <TableCell sx={cellSx} align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row.ID)}><DeleteIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div"
          count={filteredList.length} rowsPerPage={rowsPerPage} page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      </Paper>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{
          borderBottom: "1px solid", borderColor: "divider", pb: 1.5,
          backgroundColor: isEdit
            ? alpha(theme.palette.warning.main, darkMode ? 0.15 : 0.07)
            : alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.07),
          display: "flex", alignItems: "center", gap: 1,
        }}>
          {isEdit
            ? <EditIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
            : <AddIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
          <Typography variant="subtitle1" fontWeight="bold"
            sx={{ color: isEdit ? theme.palette.warning.main : theme.palette.primary.main }}>
            {isEdit ? "Edit Service" : "Add New Service"}
          </Typography>
          {isEdit && (
            <Chip label={`Record ID: ${form.id}`} size="small" color="warning" variant="outlined"
              sx={{ ml: "auto", fontSize: "0.7rem", height: 20 }} />
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            <TextField label="Service ID" fullWidth size="small"
              value={form.serviceid} onChange={(e) => handleChange("serviceid", e.target.value)} />

            <TextField
              label={<span>Service Name / Description <span style={{ color: "red" }}>*</span></span>}
              fullWidth size="small"
              value={form.servicename} onChange={(e) => handleChange("servicename", e.target.value)} />

            <TextField
              label="Rate (₱)" fullWidth size="small" type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={form.servicerate} onChange={(e) => handleChange("servicerate", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₱</Typography>
                  </InputAdornment>
                ),
              }}
            />

            <Divider />

            {/* ── Renewal Period ── */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <AutorenewIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight="bold">Renewal Period</Typography>
                {form.servicerenewalmonths > 0 && (
                  <Chip
                    label={`= ${monthsToLabel(form.servicerenewalmonths)}`}
                    size="small" color="primary"
                    sx={{ ml: "auto", fontSize: "0.7rem", height: 20 }}
                  />
                )}
              </Box>

              {/* Presets */}
              <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.75, display: "block" }}>
                Quick presets:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
                {RENEWAL_PRESETS.map((preset) => {
                  const isActive = form.servicerenewalmonths === preset.totalMonths;
                  return (
                    <Chip
                      key={preset.totalMonths}
                      label={preset.label}
                      size="small"
                      variant={isActive ? "filled" : "outlined"}
                      color={isActive ? "primary" : "default"}
                      onClick={() => handlePresetClick(preset.totalMonths)}
                      sx={{ cursor: "pointer", fontSize: "0.75rem", fontWeight: isActive ? 700 : 400 }}
                    />
                  );
                })}
              </Box>

              {/* Manual override */}
              <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.75, display: "block" }}>
                Or enter manually:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField
                  size="small" type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={form.manualValue}
                  onChange={(e) => handleManualValueChange(e.target.value)}
                  sx={{ flex: 1 }}
                  placeholder="e.g. 18"
                />
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select
                    value={form.manualUnit}
                    onChange={(e) => handleManualUnitChange(e.target.value)}
                  >
                    <MenuItem value="months">Months</MenuItem>
                    <MenuItem value="years">Years</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Live preview */}
              {form.servicerenewalmonths > 0 && (
                <Box sx={{
                  mt: 1.5, p: 1.25, borderRadius: 1,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  backgroundColor: alpha(theme.palette.primary.main, darkMode ? 0.08 : 0.04),
                  display: "flex", alignItems: "center", gap: 1,
                }}>
                  <AutorenewIcon fontSize="small" sx={{ color: "primary.main" }} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Service expires{" "}
                    <strong style={{ color: theme.palette.primary.main }}>
                      {monthsToLabel(form.servicerenewalmonths)}
                    </strong>{" "}
                    after the client avails it
                    {" "}({form.servicerenewalmonths} month{form.servicerenewalmonths !== 1 ? "s" : ""} stored in DB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })}
        PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>Are you sure you want to delete this service record? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}