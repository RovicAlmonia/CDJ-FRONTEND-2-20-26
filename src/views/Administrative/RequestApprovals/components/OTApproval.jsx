import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useContext, useEffect, useState, useMemo } from "react";
import CustomDataGrid from "../../../../components/CustomDataGrid";
import NoData from "../../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../../../modules/context/AuthContext";
import { http } from "../../../../api/http";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_OT_MODAL, SET_OT_INFO } from "../../../../store/actions";
import OTOverrideModal from "./ApprovalComp/OTOverrideModal";

export default function OTApproval() {
  const { data: OT } = hookContainer("/get-approval-ot");
  const { data: empall } = hookContainer("/get-employee-all-list");
  const dispatch = useDispatch();
  const open = useSelector((state) => state.customization.openOTModal);
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [disapprovalOpen, setDisapprovalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // --- Get employee full name ---
  function getEmployeeFullName(empID) {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";
    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${
      ExtName ? ` ${ExtName}` : ""
    }`.trim();
  }

  // --- Prepare OT list ---
  const OTList = Array.isArray(OT)
    ? OT?.map((row) => ({
        ...row,
        id: row.OTid,
        time: `${row.OTTimeFrom} - ${row.OTTimeTo}`,
        fullName: getEmployeeFullName(row.EmpiD),
      }))
    : [];

  // --- Apply search filter ---
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return OTList;
    const lower = searchTerm.toLowerCase();
    return OTList.filter(
      (row) =>
        row.EmpiD?.toString().toLowerCase().includes(lower) ||
        row.fullName?.toLowerCase().includes(lower) ||
        dayjs(row.OTDate).format("MM-DD-YYYY").includes(lower) ||
        row.Status?.toLowerCase().includes(lower)
    );
  }, [searchTerm, OTList]);

  const ColumnHeader = [
    {
      field: "EmpiD",
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
      field: "OTDate",
      headerName: "OT Date",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ pl: 1 }}>{dayjs(params.value).format("MM-DD-YYYY")}</Box>
      ),
    },
    {
      field: "time",
      headerName: "From - To",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "ONoOfHour",
      headerName: "No. Hours",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "OTRate",
      headerName: "OT Rate",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "OTAmtDue",
      headerName: "Amt. Due",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "ReasonD",
      headerName: "OT Reason",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "Encodedby",
      headerName: "Filed By",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
    {
      field: "EncodedDateTime",
      headerName: "Date Filed",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ pl: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY -- hh:mm:ss A")}
        </Box>
      ),
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <Box sx={{ pl: 1 }}>{params.value}</Box>,
    },
  ];

  // --- Submit handler for approve/disapprove ---
  const submit = async (type, remarksText = "") => {
    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";
      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-ot", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: remarksText,
            },
          })
        )
      );
      toast.success(`OT ${status === "APPROVED" ? "Approved" : "Disapproved"} Successfully`);
      queryClient.invalidateQueries("/get-approval-ot");
      setDisapprovalOpen(false);
      setRemarks("");
    } catch (error) {
      console.error("Error updating OT Approvals:", error);
      toast.error("An error occurred while updating OT approvals");
    }
  };

  useEffect(() => {
    queryClient.invalidateQueries("/get-approval-ot");
  }, [open]);

  return (
    <Box>
      <OTOverrideModal />

      {/* Header / Search / Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, p: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Employee ID, Name, Date, or Status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, ml: 2, width: 400 }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="success" onClick={() => submit("APPROVE")}>
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedIDs.length === 0) {
                toast.error("Please select at least one row to disapprove");
                return;
              }
              setDisapprovalOpen(true);
            }}
          >
            Disapprove
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <CustomDataGrid
        columns={ColumnHeader}
        rows={filteredList}
        maxHeight={450}
        height={450}
        checkboxSelection
        slots={{ noRowsOverlay: NoData }}
        rowSelectionModel={selectedIDs}
        onRowSelectionModelChange={(newSelection) => setSelectedIDs(newSelection)}
        onRowClick={(params) => {
          const selectedRow = params.row;
          dispatch({ type: OPEN_OT_MODAL, openOTModal: true });
          dispatch({ type: SET_OT_INFO, OTInfo: selectedRow });
        }}
      />

      {/* Disapproval Dialog */}
      <Dialog
        open={disapprovalOpen}
        onClose={() => setDisapprovalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove OT</DialogTitle>
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
          <Button onClick={() => setDisapprovalOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!remarks.trim()) {
                toast.error("Remarks are required to disapprove.");
                return;
              }
              submit("DISAPPROVE", remarks);
            }}
            color="error"
            variant="contained"
          >
            Submit Disapproval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
