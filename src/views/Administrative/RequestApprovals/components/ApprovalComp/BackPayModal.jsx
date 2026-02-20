import React, { useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_BP_MODAL } from "../../../../../store/actions";
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

export default function BackPayModal() {
  const dispatch = useDispatch();
  const openBPModal = useSelector((state) => state.customization.openBPModal);
  const BPInfo = useSelector((state) => state.customization.BPInfo);
  const { data: empall } = hookContainer("/get-employee-all-list");
  const queryClient = useQueryClient();

  // ✅ Close Dialog
  const CloseDialog = () => {
    dispatch({ type: OPEN_BP_MODAL, openBPModal: false });
  };

  // ✅ Get Employee Full Name
  function getEmployeeFullName(empID) {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";
    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${
      ExtName ? ` ${ExtName}` : ""
    }`.trim();
  }

  // ✅ State for form data
  const [formData, setFormData] = useState({
    did: "",
    dEmpid: "",
    dAmount: "",
    ddetails: "",
    ddate: "",
    dRefNo: "",
    Encodedby: "",
    EncodedDateTime: "",
    Status: "",
  });

  // ✅ Load data when modal opens
  useEffect(() => {
    if (BPInfo) {
      setFormData({
        did: BPInfo.did || "",
        dEmpid: BPInfo.dEmpid || "",
        dAmount: BPInfo.dAmount || "",
        ddetails: BPInfo.ddetails || "",
        ddate: BPInfo.ddate || "",
        dRefNo: BPInfo.dRefNo || "",
        Encodedby: BPInfo.Encodedby || "",
        EncodedDateTime: BPInfo.EncodedDateTime || "",
        Status: BPInfo.Status || "",
      });
    }
  }, [BPInfo]);

  // ✅ Save handler (Update Back Pay)
  const handleSave = async () => {
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await http.post("/post-update-modalbackpay", {
        dataVariable: formData,
      });

      if (response.data.success) {
        toast.success("Back Pay record updated successfully");

        // ✅ Refresh the list after update
        await queryClient.invalidateQueries({
          queryKey: ["/get-approval-BackPay"],
          exact: true,
        });

        CloseDialog();
      } else {
        toast.error("Failed to update Back Pay record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating Back Pay record");
    }
  };

  return (
    <CustomDialog
      open={openBPModal}
      maxWidth={"md"}
      DialogTitles={"Back Pay Details"}
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
              value={formData.dEmpid}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Employee Name"
              size="small"
              sx={{ flex: 1 }}
              value={getEmployeeFullName(formData.dEmpid)}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Reference Number */}
          <TextField
            label="Reference No"
            size="small"
            type="text"
            value={formData.dRefNo}
            onChange={(e) =>
              setFormData({ ...formData, dRefNo: e.target.value })
            }
            InputProps={{ readOnly: true }}
          />

          {/* Amount */}
          <TextField
            label="Amount"
            size="small"
            type="number"
            value={formData.dAmount}
            onChange={(e) =>
              setFormData({ ...formData, dAmount: e.target.value })
            }
          />

          {/* Remarks / Details */}
          <TextField
            label="Remarks / Details"
            size="small"
            multiline
            rows={3}
            value={formData.ddetails}
            onChange={(e) =>
              setFormData({ ...formData, ddetails: e.target.value })
            }
          />

          {/* Date & Time Filed */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date & Time Filed"
              readOnly
              value={
                formData.EncodedDateTime
                  ? dayjs(formData.EncodedDateTime)
                  : null
              }
              onChange={(newValue) =>
                setFormData({
                  ...formData,
                  EncodedDateTime: newValue
                    ? newValue.format("YYYY-MM-DD HH:mm:ss")
                    : "",
                })
              }
              slotProps={{ textField: { size: "small" } }}
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
              label="Status"
              size="small"
              value={formData.Status}
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
