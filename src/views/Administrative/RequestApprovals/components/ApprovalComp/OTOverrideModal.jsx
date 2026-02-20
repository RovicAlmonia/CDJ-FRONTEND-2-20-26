import React, { use, useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_OT_MODAL } from "../../../../../store/actions";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { hookContainer } from "../../../../../hooks/globalQuery";
import { http } from "../../../../../api/http";
import toast from "react-hot-toast";

export default function OTOverrideModal() {
  const dispatch = useDispatch();
  const { data: empall } = hookContainer("/get-employee-all-list");
  const open = useSelector((state) => state.customization.openOTModal);
  const otInfo = useSelector((state) => state.customization.OTInfo);

  function getEmployeeFullName(empID) {
    const employee = empall?.find((emp) => emp.EmpID === empID);
    if (!employee) return "Employee not found";
    const { LName, FName, MName, ExtName } = employee;
    return `${LName}, ${FName}${MName ? ` ${MName}` : ""}${
      ExtName ? ` ${ExtName}` : ""
    }`.trim();
  }
  const CloseDialog = () => {
    dispatch({ type: OPEN_OT_MODAL, openOTModal: false });
  };

  // 🔹 State for form data
  const initialData = {
    EmpID: "",
    EmpName: "",
    OTRate: "",
    Project: "",
    OTDate: "",
    OTTimeFrom: "",
    OTAmtDue: "",
    OTTimeTo: "",
    ONoOfHour: "",
    OTNotes: "",
    ReasonD: "",
    FiledBy: "",
    Status: "",
  };

  const [formData, setFormData] = useState(initialData);
  // 🔹 Recalculate hours when time fields change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      OTAmtDue: (Number(prev.OTRate) * Number(prev.ONoOfHour || 0)).toFixed(2),
    }));
  }, [formData.OTTimeFrom, formData.OTTimeTo]);

  // 🔹 Load data from otInfo into form when modal opens
  useEffect(() => {
    if (otInfo) {
      setFormData({
        ...initialData,
        OTid: otInfo.OTid || "",
        EmpID: otInfo.EmpiD || "",
        EmpName: otInfo.FullName || "",
        OTRate: otInfo.OTRate || "",
        OTAmtDue: otInfo.OTAmtDue || "",
        Project: otInfo.Project || "",
        OTDate: otInfo.OTDate || "",
        OTTimeFrom: otInfo.OTTimeFrom || "",
        OTTimeTo: otInfo.OTTimeTo || "",
        ONoOfHour: otInfo.ONoOfHour || "",
        OTNotes: otInfo.OTNotes || "",
        ReasonD: otInfo.ReasonD || "",
        FiledBy: otInfo.Encodedby || "",
        Status: otInfo.Status || "",
        ProjectAssigned: otInfo.ProjectAssigned || "",
      });
    }
  }, [otInfo]);

  // 🔹 Utility for calculating hours
  const calculateHours = (from, to) => {
    if (!from || !to) return "";
    const start = dayjs(from, "HH:mm");
    const end = dayjs(to, "HH:mm");
    return end.diff(start, "hour", true).toFixed(2);
  };

  // 🔹 Save handler
  const handleSave = async () => {
  const confirmed = window.confirm("Are you sure you want to save these changes?");
  if (!confirmed) return; // stop if cancelled

  try {
    const response = await http.post("/post-updateemployeeotData", {
      dataVariable: formData,
    });

    if (response.data.success) {
      toast.success("Employee OT EDITED Successfully");
      CloseDialog()
    } else {
      toast.error("Cannot edit Employee OT");
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error while editing Employee OT");
  }
};

  // 🔹 Delete handler
  const handleDelete = () => {
    console.log("Deleting record...", formData);
    // TODO: API call for delete
    CloseDialog();
  };

  // 🔹 Reset handler
  const handleNew = () => {
    setFormData(initialData);
  };

  return (
    <CustomDialog
      open={open}
      maxWidth={"lg"}
      DialogTitles={"Employee OT Data"}
      onClose={CloseDialog}
      DialogContents={
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 2, padding:2}}>
          {/* Employee Info (Read-only) */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Emp ID"
              size="small"
              sx={{ width: 100 }}
              value={formData.EmpID}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Emp Name"
              size="small"
              sx={{ flex: 1 }}
              value={getEmployeeFullName(formData.EmpID)}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="OT Rate"
              size="small"
              sx={{ width: 100 }}
              value={formData.OTRate}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <TextField
            label="Project Assignment"
            size="small"
            sx={{ flex: 1 }}
            value={formData.ProjectAssigned}
            InputProps={{ readOnly: true }}
          />

          {/* Date + Time */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={formData.OTDate ? dayjs(formData.OTDate) : null}
              onChange={(newValue) =>
                setFormData({
                  ...formData,
                  OTDate: newValue ? newValue.format("YYYY-MM-DD") : "",
                })
              }
              slotProps={{ textField: { size: "small", sx: { flex: 2 } } }}
            />
          </LocalizationProvider>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Time From"
              type="time"
              size="small"
              value={formData.OTTimeFrom}
              onChange={(e) => {
                const from = e.target.value;
                const hours = calculateHours(from, formData.OTTimeTo);
                setFormData({ ...formData, OTTimeFrom: from, ONoOfHour: hours });
              }}
            />
            <TextField
              label="Time To"
              type="time"
              size="small"
              value={formData.OTTimeTo}
              onChange={(e) => {
                const to = e.target.value;
                const hours = calculateHours(formData.OTTimeFrom, to);
                setFormData({ ...formData, OTTimeTo: to, ONoOfHour: hours });
              }}
            />
            <TextField
              label="No. Hours"
              size="small"
              value={formData.ONoOfHour}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="OT Amount Due"
              size="small"
              value={formData.OTAmtDue}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Notes + Purpose */}
          <TextField
            label="Details/Particulars"
            size="small"
            value={formData.OTNotes}
            onChange={(e) => setFormData({ ...formData, OTNotes: e.target.value })}
          />
          <TextField
            label="Purpose"
            size="small"
            value={formData.ReasonD}
            onChange={(e) => setFormData({ ...formData, ReasonD: e.target.value })}
          />

          {/* Metadata */}
          <TextField label="Filed By" size="small" value={formData.FiledBy} />
          <TextField label="Status" size="small" value={formData.Status} />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "end", gap: 1 }}>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save
            </Button>
            <Button variant="contained" color="error" onClick={CloseDialog}>
              cancel
            </Button>
          </Box>
        </Box>
      }
    />
  );
}
