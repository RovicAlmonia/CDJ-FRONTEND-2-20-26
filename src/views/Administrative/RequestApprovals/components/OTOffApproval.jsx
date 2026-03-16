import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import React, { useContext, useMemo, useState } from "react";
import CustomDataGrid from "../../../../components/CustomDataGrid";
import NoData from "../../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../../hooks/globalQuery";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../../../modules/context/AuthContext";
import { http } from "../../../../api/http";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import OOSModal from "./ApprovalComp/OOSModal";
import { OPEN_OOS_MODAL, SET_OOS_INFO } from "../../../../store/actions";

export default function OTOffApproval() {
  const dispatch = useDispatch();
  const { data: OTOff } = hookContainer("/get-approval-otoff");
  const { data: empall } = hookContainer("/get-employee-all-list");
  const OTOffList = Array.isArray(OTOff)
    ? OTOff?.map((row) => ({
        ...row,
        id: row.id,
        ottime: `${row.otTimeFrom} - ${row.otTimeTo}`,
        fullName: getEmployeeFullName(row.EmpIDLink),
      }))
    : [];
  const [searchTerm, setSearchTerm] = useState("");
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

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return OTOffList;
    const lower = searchTerm.toLowerCase();
    return OTOffList.filter(
      (row) =>
        row.EmpIDLink?.toString().toLowerCase().includes(lower) ||
        row.fullName?.toLowerCase().includes(lower) ||
        dayjs(row.otdate).format("MM-DD-YYYY").includes(lower) ||
        row.Status?.toLowerCase().includes(lower)
    );
  }, [searchTerm, OTOffList]);
  const submit = async (type, remarksText = "") => {
    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";

      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-otoff", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: remarksText, // ✅ Save remarks for disapproval
            },
          })
        )
      );

      toast.success(
        `OT OFF SET ${
          status === "APPROVED" ? "Approved" : "Disapproved"
        } Successfully`
      );

      setRemarks("");
      queryClient.invalidateQueries("/get-approval-otoff");
    } catch (error) {
      console.error("Error updating OT Off Sets:", error);
      toast.error("An error occurred while updating OT Off Sets");
    }
  };

  const ColumnHeader = [
    {
      field: "EmpIDLink",
      headerName: "Employee ID",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "fullName",
      headerName: "Employee Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "otdate",
      headerName: "Date earned/used",
      renderCell: (params) => (
        <Box sx={{ pl: 1 }}>{dayjs(params.value).format("MM-DD-YYYY")}</Box>
      ),
    },
    {
      field: "ottime",
      headerName: "Time",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "offsetearned",
      headerName: "Off Set Earned",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "offsetused",
      headerName: "Off Set Used",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "otOffParticulars",
      headerName: "Remarks",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "otdateFiled",
      headerName: "Date Filed",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ pl: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY -- hh:mm:ss A")}
        </Box>
      ),
    },
    {
      field: "InputByName",
      headerName: "Filed By",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "Status",
      headerName: "Status",
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
  ];

  return (
    <Box>
      <OOSModal />
      {/* Action Buttons */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, p: 2 }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Employee ID, Name, Date, or Status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, ml: 2, width: 400 }}
        />
        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to approve the selected OT Off Sets?"
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
          dispatch({ type: OPEN_OOS_MODAL, openOOSModal: true });
          dispatch({ type: SET_OOS_INFO, OOSInfo: selectedRow });
        }}
      />

      {/* Disapprove Dialog */}
      <Dialog
        open={openDisapproveDialog}
        onClose={() => setOpenDisapproveDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove OT Off Set</DialogTitle>
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
