import React, { useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_SCAP_MODAL } from "../../../../../store/actions";
import { Box, Button, TextField } from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { hookContainer } from "../../../../../hooks/globalQuery";
import { http } from "../../../../../api/http";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function SpecialLoansModal() {
  const dispatch = useDispatch();
  const openSCAPModal = useSelector(
    (state) => state.customization.openSCAPModal
  );
  const SCAPInfo = useSelector((state) => state.customization.SCAPInfo);
  const { data: empall } = hookContainer("/get-employee-all-list");
  const queryClient = useQueryClient();

  // ✅ Close Dialog
  const CloseDialog = () => {
    dispatch({ type: OPEN_SCAP_MODAL, openSCAPModal: false });
  };

  // ✅ Get Employee Full Name
  function getEmployeeFullName(empID) {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "";
    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${
      ExtName ? ` ${ExtName}` : ""
    }`.trim();
  }

  // ✅ State for form data
  const [formData, setFormData] = useState({
    CAID: "",
    CAEmployeeID: "",
    CADate: "",
    CATerm: "",
    CAAmount: "",
    Details: "",
    Encodedby: "",
    EncodedDateTime: "",
    CAStatus: "",
    Status: "",
  });

  // ✅ Load data when modal opens
  useEffect(() => {
    if (SCAPInfo) {
      setFormData({
        CAID: SCAPInfo.CAID || "",
        CAEmployeeID: SCAPInfo.CAEmployeeID || "",
        CADate: SCAPInfo.CADate || "",
        CATerm: SCAPInfo.CATerm || "",
        CAAmount: SCAPInfo.CAAmount || "",
        Details: SCAPInfo.Details || "",
        Encodedby: SCAPInfo.Encodedby || "",
        EncodedDateTime: SCAPInfo.EncodedDateTime || "",
        CAStatus: SCAPInfo.CAStatus || "",
        Status: SCAPInfo.Status || "",
      });
    }
  }, [SCAPInfo]);

  // ✅ Save handler
  const handleSave = async () => {
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await http.post("/post-update-modalspecialloans", {
        dataVariable: formData,
      });

      if (response.data.success) {
        toast.success("Special CA Loan record updated successfully");

        await queryClient.invalidateQueries({
          queryKey: ["/get-approval-loans"],
          exact: true,
        });

        CloseDialog();
      } else {
        toast.error("Failed to update record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating record");
    }
  };

  return (
    <CustomDialog
      open={openSCAPModal}
      maxWidth={"md"}
      DialogTitles={"Special CA Loans Details"}
      onClose={CloseDialog}
      DialogContents={
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
          }}
        >
          {/* Employee Info */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Employee ID"
              size="small"
              sx={{ width: 150 }}
              value={formData.CAEmployeeID}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Employee Name"
              size="small"
              sx={{ flex: 1 }}
              value={getEmployeeFullName(formData.CAEmployeeID)}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Reference Number */}
          <TextField
            label="Term/s"
            size="small"
            type="text"
            value={formData.CATerm}
            InputProps={{ readOnly: true }}
          />

          {/* Amount */}
          <TextField
            label="Amount"
            size="small"
            type="number"
            value={formData.CAAmount}
            onChange={(e) =>
              setFormData({ ...formData, CAAmount: e.target.value })
            }
          />

          {/* Remarks / Details */}
          <TextField
            label="Loan Type"
            size="small"
            multiline
            rows={3}
            value={formData.Details}
            onChange={(e) =>
              setFormData({ ...formData, Details: e.target.value })
            }
          />
          <TextField
            label="Loan Status"
            size="small"
            value={formData.Status}
            onChange={(e) =>
              setFormData({ ...formData, Status: e.target.value })
            }
             InputProps={{ readOnly: true }}
          />

          {/* Date & Time Filed (Read-only) */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date & Time Filed"
              value={
                formData.EncodedDateTime
                  ? dayjs(formData.EncodedDateTime)
                  : null
              }
              readOnly
              slotProps={{
                textField: {
                  size: "small",
                  InputProps: { readOnly: true },
                },
              }}
            />
          </LocalizationProvider>

          {/* Filed By + Status */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Filed By"
              size="small"
              value={formData.Encodedby}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Amount Status"
              size="small"
              value={formData.CAStatus}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "end", gap: 1, mt: 2 }}>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save
            </Button>
            <Button variant="contained" color="error" onClick={CloseDialog}>
              Cancel
            </Button>
          </Box>
        </Box>
      }
    />
  );
}
