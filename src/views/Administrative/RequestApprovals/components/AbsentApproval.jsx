import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useContext, useMemo, useState } from "react";
import CustomDataGrid from "../../../../components/CustomDataGrid";
import NoData from "../../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../../hooks/globalQuery";
import { http } from "../../../../api/http";
import { AuthContext } from "../../../../modules/context/AuthContext";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import UnpaidLeaveModal from "./ApprovalComp/UnpaidLeavesModal";
import { OPEN_UL_MODAL, SET_UL_INFO } from "../../../../store/actions";


export default function AbsentApproval() {
  const dispatch = useDispatch();
  const { data: AbsentData } = hookContainer("/get-approval-absent");
  const { data: empall } = hookContainer("/get-employee-all-list");
  const [searchTerm, setSearchTerm] = useState("");
  const AbsentList = Array.isArray(AbsentData)
    ? AbsentData?.map((row) => ({
        ...row,
        id: row.id,
        fullName: getEmployeeFullName(row.EmpIDLink),
      }))
    : [];

  const [selectedIDs, setSelectedIDs] = useState([]);
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  function getEmployeeFullName(empID) {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";

    const { LName, FName, MName, ExtName } = employee;
    return (
      `${LName}, ${FName}` +
      (MName ? ` ${MName}` : "") +
      (ExtName ? ` ${ExtName}` : "")
    ).trim();
  }

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return AbsentList;
    const lower = searchTerm.toLowerCase();
    return AbsentList.filter(
      (row) =>
        row.EmpIDLink?.toString().toLowerCase().includes(lower) ||
        row.fullName?.toLowerCase().includes(lower) ||
        dayjs(row.absentdate).format("MM-DD-YYYY").includes(lower) ||
        row.Status?.toLowerCase().includes(lower)
    );
  }, [searchTerm, AbsentList]);
  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    if (selectedIDs.length === 0) {
      toast.error("Please select at least one record");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to approve the selected absents?"
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-absent", {
            dataVariable: {
              id: selid,
              status: "APPROVED",
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
            },
          })
        )
      );
      toast.success("Absents Approved Successfully");
      queryClient.invalidateQueries("/get-approval-absent");
      setSelectedIDs([]);
    } catch (error) {
      console.error("Error updating absents:", error);
      toast.error("An error occurred while approving absents");
    }
  };

  const handleDisapprove = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for disapproval");
      return;
    }

    try {
      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-absent", {
            dataVariable: {
              id: selid,
              status: "DISAPPROVED",
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: remarks,
            },
          })
        )
      );
      toast.success("Absents Disapproved Successfully");
      queryClient.invalidateQueries("/get-approval-absent");
      setSelectedIDs([]);
      setRemarks("");
      setDisapproveOpen(false);
    } catch (error) {
      console.error("Error disapproving absents:", error);
      toast.error("An error occurred while disapproving absents");
    }
  };

  const ColumnHeader = [
    {
      field: "EmpIDLink",
      headerName: "Employee ID",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "fullName",
      headerName: "Employee Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "absentParticulars",
      headerName: "Remarks",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "absentdate",
      headerName: "Leave Date",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ paddingLeft: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY")}
        </Box>
      ),
    },
    {
      field: "absentdateFiled",
      headerName: "Date Filed",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ paddingLeft: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY -- hh:mm:ss A")}
        </Box>
      ),
    },
    {
      field: "InputByName",
      headerName: "Filed By",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
  ];

  return (
    <Box>
      <UnpaidLeaveModal />
      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          padding: 2,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Employee ID, Name, Date, or Status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, ml: 2, width: 400 }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setDisapproveOpen(true)}
          >
            Disapprove
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <CustomDataGrid
        columns={ColumnHeader}
        rows={filteredList}
        maxHeight={450}
        height={450}
        checkboxSelection={true}
        slots={{ noRowsOverlay: NoData }}
        rowSelectionModel={selectedIDs}
        onRowSelectionModelChange={(newSelection) =>
          setSelectedIDs(newSelection)
        }
         onRowClick={(params) => {
                          const selectedRow = params.row; // full row data available here
                          dispatch({ type: OPEN_UL_MODAL, openULModal: true });
                          dispatch({ type: SET_UL_INFO, ULInfo: selectedRow });
                        }}
      />

      {/* Disapproval Dialog */}
      <Dialog
        open={disapproveOpen}
        onClose={() => setDisapproveOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Disapprove Selected Absents</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisapproveOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDisapprove}>
            Submit Disapproval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
