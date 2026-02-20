import React, { useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_OOS_MODAL } from "../../../../../store/actions";
import { Box, Button, TextField } from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { hookContainer } from "../../../../../hooks/globalQuery";
import { http } from "../../../../../api/http";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function OOSModal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const openOOSModal = useSelector((state) => state.customization.openOOSModal);
  const OOSInfo = useSelector((state) => state.customization.OOSInfo);

  const { data: empall } = hookContainer("/get-employee-all-list");

  const CloseDialog = () => {
    dispatch({ type: OPEN_OOS_MODAL, openOOSModal: false });
  };

  const getEmployeeFullName = (empID) => {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";
    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${
      ExtName ? ` ${ExtName}` : ""
    }`.trim();
  };

  const [formData, setFormData] = useState({
    id: "",
    EmpIDLink: "",
    otTimeFrom: "",
    otTimeTo: "",
    InputByName: "",
    noHours: "",
    otOffParticulars: "",
    Status: "",
    otdateFiled: "",
    offsetearned: "",
    offsetused: "",
  });

  // ✅ Load Data when Modal opens
  useEffect(() => {
    if (OOSInfo) {
      setFormData({
        id: OOSInfo.id || "",
        EmpIDLink: OOSInfo.EmpIDLink || "",
        otTimeFrom: OOSInfo.otTimeFrom || "",
        otTimeTo: OOSInfo.otTimeTo || "",
        InputByName: OOSInfo.InputByName || "",
        noHours: OOSInfo.noHours || "",
        otOffParticulars: OOSInfo.otOffParticulars || "",
        Status: OOSInfo.Status || "",
        otdateFiled: OOSInfo.otdateFiled || "",
        offsetearned: OOSInfo.offsetearned || "",
        offsetused: OOSInfo.offsetused || "",
      });
    }
  }, [OOSInfo]);

  // ✅ Auto calculate total hours when time changes
  useEffect(() => {
    if (formData.otTimeFrom && formData.otTimeTo) {
      const start = dayjs(formData.otTimeFrom, "HH:mm");
      let end = dayjs(formData.otTimeTo, "HH:mm");

      // If "to" time is earlier than "from", assume it crosses midnight
      if (end.isBefore(start)) {
        end = end.add(1, "day");
      }

      const diffInHours = end.diff(start, "minute") / 60;
      setFormData((prev) => ({
        ...prev,
        noHours: diffInHours.toFixed(2),
      }));
    }
  }, [formData.otTimeFrom, formData.otTimeTo]);

  const handleSave = async () => {
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await http.post("/post-update-modaloos", {
        dataVariable: formData,
      });

      if (response.data.success) {
        toast.success("OT/Off record updated successfully");
        await queryClient.invalidateQueries({
          queryKey: ["/get-approval-otoff"],
          exact: true,
        });
        CloseDialog();
      } else {
        toast.error("Failed to update OT/Off record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating OT/Off record");
    }
  };

  return (
    <CustomDialog
      open={openOOSModal}
      maxWidth="md"
      DialogTitles="OT/Off Details"
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
          {/* ✅ Employee Info */}
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

          {/* ✅ OT Time From / To */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TimePicker
                label="OT Time From"
                value={
                  formData.otTimeFrom
                    ? dayjs(formData.otTimeFrom, "HH:mm")
                    : null
                }
                onChange={(newValue) =>
                  setFormData({
                    ...formData,
                    otTimeFrom: newValue ? newValue.format("HH:mm") : "",
                  })
                }
                slotProps={{ textField: { size: "small" } }}
              />
              <TimePicker
                label="OT Time To"
                value={
                  formData.otTimeTo ? dayjs(formData.otTimeTo, "HH:mm") : null
                }
                onChange={(newValue) =>
                  setFormData({
                    ...formData,
                    otTimeTo: newValue ? newValue.format("HH:mm") : "",
                  })
                }
                slotProps={{ textField: { size: "small" } }}
              />
            </Box>
          </LocalizationProvider>

          {/* ✅ Auto Computed No. of Hours */}
          <TextField
            label="No. of Hours"
            size="small"
            type="text"
            value={formData.noHours}
            InputProps={{ readOnly: true }}
          />

           <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Offset Earned"
              size="small"
              type="number"
              sx={{ width: 150 }}
              value={formData.offsetearned || 0} 
               onChange={(e) =>
              setFormData({ ...formData, offsetearned: e.target.value })
            }
            />
            <TextField
              label="Offset Used"
              size="small"
              type="number"
              sx={{ flex: 1 }}
              value={(formData.offsetused || 0)}
               onChange={(e) =>
              setFormData({ ...formData, offsetused: e.target.value })
            }
            />
          </Box>

          {/* ✅ OT/Off Particulars */}
          <TextField
            label="OT/Off Particulars"
            size="small"
            multiline
            rows={3}
            value={formData.otOffParticulars}
            onChange={(e) =>
              setFormData({ ...formData, otOffParticulars: e.target.value })
            }
          />

          {/* ✅ Filed By & Status */}
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

          {/* ✅ Date Filed */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date Filed"
              readOnly
              value={
                formData.otdateFiled ? dayjs(formData.otdateFiled) : null
              }
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

          {/* ✅ Action Buttons */}
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
