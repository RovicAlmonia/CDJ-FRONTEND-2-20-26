import React, { useEffect, useState } from "react";
import CustomDialog from "../../../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_OD_MODAL } from "../../../../../store/actions";
import { Box, Button, TextField, Autocomplete } from "@mui/material";
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

export default function OtherDeductionsModal() {
  const dispatch = useDispatch();
  const openODModal = useSelector((state) => state.customization.openODModal);
  const ODInfo = useSelector((state) => state.customization.ODInfo);
  const { data: empall } = hookContainer("/get-employee-all-list");
  const { data: accToChargeList } = hookContainer("/get-acctocharge");
  const queryClient = useQueryClient();

  // ✅ Close Dialog
  const CloseDialog = () => {
    dispatch({ type: OPEN_OD_MODAL, openODModal: false });
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
    accountToCharge: "",
    dChargeCenter: "",
    EncodedBy: "",
    Status: "",
  });

  // ✅ Load data when modal opens
  useEffect(() => {
    if (ODInfo) {
      setFormData({
        did: ODInfo.did || "",
        dEmpid: ODInfo.dEmpid || "",
        dAmount: ODInfo.dAmount || "",
        ddetails: ODInfo.ddetails || "",
        ddate: ODInfo.ddate || "",
        accountToCharge: ODInfo.accountToCharge || "",
        dChargeCenter: ODInfo.dChargeCenter || "",
        EncodedBy: ODInfo.EncodedBy || "",
        Status: ODInfo.Status || "",
      });
    }
  }, [ODInfo]);

  // ✅ Save handler (Update Other Deduction)
  const handleSave = async () => {
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await http.post("/post-update-modaldeductions", {
        dataVariable: formData,
      });

      if (response.data.success) {
        toast.success("Other Deduction updated successfully");

        // ✅ Refresh the list after update
        await queryClient.invalidateQueries({
          queryKey: ["/get-approval-otherDeductions"],
          exact: true,
        });

        CloseDialog();
      } else {
        toast.error("Failed to update Other Deduction");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating Other Deduction");
    }
  };

  return (
    <CustomDialog
      open={openODModal}
      maxWidth={"md"}
      DialogTitles={"Other Deduction Details"}
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

          {/* Account To Pay */}
          <Autocomplete
            sx={{ flex: 1 }}
            size="small"
            options={accToChargeList || []}
            getOptionLabel={(option) => option?.accountToCharge || ""}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id ||
              option.accountToCharge === value.accountToCharge
            }
            value={
              accToChargeList?.find(
                (item) =>
                  item.id === formData?.accountToCharge ||
                  item.accountToCharge === formData?.dChargeCenter
              ) || null
            }
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                accountToCharge: newValue?.id || null,
                dChargeCenter: newValue?.accountToCharge || "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Account To Pay"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          {/* Amount & Remarks */}
          <TextField
            label="Amount"
            size="small"
            type="number"
            value={formData.dAmount}
            onChange={(e) =>
              setFormData({ ...formData, dAmount: e.target.value })
            }
          />

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

          {/* Date & Time Filed (Read-only) */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date & Time Filed"
              value={formData.ddate ? dayjs(formData.ddate) : null}
              readOnly
              onChange={(newValue) =>
                setFormData({
                  ...formData,
                  ddate: newValue ? newValue.format("YYYY-MM-DD HH:mm:ss") : "",
                })
              }
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
              value={formData.EncodedBy}
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
