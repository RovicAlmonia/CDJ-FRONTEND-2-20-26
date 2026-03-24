import React, { useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_UL_MODAL } from "../../../../../store/actions";
import { Box, Button, TextField } from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { hookContainer } from "../../../../../hooks/globalQuery";
import { http } from "../../../../../api/http";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function UnpaidLeaveModal() {
  const dispatch = useDispatch();
  const openULModal = useSelector((state) => state.customization.openULModal);
  const ULInfo = useSelector((state) => state.customization.ULInfo);
  const { data: empall } = hookContainer("/get-employee-all-list");
  const queryClient = useQueryClient();

  // ✅ Close Dialog
  const CloseDialog = () => {
    dispatch({ type: OPEN_UL_MODAL, openULModal: false });
  };

  // ✅ Get Employee Full Name
  const getEmployeeFullName = (empID) => {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";
    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${
      ExtName ? ` ${ExtName}` : ""
    }`.trim();
  };

  // ✅ State for form data
  const [formData, setFormData] = useState({
    id: "",
    EmpIDLink: "",
    absentParticulars: "",
    absentdate: "",
    InputByName: "",
    status: "",
    absentdateFiled: "",
  });

  // ✅ Load data when modal opens
  useEffect(() => {
    if (ULInfo) {
      setFormData({
        id: ULInfo.id || "",
        EmpIDLink: ULInfo.EmpIDLink || "",
        absentParticulars: ULInfo.absentParticulars || "",
        absentdate: ULInfo.absentdate || "",
        InputByName: ULInfo.InputByName || "",
        status: ULInfo.status || "",
        absentdateFiled: ULInfo.absentdateFiled || "",
      });
    }
  }, [ULInfo]);

  // ✅ Save handler
  const handleSave = async () => {
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await http.post("/post-update-modalunpaidleave", {
        dataVariable: formData,
      });

      if (response.data.success) {
        toast.success("Unpaid Leave record updated successfully");

        // ✅ Refresh the list after update
        await queryClient.invalidateQueries({
          queryKey: ["/get-approval-absent"],
          exact: true,
        });

        CloseDialog();
      } else {
        toast.error("Failed to update Unpaid Leave record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating Unpaid Leave record");
    }
  };

  return (
    <CustomDialog
      open={openULModal}
      maxWidth={"md"}
      DialogTitles={"Unpaid Leave Details"}
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
              value={formData.EmpIDLink}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Employee Name"
              size="small"
              sx={{ flex: 1 }}
              value={getEmployeeFullName(formData.EmpIDLink)}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Remarks / Particulars */}
          <TextField
            label="Particulars / Remarks"
            size="small"
            multiline
            rows={3}
            value={formData.absentParticulars}
            onChange={(e) =>
              setFormData({ ...formData, absentParticulars: e.target.value })
            }
          />

          {/* Absent Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Absent Date"
              value={
                formData.absentdate ? dayjs(formData.absentdate) : null
              }
              onChange={(newValue) =>
                setFormData({
                  ...formData,
                  absentdate: newValue
                    ? newValue.format("YYYY-MM-DD")
                    : "",
                })
              }
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

          {/* Filed By & Status */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Filed By"
              size="small"
              value={formData.InputByName}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Status"
              size="small"
              value={formData.status}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Date Filed */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date Filed"
              readOnly
              value={
                formData.absentdateFiled
                  ? dayjs(formData.absentdateFiled)
                  : null
              }
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

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
