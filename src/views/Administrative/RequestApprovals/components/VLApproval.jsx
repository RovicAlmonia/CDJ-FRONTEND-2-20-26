import React, { useContext, useMemo, useState } from "react";
import CustomDataGrid from "../../../../components/CustomDataGrid";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import NoData from "../../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../../hooks/globalQuery";
import { AuthContext } from "../../../../modules/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../../../api/http";
import { toast } from "sonner";
import dayjs from "dayjs";
import {useDispatch} from "react-redux";
import PaidLeavesModal from "./ApprovalComp/PaidLeavesModal";
import { OPEN_PL_MODAL, SET_PL_INFO } from "../../../../store/actions";

export default function VLApproval() {
  const dispatch = useDispatch();
  const { data: VL } = hookContainer("/get-approval-vl");
  const { data: empall } = hookContainer("/get-employee-all-list");
  const [searchTerm, setSearchTerm] = useState("");
  const VLList = Array.isArray(VL)
    ? VL?.map((row) => ({
        ...row,
        id: row.id,
        fullName: getEmployeeFullName(row.EmpIDLink),
      }))
    : [];

  const [selectedIDs, setSelectedIDs] = useState([]);
  const [openDisapproveDialog, setOpenDisapproveDialog] = useState(false);
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
      if (!searchTerm.trim()) return VLList;
      const lower = searchTerm.toLowerCase();
      return VLList.filter(
        (row) =>
          row.EmpIDLink?.toString().toLowerCase().includes(lower) ||
          row.fullName?.toLowerCase().includes(lower) ||
          dayjs(row.vldate).format("MM-DD-YYYY").includes(lower) ||
          row.Status?.toLowerCase().includes(lower)
      );
    }, [searchTerm, VLList]);

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
      field: "vldate",
      headerName: "Leave Date",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ paddingLeft: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY")}
        </Box>
      ),
    },
    {
      field: "vlparticulars",
      headerName: "Remarks",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "vldateFiled",
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
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
  ];

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const submit = async (type, remarksText = "") => {
    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";

      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-vleave", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: remarksText, // ✅ added remarks
            },
          })
        )
      );

      toast.success(
        `Vacation Leave ${
          status === "APPROVED" ? "Approved" : "Disapproved"
        } Successfully`
      );

      setRemarks("");
      queryClient.invalidateQueries("/get-approval-vl");
    } catch (error) {
      console.error("Error updating Vacation Leaves:", error);
      toast.error("An error occurred while updating Vacation Leaves");
    }
  };

  return (
    <Box>
      <PaidLeavesModal />
      {/* Action Buttons */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, padding: 2 }}
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
          
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to approve the selected Vacation Leaves?"
              );
              if (confirmed) submit("APPROVE");
            }}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenDisapproveDialog(true)}
          >
            Disapprove
          </Button>
        </Box>
      </Box>

      {/* Data Grid */}
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
                  dispatch({ type: OPEN_PL_MODAL, openPLModal: true });
                  dispatch({ type: SET_PL_INFO, PLInfo: selectedRow });
                }}
      />

      {/* Disapprove Dialog */}
      <Dialog
        open={openDisapproveDialog}
        onClose={() => setOpenDisapproveDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove Vacation Leave</DialogTitle>
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
          <Button onClick={() => setOpenDisapproveDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!remarks.trim()) {
                toast.error("Remarks are required for disapproval");
                return;
              }
              submit("DISAPPROVE", remarks);
              setOpenDisapproveDialog(false);
            }}
          >
            Confirm Disapprove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
