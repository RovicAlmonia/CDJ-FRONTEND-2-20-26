import React, { useEffect, useState } from "react";
import CustomDialog from "../../../components/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import { OPEN_EMP_DTR } from "../../../store/actions";
import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  Autocomplete,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { http } from "../../../api/http";
import toast from "react-hot-toast";
import { hookContainer } from "../../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import log from "../../../helpers/log";

export default function DtrDetails() {
  const Logs = log();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const open = useSelector((state) => state.customization.openEmpDTR);
  const dtrRec = useSelector((state) => state.customization.dtrData);
  const { data: expense } = hookContainer(
    `/get-emp-dtr-acc-details-posted?id=${dtrRec.Tid}`
  );
  const { data: empRates } = hookContainer(
    `/get-emp-rate-active?id=${dtrRec?.TEidLink}`
  );
  const [editableDTR, setEditableDTR] = useState({
    Tid: "",
    TEidLink: "",
    TDate: "",
    TINAMAct: "",
    TINAMComp: "",
    TOutAMAct: "",
    TOutAMComp: "",
    TotalTimeAM: "",
    TInPMAct: "",
    TInPMComp: "",
    TOutPMComp: "",
    TOutPMAct: "",
    TotalTimePM: "",
    CompTotalTime: "",
    CompTotalTime13thMonth: "",
    violationCount: "",
    RateHour: "",
    AmountDue: "",
    branchID: "",
    companyID: "",
    event: "",
  });

  const [dtrAccToChargeDetailAM, setDtrAccToChargeDetailAM] = useState({
    dtrIDLink: "",
    TEidLink: "",
    TDate: "",
    Type: "AM",
    TotalTime: "",
    RateHour: "",
    AmountDue: "",
    branchID: "",
    companyID: "",
  });
  const [dtrAccToChargeDetailPM, setDtrAccToChargeDetailPM] = useState({
    dtrIDLink: "",
    TEidLink: "",
    TDate: "",
    Type: "PM",
    TotalTime: "",
    RateHour: "",
    AmountDue: "",
    branchID: "",
    companyID: "",
  });

  function timeDiffInHours(start, end) {
    if (!start || !end) return 0;

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    const diffMinutes = endTotalMinutes - startTotalMinutes;
    return diffMinutes / 60;
  }

  function timeDiffInMinutesFormatted(start, end) {
  if (!start || !end) return "0m";

  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;

  // handle overnight (e.g. 23:00 → 01:00)
  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  const diff = endTotal - startTotal;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

  function calculateDTR(dtr) {
    let editable = dtr || editableDTR;

    let totalAM = 0;
    let totalPM = 0;
    let compTotalTime = 0;

    // ----- AM calculation -----
    if (editable.TINAMAct && editable.TOutAMAct) {
      if (editable.TINAMComp && editable.TOutAMComp) {
        const am1 = Number(
          timeDiffInHours(editable.TINAMAct, editable.TINAMComp)
        );
        const am2 = Number(
          timeDiffInHours(editable.TOutAMComp, editable.TOutAMAct)
        );
        totalAM = am1 + am2;
      } else {
        // No break → simple IN - OUT
        totalAM = Number(
          timeDiffInHours(editable.TINAMAct, editable.TOutAMAct)
        );
      }
    }

    // ----- PM calculation -----
    if (editable.TInPMAct && editable.TOutPMAct) {
      if (editable.TInPMComp && editable.TOutPMComp) {
        const pm1 = Number(
          timeDiffInHours(editable.TInPMAct, editable.TInPMComp)
        );
        const pm2 = Number(
          timeDiffInHours(editable.TOutPMComp, editable.TOutPMAct)
        );
        totalPM = pm1 + pm2;
      } else {
        // No break → simple IN - OUT
        totalPM = Number(
          timeDiffInHours(editable.TInPMAct, editable.TOutPMAct)
        );
      }
    }

    // Total computed hours
    compTotalTime = totalAM + totalPM;

    // Never negative
    if (compTotalTime < 0) compTotalTime = 0;

    // Cap at 8 hours (if you still want this)
    if (compTotalTime > 8) compTotalTime = 8;

    const rate = parseFloat(editable.RateHour || "0");
    const amountDue = compTotalTime * rate;

    // Update state with formatted strings
    setEditableDTR({
      ...editable,
      TotalTimeAM: totalAM.toFixed(2),
      TotalTimePM: totalPM.toFixed(2),
      CompTotalTime: compTotalTime.toFixed(2),
      AmountDue: amountDue.toFixed(2),
    });
    setDtrAccToChargeDetailAM({
      ...dtrAccToChargeDetailAM,
      TotalTime: totalAM.toFixed(2),
      AmountDue: (totalAM * (dtrAccToChargeDetailAM.RateHour || 0)).toFixed(2),
    });
    setDtrAccToChargeDetailPM({
      ...dtrAccToChargeDetailPM,
      TotalTime: totalPM.toFixed(2),
      AmountDue: (totalPM * (dtrAccToChargeDetailPM.RateHour || 0)).toFixed(2),
    });
  }

  useEffect(() => {
    if (dtrRec && dtrRec.id) {
      setEditableDTR(dtrRec);
      setDtrAccToChargeDetailAM({
        ...dtrAccToChargeDetailAM,
        id: expense?.[0].id,
        dtrIDLink: dtrRec.Tid,
        TEidLink: dtrRec.TEidLink,
        TDate: dtrRec.TDate,
        TotalTime: dtrRec.TotalTimeAM,
        AmountDue: Number(dtrRec.TotalTimeAM) * dtrRec.RateHour,
        RateHour: dtrRec.RateHour,
        branchID: expense?.[0].branchID,
        companyID: expense?.[0].companyID,
      });
      setDtrAccToChargeDetailPM({
        ...dtrAccToChargeDetailPM,
        id: expense?.[1].id,
        dtrIDLink: dtrRec.Tid,
        TEidLink: dtrRec.TEidLink,
        TDate: dtrRec.TDate,
        TotalTime: dtrRec.TotalTimePM,
        AmountDue: Number(dtrRec.TotalTimePM) * dtrRec.RateHour,
        RateHour: dtrRec.RateHour,
        branchID: expense?.[1].branchID,
        companyID: expense?.[1].companyID,
      });
    }
  }, [dtrRec.id, expense]);
  useEffect(() => {
    setDtrAccToChargeDetailAM({
      ...dtrAccToChargeDetailAM,
      TotalTime: editableDTR.TotalTimeAM,
      AmountDue: Number(editableDTR.TotalTimeAM) * editableDTR.RateHour,
      RateHour: editableDTR.RateHour,
    });
    setDtrAccToChargeDetailPM({
      ...dtrAccToChargeDetailPM,
      TotalTime: editableDTR.TotalTimePM,
      AmountDue: Number(editableDTR.TotalTimePM) * editableDTR.RateHour,
      RateHour: editableDTR.RateHour,
    });
  }, [editableDTR.RateHour, editableDTR.TotalTimeAM, editableDTR.TotalTimePM]);

  const handleSetEditableDTR = (key, value) => {
    const newDTR = { ...editableDTR, [key]: value };
    if (key == "companyID" || key == "branchID") {
      setEditableDTR(newDTR);
    } else {
      setEditableDTR(newDTR);
      calculateDTR(newDTR);
    }
  };

  const CloseDialog = () => {
    dispatch({ type: OPEN_EMP_DTR, openEmpDTR: false });
  };

  const saveDTR = async () => {
    const confirm = window.confirm(
      "Are you sure you want to save these DTR adjustments?"
    );

    if (!confirm) {
      return; // user cancelled
    }

    const response = await http.post("/update-emp-dtr-posted", {
      dataVariable: editableDTR,
    });

    const responseExpense = await http.post("/update-emp-expense-posted", {
      dataVariable: {
        DataAM: dtrAccToChargeDetailAM,
        DataPM: dtrAccToChargeDetailPM,
      },
    });

    if (response.data.success && responseExpense.data.success) {
      toast.success("DTR Edited Successfully");
      queryClient.invalidateQueries(
        `/get-emp-dtr-acc-details-posted?id=${dtrRec.Tid}`
      );
      Logs.update({
        doctype: "DTR Details Update",
        referenceno: dtrRec.TEidLink,
        remarks: `DTR Details edit Successfully during Approval Phase for period ${dtrRec.PFrom} - ${dtrRec.PTo}`,
      });
      CloseDialog();
    } else {
      toast.error("Failed to save DTR.");
    }
  };

  const { data: companyData } = hookContainer("/get-company");
  const { data: branchData } = hookContainer("/get-branch");

  const companyMainData = Array.isArray(companyData)
    ? companyData.map((row) => {
        return {
          ...row,
          id: row.CompID,
        };
      })
    : [];

  const branchMainData = Array.isArray(branchData)
    ? branchData.map((row) => {
        return {
          ...row,
          id: row.BrID,
        };
      })
    : [];
  useEffect(() => {
    handleSetEditableDTR(
      "CompTotalTime13thMonth",
      8 - editableDTR.violationCount
    );
  }, [editableDTR.violationCount]);
  return (
    <CustomDialog
      open={open}
      maxWidth={"lg"}
      width={"lg"}
      DialogTitles={"Edit DTR Details"}
      onClose={CloseDialog}
      DialogContents={
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
          }}
        >
          <TextField
            size="small"
            label="Date"
            InputLabelProps={{ shrink: true }}
            type="date"
            value={editableDTR.TDate}
            onChange={(e) => handleSetEditableDTR("TDate", e.target.value)}
          />
          <Divider>
            <Typography>Branch Info</Typography>
          </Divider>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Autocomplete
              sx={{ flex: 1 }}
              size="small"
              options={companyMainData}
              getOptionLabel={(option) => `${option.CompName}` || ""}
              value={
                companyMainData.find((s) => s.id === editableDTR?.companyID) ||
                null
              }
              onChange={(event, newValue) => {
                handleSetEditableDTR("companyID", newValue.id);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  InputLabelProps={{ shrink: true }}
                  label="Company"
                />
              )}
            />

            <Autocomplete
              sx={{ flex: 1, marginY: 2 }}
              size="small"
              options={branchMainData.filter(
                (b) => b.BrCompIDLink === editableDTR?.companyID
              )}
              getOptionLabel={(option) => `${option.BrName}` || ""}
              value={
                branchMainData.find((s) => s.id === editableDTR?.branchID) ||
                null
              }
              onChange={(event, newValue) => {
                handleSetEditableDTR("branchID", newValue.id);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  InputLabelProps={{ shrink: true }}
                  label="Branch"
                />
              )}
              disabled={!editableDTR?.companyID} // disable if no company selected
            />
          </Box>

          <Divider>
            <Typography
              onClick={() =>
                console.log(dtrAccToChargeDetailAM, dtrAccToChargeDetailPM)
              }
            >
              Schedule
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography>AM Sched</Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                label="AM In"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TINAMAct}
                onChange={(e) =>
                  handleSetEditableDTR("TINAMAct", e.target.value)
                }
              />
              <Tooltip title={`total break:${timeDiffInMinutesFormatted(editableDTR.TINAMComp, editableDTR.TOutAMComp)}`} >
              <TextField
                size="small"
                label="Break AM In"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TINAMComp}
                sx={{marginRight:1}}
                onChange={(e) =>
                  handleSetEditableDTR("TINAMComp", e.target.value)
                }
              />
              <TextField
                size="small"
                label="Break AM Out"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TOutAMComp}
                onChange={(e) =>
                  handleSetEditableDTR("TOutAMComp", e.target.value)
                }
              />
              </Tooltip>
              <TextField
                size="small"
                label="AM Out"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TOutAMAct}
                onChange={(e) =>
                  handleSetEditableDTR("TOutAMAct", e.target.value)
                }
              />
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
              >
                <Autocomplete
                  sx={{ flex: 1 }}
                  size="small"
                  options={companyMainData}
                  getOptionLabel={(option) => `${option.CompName}` || ""}
                  value={
                    companyMainData.find(
                      (s) => s.id === dtrAccToChargeDetailAM?.companyID
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    setDtrAccToChargeDetailAM((prev) => ({
                      ...prev,
                      companyID: newValue?.id,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: "100%" }}
                      InputLabelProps={{ shrink: true }}
                      label="Company"
                    />
                  )}
                />

                <Autocomplete
                  sx={{ flex: 1, marginY: 2 }}
                  size="small"
                  options={branchMainData.filter(
                    (b) => b.BrCompIDLink === dtrAccToChargeDetailAM?.companyID
                  )}
                  getOptionLabel={(option) => `${option.BrName}` || ""}
                  value={
                    branchMainData.find(
                      (s) => s.id === dtrAccToChargeDetailAM?.branchID
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleSetEditableDTR("event", `AM ${newValue?.BrName}`);
                    setDtrAccToChargeDetailAM((prev) => ({
                      ...prev,
                      branchID: newValue?.id,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: "100%" }}
                      InputLabelProps={{ shrink: true }}
                      label="Branch"
                    />
                  )}
                  disabled={!editableDTR?.companyID} // disable if no company selected
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography>PM Sched</Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                label="PM In"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TInPMAct}
                onChange={(e) =>
                  handleSetEditableDTR("TInPMAct", e.target.value)
                }
              />
              <Tooltip title={`total break:${timeDiffInMinutesFormatted(editableDTR.TInPMComp, editableDTR.TOutPMComp)}`} >
              <TextField
                size="small"
                label="Break PM In"
                type="time"
                sx={{marginRight:1}}
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TInPMComp}
                onChange={(e) =>
                  handleSetEditableDTR("TInPMComp", e.target.value)
                }
              />
              <TextField
                size="small"
                label="Break PM Out"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TOutPMComp}
                onChange={(e) =>
                  handleSetEditableDTR("TOutPMComp", e.target.value)
                }
              />
              </Tooltip>
              <TextField
                size="small"
                label="PM Out"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TOutPMAct}
                onChange={(e) =>
                  handleSetEditableDTR("TOutPMAct", e.target.value)
                }
              />
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
              >
                <Autocomplete
                  sx={{ flex: 1 }}
                  size="small"
                  options={companyMainData}
                  getOptionLabel={(option) => `${option.CompName}` || ""}
                  value={
                    companyMainData.find(
                      (s) => s.id === dtrAccToChargeDetailPM?.companyID
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    setDtrAccToChargeDetailPM((prev) => ({
                      ...prev,
                      companyID: newValue?.id,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: "100%" }}
                      InputLabelProps={{ shrink: true }}
                      label="Company"
                    />
                  )}
                />

                <Autocomplete
                  sx={{ flex: 1, marginY: 2 }}
                  size="small"
                  options={branchMainData.filter(
                    (b) => b.BrCompIDLink === dtrAccToChargeDetailPM?.companyID
                  )}
                  getOptionLabel={(option) => `${option.BrName}` || ""}
                  value={
                    branchMainData.find(
                      (s) => s.id === dtrAccToChargeDetailPM?.branchID
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleSetEditableDTR("event", `PM ${newValue?.BrName}`);
                    setDtrAccToChargeDetailPM((prev) => ({
                      ...prev,
                      branchID: newValue?.id,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: "100%" }}
                      InputLabelProps={{ shrink: true }}
                      label="Branch"
                    />
                  )}
                  disabled={!editableDTR?.companyID} // disable if no company selected
                />
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            <TextField
              size="small"
              label="event"
              sx={{ flex: 1 }}
              value={editableDTR.event}
              onChange={(e) => handleSetEditableDTR("event", e.target.value)}
            />
          </Box>
          <Divider>
            <Typography>Totals</Typography>
          </Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                label="Total AM"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TotalTimeAM}
                disabled
              />
              <TextField
                size="small"
                label="Total PM"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.TotalTimePM}
                disabled
              />
              <TextField
                size="small"
                label="Total Time"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.CompTotalTime}
                disabled
              />
              <TextField
                size="small"
                label="Total Time 13th Month Calculation"
                InputLabelProps={{ shrink: true }}
                value={editableDTR.CompTotalTime13thMonth}
                disabled
              />
              <TextField
                select
                size="small"
                label="Violation Count"
                sx={{ flex: 1 }}
                InputLabelProps={{ shrink: true }}
                value={editableDTR.violationCount}
                onChange={(e) => {
                  handleSetEditableDTR("violationCount", e.target.value);
                }}
              >
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={0.5}>0.5</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={1.5}>1.5</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={2.5}>2.5</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={3.5}>3.5</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={4.5}>4.5</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={5.5}>5.5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={6.5}>6.5</MenuItem>
                <MenuItem value={7}>7</MenuItem>
                <MenuItem value={7.5}>7.5</MenuItem>
                <MenuItem value={8}>8</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Autocomplete
                size="small"
                disableClearable
                options={[
                  { label: "Regular", value: empRates?.RegHr },
                  { label: "Regular Holiday Rate", value: empRates?.RDHR },
                  { label: "Special Holiday Rate", value: empRates?.SHHR },
                ]}
                getOptionLabel={(option) => option.label}
                value={
                  [
                    { label: "Regular", value: empRates?.RegHr },
                    { label: "Regular Holiday Rate", value: empRates?.RDHR },
                    { label: "Special Holiday Rate", value: empRates?.SHHR },
                  ].find((opt) => opt.value === editableDTR.RateHour) || null
                }
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(e, newValue) => {
                  if (newValue) {
                    handleSetEditableDTR("RateHour", newValue.value);
                    setEditableDTR((prev) => ({
                      ...prev,
                      event: "Change Rate: " + newValue.label,
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Day Type" sx={{ width: 200 }} />
                )}
              />
              <TextField
                size="small"
                label="Rate"
                value={editableDTR.RateHour}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  handleSetEditableDTR("RateHour", e.target.value)
                }
              />
              <TextField
                size="small"
                label="Payable"
                value={editableDTR.AmountDue}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Box>
          </Box>
        </Box>
      }
      DialogAction={
        <Box>
          <Button
            onClick={saveDTR}
            variant="contained"
            disabled={dtrRec.Status == "APPROVED" ? true : false}
          >
            Save Adjustments
          </Button>
        </Box>
      }
    />
  );
}
