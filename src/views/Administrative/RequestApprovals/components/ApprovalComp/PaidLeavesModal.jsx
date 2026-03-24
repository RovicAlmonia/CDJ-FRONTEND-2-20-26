import React, { useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_PL_MODAL } from "../../../../../store/actions";
import { Box, Button, TextField } from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
  DatePicker
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { hookContainer } from "../../../../../hooks/globalQuery";
import { http } from "../../../../../api/http";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PaidLeavesModal() {
  const dispatch = useDispatch();
  const openPLModal = useSelector((state) => state.customization.openPLModal);
  const PLInfo = useSelector((state) => state.customization.PLInfo);
  const { data: empall } = hookContainer("/get-employee-all-list");
  const queryClient = useQueryClient();

  // ✅ Close Dialog
  const CloseDialog = () => {
    dispatch({ type: OPEN_PL_MODAL, openPLModal: false });
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
    vlearned: "",
    vlused: "",
    vlparticulars: "",
    vldate: "",
    InputByName: "",
    Status: "",
    dateInputted: "",
  });

  // ✅ Load data when modal opens
  useEffect(() => {
    if (PLInfo) {
      setFormData({
        id: PLInfo.id || "",
        EmpIDLink: PLInfo.EmpIDLink || "",
        vlearned: PLInfo.vlearned || "",
        vlused: PLInfo.vlused || "",
        vlparticulars: PLInfo.vlparticulars || "",
        vldate: PLInfo.vldate || "",
        InputByName: PLInfo.InputByName || "",
        Status: PLInfo.Status || "",
        dateInputted: PLInfo.dateInputted || "",
      });
    }
  }, [PLInfo]);

  // ✅ Save handler
  const handleSave = async () => {
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await http.post("/post-update-modalpaidleave", {
        dataVariable: formData,
      });

      if (response.data.success) {
        toast.success("Paid Leave record updated successfully");

        // ✅ Refresh the list after update
        await queryClient.invalidateQueries({
          queryKey: ["/get-approval-vl"],
          exact: true,
        });

        CloseDialog();
      } else {
        toast.error("Failed to update Paid Leave record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating Paid Leave record");
    }
  };

  return (
    <CustomDialog
      open={openPLModal}
      maxWidth={"md"}
      DialogTitles={"Paid Leave Details"}
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

          {/* VL Earned */}
          <TextField
            label="Vacation Leave Earned"
            size="small"
            type="number"
            value={formData.vlearned}
            onChange={(e) =>
              setFormData({ ...formData, vlearned: e.target.value })
            }
          />

          {/* Particulars */}
          <TextField
            label="Particulars / Remarks"
            size="small"
            multiline
            rows={3}
            value={formData.vlparticulars}
            onChange={(e) =>
              setFormData({ ...formData, vlparticulars: e.target.value })
            }
          />

          {/* Leave Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Leave Date"
              value={formData.vldate ? dayjs(formData.vldate) : null}
              onChange={(newValue) =>
                setFormData({
                  ...formData,
                  vldate: newValue ? newValue.format("YYYY-MM-DD HH:mm:ss") : "",
                })
              }
              readOnly
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
              value={formData.Status}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Encoded Date & Time */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Encoded Date & Time"
              readOnly
              value={
                formData.dateInputted
                  ? dayjs(formData.dateInputted)
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
