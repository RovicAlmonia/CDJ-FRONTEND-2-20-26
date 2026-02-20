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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";

const emptyForm = {
  id: "",
  serviceid: "",
  servicename: "",
  servicerate: "",
};

export default function ServicesListInt() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const { data: servicesRaw } = hookContainer("/selectserviceslist");

  const servicesList = Array.isArray(servicesRaw?.data)
    ? servicesRaw.data.map((row, index) => ({
        ...row,
        id: row.ID || index,
      }))
    : [];

  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const filteredList = servicesList.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (row.ServiceID?.toString() || "").toLowerCase().includes(query) ||
      (row.ServiceName || "").toLowerCase().includes(query) ||
      (row.ServiceRate?.toString() || "").toLowerCase().includes(query)
    );
  });

  const paginatedList = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNew = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm({
      id: row.ID,
      serviceid: row.ServiceID || "",
      servicename: row.ServiceName || "",
      servicerate: row.ServiceRate || "",
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
    setIsEdit(false);
  };

  const handleSave = async () => {
    if (!form.servicename) {
      toast.error("Service Name is required.");
      return;
    }
    const payload = {
      ...form,
      servicerate: parseFloat(form.servicerate) || 0,
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to delete service.");
    }
  };

  const totalServices = servicesList.length;

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

  const headerCells = ["#", "Service ID", "Service Name / Description", "Rate (₱)", "Actions"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Toolbar: search bar (left) + Add button (right) — no title ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search by name, ID, rate..."
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {searchQuery && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {filteredList.length} of {totalServices} record(s)
            </Typography>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleNew}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      {/* ── Table Paper ── */}
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
                  <TableCell
                    key={label}
                    sx={{
                      ...headerSx,
                      ...(label === "Rate (₱)" ? { textAlign: "right" } : {}),
                      ...(label === "Actions" ? { textAlign: "center" } : {}),
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center" sx={{ py: 5, color: "text.secondary" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <MiscellaneousServicesIcon sx={{ fontSize: 30, color: "text.disabled" }} />
                      <Typography variant="body2" color="text.disabled" fontSize="0.8rem" fontStyle="italic">
                        {searchQuery ? `No records found matching "${searchQuery}"` : "No service records on file."}
                      </Typography>
                    </Box>
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
                      <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 50 }}>
                        {rowNumber}
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Chip label={row.ServiceID || "—"} size="small" variant="outlined" sx={{ fontSize: "0.72rem", fontFamily: "monospace" }} />
                      </TableCell>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        {row.ServiceName || "—"}
                      </TableCell>
                      <TableCell sx={cellSx} align="right">
                        <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.82rem", color: "success.main" }}>
                          ₱{" "}
                          {row.ServiceRate !== null && row.ServiceRate !== undefined
                            ? parseFloat(row.ServiceRate).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx} align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
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
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      </Paper>

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Service ID" fullWidth size="small" type="number"
              value={form.serviceid} onChange={(e) => handleChange("serviceid", e.target.value)} />
            <TextField
              label={<span>Service Name / Description <span style={{ color: "red" }}>*</span></span>}
              fullWidth size="small" value={form.servicename}
              onChange={(e) => handleChange("servicename", e.target.value)} />
            <TextField label="Rate (₱)" fullWidth size="small" type="number"
              inputProps={{ min: 0, step: "0.01" }} value={form.servicerate}
              onChange={(e) => handleChange("servicerate", e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="body2" sx={{ fontWeight: 700 }}>₱</Typography></InputAdornment> }} />
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