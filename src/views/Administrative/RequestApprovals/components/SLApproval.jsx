import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useContext, useState } from "react";
import CustomDataGrid from "../../../../components/CustomDataGrid";
import NoData from "../../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../../hooks/globalQuery";
import { AuthContext } from "../../../../modules/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { http } from "../../../../api/http";
import { toast } from "sonner";

export default function SLApproval() {
  const { data: SL } = hookContainer("/get-approval-sl");
  const SLList = Array.isArray(SL)
    ? SL?.map((row) => ({ ...row, id: row.id }))
    : [];

  const { data: empall } = hookContainer("/get-employee-all-list");
  const [selectedIDs, setSelectedIDs] = useState([]);

  const [disapproveDialogOpen, setDisapproveDialogOpen] = useState(false);
  const [disapproveRemarks, setDisapproveRemarks] = useState("");

  function getEmployeeFullName(empID) {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";

    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${ExtName ? ` ${ExtName}` : ""}`.trim();
  }

  const ColumnHeader = [
    { field: "EmpIDLink", headerName: "Employee ID", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{p.value}</Box> },
    { field: "FullName", headerName: "Employee Name", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{getEmployeeFullName(p.row.EmpIDLink)}</Box> },
    { field: "sldate", headerName: "Leave Date", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{dayjs(p.value).format("MM-DD-YYYY")}</Box> },
    { field: "sched", headerName: "SL Time", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{p.value}</Box> },
    { field: "slparticulars", headerName: "Remarks", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{p.value}</Box> },
    { field: "sldateFiled", headerName: "Date Filed", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{dayjs(p.value).format("MM-DD-YYYY -- hh:mm:ss A")}</Box> },
    { field: "InputByName", headerName: "Filed By", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{p.value}</Box> },
    { field: "Status", headerName: "Status", flex: 1, renderCell: (p) => <Box sx={{ pl: 1 }}>{p.value}</Box> },
  ];

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const submit = async (type, remarks = "") => {
    if (selectedIDs.length === 0) {
      toast.error("No Sick Leaves selected");
      return;
    }

    if (type === "APPROVE") {
      const confirmed = window.confirm("Are you sure you want to approve the selected Sick Leaves?");
      if (!confirmed) return;
    }

    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";

      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-sleave", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: remarks, // ✅ include remarks when disapproving
            },
          })
        )
      );

      toast.success(`Sick Leave ${status === "APPROVED" ? "Approved" : "Disapproved"} Successfully`);
      queryClient.invalidateQueries("/get-approval-sl");
      setSelectedIDs([]);
    } catch (error) {
      console.error("Error updating Sick Leaves:", error);
      toast.error("An error occurred while updating Sick Leaves");
    }
  };

  return (
    <Box>
      {/* Action buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => submit("APPROVE")}
        >
          Approve
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => setDisapproveDialogOpen(true)}
        >
          Disapprove
        </Button>
      </Box>

      {/* Table */}
      <CustomDataGrid
        columns={ColumnHeader}
        rows={SLList}
        maxHeight={450}
        height={450}
        checkboxSelection
        slots={{ noRowsOverlay: NoData }}
        rowSelectionModel={selectedIDs}
        onRowSelectionModelChange={(newSelection) => setSelectedIDs(newSelection)}
      />

      {/* Disapproval Dialog */}
      <Dialog
        open={disapproveDialogOpen}
        onClose={() => setDisapproveDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove Sick Leave</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            fullWidth
            multiline
            minRows={3}
            value={disapproveRemarks}
            onChange={(e) => setDisapproveRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisapproveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              submit("DISAPPROVE", disapproveRemarks);
              setDisapproveDialogOpen(false);
              setDisapproveRemarks("");
            }}
            color="error"
            variant="contained"
          >
            Disapprove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
