import React, { useContext, useMemo, useState } from "react";
import NoData from "../../../../components/CustomDataTable/NoData";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CustomDataGrid from "../../../../components/CustomDataGrid";
import { hookContainer } from "../../../../hooks/globalQuery";
import { AuthContext } from "../../../../modules/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../../../api/http";
import { toast } from "sonner";
import dayjs from "dayjs";
import { OPEN_BP_MODAL, SET_BP_INFO } from "../../../../store/actions";
import { useDispatch } from "react-redux";
import BackPayModal from "./ApprovalComp/BackPayModal";

export default function BackpayAdjApproval() {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const { data: backpay } = hookContainer("/get-approval-BackPay");
  const BackPayList = Array.isArray(backpay)
    ? backpay?.map((row) => {
        return {
          ...row,
          id: row.did,
        };
      })
    : [];
  const { data: empall } = hookContainer("/get-employee-all-list");

  const [selectedIDs, setSelectedIDs] = useState([]);
  const [openDisapprove, setOpenDisapprove] = useState(false);
  const [remarks, setRemarks] = useState("");

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const ColumnHeader = [
    { field: "dEmpid", headerName: "Employee ID", flex: 1 },
    { field: "dEmpName", headerName: "Employee Name", flex: 1 },
    { field: "dAmount", headerName: "Amount", flex: 1 },
    { field: "ddetails", headerName: "Remarks", flex: 1 },
    {
      field: "EncodedDateTime",
      headerName: "Date Filed",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ paddingLeft: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY -- hh:mm:ss A")}
        </Box>
      ),
    },
    { field: "Encodedby", headerName: "Filed By", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
  ];

  const submit = async (type, disapproveRemarks = "") => {
    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";

      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-addpay", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: disapproveRemarks, // 📝 only filled when DISAPPROVED
            },
          })
        )
      );

      toast.success(
        `Backpay ${
          status === "APPROVED" ? "Approved" : "Disapproved"
        } Successfully`
      );

      queryClient.invalidateQueries("/get-approval-BackPay");
      setRemarks("");
      setOpenDisapprove(false);
      setSelectedIDs([]);
    } catch (error) {
      console.error("Error updating Back Pay/Adjustments:", error);
      toast.error("An error occurred while updating Back Pay/Adjustments");
    }
  };

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return BackPayList;
    const lower = searchTerm.toLowerCase();
    return BackPayList.filter(
      (row) =>
        row.dEmpid?.toString().toLowerCase().includes(lower) ||
        row.dEmpName?.toLowerCase().includes(lower) ||
        dayjs(row.EncodedDateTime).format("MM-DD-YYYY").includes(lower) ||
        row.status?.toLowerCase().includes(lower)
    );
  }, [searchTerm, BackPayList]);

  return (
    <Box>
      <BackPayModal />
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
        <Box sx={{display:'flex', gap:2}}>
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
              setOpenDisapprove(true); // open dialog instead of submitting directly
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
          dispatch({ type: OPEN_BP_MODAL, openBPModal: true });
          dispatch({ type: SET_BP_INFO, BPInfo: selectedRow });
        }}
      />

      {/* 🛑 Disapproval Dialog */}
      <Dialog
        open={openDisapprove}
        onClose={() => setOpenDisapprove(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove Adjustment / Back Pay</DialogTitle>
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
