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
import { AuthContext } from "../../../../modules/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "../../../../api/http";
import dayjs from "dayjs";
import { OPEN_OD_MODAL, SET_OD_INFO } from "../../../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import OtherDeductionsModal from "./ApprovalComp/OtherDeductionsModal";

export default function OtherDeductions() {
  const { data: empall } = hookContainer("/get-employee-all-list");
  const { data: otherDeductions } = hookContainer(
    "/get-approval-otherDeductions"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const otherDeductionList = Array.isArray(otherDeductions)
    ? otherDeductions?.map((row) => {
        return {
          ...row,
          id: row.did,
          fullName: getEmployeeFullName(row.dEmpid),
        };
      })
    : [];

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return otherDeductionList;
    const lower = searchTerm.toLowerCase();
    return otherDeductionList.filter(
      (row) =>
        row.id?.toString().toLowerCase().includes(lower) ||
        row.fullName?.toLowerCase().includes(lower) ||
        dayjs(row.ddate).format("MM-DD-YYYY").includes(lower) ||
        row.Status?.toLowerCase().includes(lower)
    );
  }, [searchTerm, otherDeductionList]);

  
  const ODInfo = useSelector((state) => state.customization.ODInfo);
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [openDisapprove, setOpenDisapprove] = useState(false);
  const [remarks, setRemarks] = useState("");
  const dispatch = useDispatch();
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

  const ColumnHeader = [
    { field: "dEmpid", headerName: "Employee ID", flex: 1 },
    {
      field: "fullName",
      headerName: "Employee Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    { field: "dAmount", headerName: "Amount", flex: 1 },
    { field: "ddetails", headerName: "Remarks", flex: 1 },
    {
      field: "ddate",
      headerName: "Date Filed",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ paddingLeft: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY -- hh:mm:ss A")}
        </Box>
      ),
    },
    { field: "EncodedBy", headerName: "Filed By", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
  ];

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const submit = async (type, disapproveRemarks = "") => {
    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";

      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-deductions", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: disapproveRemarks, // 📝 add remarks if disapproved
            },
          })
        )
      );

      toast.success(
        `Deductions ${
          status === "APPROVED" ? "Approved" : "Disapproved"
        } Successfully`
      );

      queryClient.invalidateQueries("/get-approval-otherDeductions");
      setRemarks("");
      setOpenDisapprove(false);
      setSelectedIDs([]);
    } catch (error) {
      console.error("Error updating Deductions:", error);
      toast.error("An error occurred while updating Deductions");
    }
  };

  return (
    <Box>
      <OtherDeductionsModal />
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
              if (selectedIDs.length === 0) {
                toast.error("Please select at least one record to approve");
                return;
              }
              submit("APPROVE");
            }}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedIDs.length === 0) {
                toast.error("Please select at least one record to disapprove");
                return;
              }
              setOpenDisapprove(true);
            }}
          >
            Disapprove
          </Button>
        </Box>
      </Box>

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
          dispatch({ type: OPEN_OD_MODAL, openODModal: true });
          dispatch({ type: SET_OD_INFO, ODInfo: selectedRow });
        }}
      />

      {/* 🛑 Disapproval Dialog */}
      <Dialog
        open={openDisapprove}
        onClose={() => setOpenDisapprove(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove Deduction</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Disapproval Remarks"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisapprove(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!remarks.trim()) {
                toast.error("Remarks are required for disapproval");
                return;
              }
              submit("DISAPPROVE", remarks);
            }}
          >
            Disapprove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
