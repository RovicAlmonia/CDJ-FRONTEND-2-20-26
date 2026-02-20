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
import dayjs from "dayjs";
import { http } from "../../../../api/http";
import { useDispatch } from "react-redux";
import SpecialLoansModal from "./ApprovalComp/SpecialLoansModal";
import { OPEN_SCAP_MODAL, SET_SCAP_INFO } from "../../../../store/actions";

export default function LoansApproval() {
  const { data: loans } = hookContainer("/get-approval-loans");
  const dispatch = useDispatch();
  const loanList = Array.isArray(loans)
    ? loans?.map((row) => {
        return {
          ...row,
          id: row.CAID,
          FullName: `${row.CAEmployeeLName}, ${row.CAEmployeeName}`,
        };
      })
    : [];
  const [searchTerm, setSearchTerm] = useState("");
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return loanList;
    const lower = searchTerm.toLowerCase();
    return loanList.filter(
      (row) =>
        row.CAID?.toString().toLowerCase().includes(lower) ||
        row.FullName?.toLowerCase().includes(lower) ||
        dayjs(row.EncodedDateTime).format("MM-DD-YYYY").includes(lower) ||
        row.status?.toLowerCase().includes(lower)
    );
  }, [searchTerm, loanList]);
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [openDisapproveDialog, setOpenDisapproveDialog] = useState(false);
  const [remarks, setRemarks] = useState("");

  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const submit = async (type, remarksText = "") => {
    try {
      const status = type === "APPROVE" ? "APPROVED" : "DISAPPROVED";

      await Promise.all(
        selectedIDs.map((selid) =>
          http.post("/post-update-loan", {
            dataVariable: {
              id: selid,
              Status: status,
              ApprovedBy: accessToken.Fname,
              ApprovedDate: dayjs(),
              Remarks: remarksText, // ✅ include remarks
            },
          })
        )
      );

      toast.success(
        `Loans ${
          status === "APPROVED" ? "Approved" : "Disapproved"
        } Successfully`
      );

      setRemarks("");
      queryClient.invalidateQueries("/get-approval-loans");
    } catch (error) {
      console.error("Error updating Loans:", error);
      toast.error("An error occurred while updating Loans");
    }
  };

  return (
    <Box>
      <SpecialLoansModal />
      {/* Buttons */}
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
        <Box>
          <Button
          variant="contained"
          color="success"
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to approve the selected Loans?"
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

      {/* Loans Table */}
      <CustomDataGrid
        columns={[
          { field: "CAEmployeeID", headerName: "Employee ID", flex: 1 },
          { field: "FullName", headerName: "Employee Name", flex: 1 },
          { field: "CAAmount", headerName: "Amount", flex: 1 },
          { field: "CATerm", headerName: "Term/s", flex: 1 },
          { field: "Details", headerName: "Loan Type", flex: 1 },
          {
            field: "EncodedDateTime",
            headerName: "Date Filed",
            flex: 1,
            renderCell: (params) =>
              dayjs(params.value).format("MM-DD-YYYY -- hh:mm:ss A"),
          },
          { field: "Encodedby", headerName: "Filed By", flex: 1 },
          { field: "Status", headerName: "Status", flex: 1 },
        ]}
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
                  dispatch({ type: OPEN_SCAP_MODAL, openSCAPModal: true });
                  dispatch({ type: SET_SCAP_INFO, SCAPInfo: selectedRow });
                }}
      />

      {/* Disapprove Dialog */}
      <Dialog
        open={openDisapproveDialog}
        onClose={() => setOpenDisapproveDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Disapprove Loan</DialogTitle>
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
