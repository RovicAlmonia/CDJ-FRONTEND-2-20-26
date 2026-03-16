import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import NoData from "../../../components/CustomDataTable/NoData";
import CustomDataGrid from "../../../components/CustomDataGrid";
import { hookContainer } from "../../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../../api/http";
import { toast } from "sonner";
import CustomConfirmationDialog from "../../../components/ConfirmDialog";
import { DTR_DATA, OPEN_EMP_DTR } from "../../../store/actions";
import DtrDetails from "./dtrDetails";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import log from "../../../helpers/log";
export default function DTRPrep() {
  const Logs = log();
  const [searchField, setSearchField] = useState();
  const [netTake, setNetTake] = useState(0);
  const [branchInfo, setBranch] = useState({
    companyID: "",
    branchID: "",
  });
  const dispatch = useDispatch();
  const dtrDialog = useSelector((state) => state.customization.openEmpDTR);
  const OpenDialog = (data) => {
    dispatch({ type: OPEN_EMP_DTR, openEmpDTR: true });
    dispatch({ type: DTR_DATA, dtrData: data });
  };
  const [selection, setSelection] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openPostConfirm, setOpenPostConfirm] = useState(false);
  const [dtrInfo, setDtrInfo] = useState({
    Tid: "",
    empID: "",
    empName: "",
    empPosition: "",
    payPayPeriodID: "",
    PFrom: "",
    PTo: "",
    Month: "",
    Year: "",
    companyID: "",
    branchID: "",
  });

  const [type, setType] = useState();
  const { data: ActivePayroll } = hookContainer(
    `/get-payroll-active?Type=${type}`
  );
  const { data: companyData } = hookContainer("/get-company");
  const { data: branchData } = hookContainer("/get-branch");
  const queryClient = useQueryClient();

  const { data: empList } = hookContainer(
    `/get-employee-all?id=${branchInfo.branchID}`
  );

  const { data: empData } = hookContainer(
    `/get-emp-dtrhdr-list?PFrom=${ActivePayroll?.[0]?.PFrom}&PTo=${ActivePayroll?.[0]?.PTo}&BranchID=${branchInfo.branchID}&CompanyID=${branchInfo.companyID}`
  );

  const { data: dtrHDR } = hookContainer(
    `/get-emp-dtrhdr-sub?id=${dtrInfo.empID}&&PFrom=${dtrInfo.PFrom}&&PTo=${dtrInfo.PTo}`
  );

  const { data: empDTR } = hookContainer(
    `/get-emp-dtr-submitted?id=${dtrInfo.empID}&&PFrom=${dtrInfo.PFrom}&&PTo=${dtrInfo.PTo}`
  );

  const empDTRList = Array.isArray(empDTR)
    ? empDTR.map((row) => {
        return {
          ...row,
          id: row.Tid,
        };
      })
    : [];

  // Calculate total AmountDue
  useEffect(() => {
    if (Array.isArray(empDTR)) {
      const totalAmountDue = empDTR.reduce((sum, row) => {
        const amount = parseFloat(row.AmountDue) || 0;
        return sum + amount;
      }, 0);
      setNetTake(parseFloat(totalAmountDue.toFixed(2)));
    } else {
      setNetTake(0);
    }
  }, [empDTR]);

  function getEmployeeInfoById(empList, EmpID, field = null) {
    if (!Array.isArray(empList)) return null;

    const emp = empList?.find((e) => e.EmpID == EmpID);
    if (!emp) return null;

    const info = {
      LName: emp.LName || "",
      FName: emp.FName || "",
      MName: emp.MName || "",
      ExtName: emp.ExtName || "",
      Position: emp.Position || "",
    };

    if (field) {
      return info[field] || null;
    }

    return info;
  }

  const employeeData = Array.isArray(empData)
    ? empData.map((row) => {
        const empInfo = getEmployeeInfoById(empList, row.EmpIDLink);

        return {
          ...row,
          id: row.EmpIDLink,
          FullName:
            `${empInfo?.LName}, ${empInfo?.FName} ${empInfo?.MName} ${empInfo?.ExtName}`.trim(),
          Position: empInfo?.Position,
        };
      })
    : [];
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
    queryClient.invalidateQueries({
      queryKey: [`/get-emp-dtr-submitted?id=${dtrInfo.empID}`],
    });
  }, [dtrInfo, dtrDialog]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [`/get-payroll-active?Type=${type}`],
    });
  }, [type]);

  const searchFilter = (rows) => {
    const search = (searchField || "").toLowerCase(); // safely ensure it's a string

    return rows.filter((row) => {
      const fullName = `${row.FullName}`.toLowerCase();
      return fullName.includes(search);
    });
  };

  const handleSetDtrInfo = (key, value) => {
    setDtrInfo((prev) => ({
      ...prev,
      PayPeriodID: ActivePayroll?.[0]?.PPID || "",
      PFrom: ActivePayroll?.[0].PFrom,
      PTo: ActivePayroll?.[0].PTo,
      Month: ActivePayroll?.[0].Month,
      Year: ActivePayroll?.[0].Year,
      branchID: branchInfo.branchID,
      companyID: branchInfo.companyID,
      [key]: value,
    }));
  };
  const ColumnHeader = [
    {
      field: "id",
      headerName: "Emp ID",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "FullName",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            paddingLeft: 1,
            backgroundColor: params.value == "POSTED" ? "red" : "green",
          }}
        >
          {params.value}
        </Box>
      ),
    },
  ];
  const dtrColumn = [
    {
      field: "TDate",
      headerName: "Date",

      renderCell: (params) => (
        <Box sx={{ paddingLeft: 1 }}>
          {dayjs(params.value).format("MM-DD-YYYY")}
        </Box>
      ),
    },
    {
      field: "TINAMAct",
      headerName: "AM In",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TINAMComp",
      headerName: "BREAK AM IN",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TOutAMComp",
      headerName: "Break AM Out",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TOutAMAct",
      headerName: "AM Out",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TInPMAct",
      headerName: "PM In",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TInPMComp",
      headerName: "Break PM In",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TOutPMComp",
      headerName: "Break PM Out",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "TOutPMAct",
      headerName: "PM Out",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "CompTotalTime",
      headerName: "Total Hours ",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "RateHour",
      headerName: "Rate/Hour",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "AmountDue",
      headerName: "AmountDue",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "event",
      headerName: "Event",
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "remarks",
      headerName: "Remarks",
      renderCell: (params) => (
        <Box
          sx={{ paddingLeft: 1, whiteSpace: "normal", wordBreak: "break-word" }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "offSet",
      headerName: "Off Set Hrs",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "offsetTime",
      headerName: "Off Set Time",

      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
  ];

  const deleteDTR = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the DTR(s)?"
    );
    if (!confirmDelete) return;

    try {
      const response = await http.delete(`/delete-dtr-posted?ids=${selection}`);
      if (response.data.success) {
        toast.success("DTR deleted successfully");
        queryClient.invalidateQueries({
          queryKey: [`/get-emp-dtr-submitted?id=${dtrInfo.empID}`],
        });
        Logs.remove({
          doctype: "DTR Deletion",
          referenceno: dtrInfo.empID,
          remarks: `DTR Deleted during the Approval Stage for period ${dtrInfo.PFrom} - ${dtrInfo.PTo}`,
        });
      }
    } catch (error) {
      toast.error("Failed to delete DTR");
      console.error(error);
    }
  };

  const PostDTR = async () => {
    if (!Array.isArray(empDTR) || empDTR.length === 0) {
      toast.error("No DTR");
      return;
    }
    const response = await http.post("/post-approve-dtr", {
      dataVariable: empDTR,
      hdr: { id: dtrHDR?.[0]?.id },
    });

    if (response.data.success) {
      toast.success("DTR Posted");
      queryClient.invalidateQueries(
        `/get-emp-dtrhdr?id=${dtrInfo.empID}&&PFrom=${dtrInfo.PFrom}&&PTo=${dtrInfo.PTo}`
      );
      Logs.update({
        doctype: "DTR Update",
        referenceno: dtrInfo.empID,
        remarks: `DTR Update status to POSTED period ${dtrInfo.PFrom} - ${dtrInfo.PTo}`,
      });
    }
  };

  const ReactivateDTR = async () => {
    const confirmReactivate = window.confirm(
      "Are you sure you want to Reactivate the DTR? This will allow the employee to make changes to their DTR."
    );
    if (!confirmReactivate) return;

    if (empDTRList.length > 0 ) {
      toast.error("Cannot Reactivate DTR with existing DTR Entries.");
      return;
    }

    try {
      const response = await http.post("/post-reactivate-dtr", {
        dataVariable: { id: dtrHDR?.[0]?.id },
      });

      if (response.data.success) {
        toast.success("DTR Reactivated successfully");
        queryClient.invalidateQueries({
          queryKey: [`/get-emp-dtrhdr?id=${dtrInfo.empID}`],
        });
        Logs.update({
          doctype: "DTR Reactivation",
          referenceno: dtrInfo.empID,
          remarks: `DTR Reactivated for period ${dtrInfo.PFrom} - ${dtrInfo.PTo}`,
        });
      }
    } catch (error) {
      toast.error("Failed to Reactivate DTR");
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
      <DtrDetails />
      <CustomConfirmationDialog
        openState={[openPostConfirm, setOpenPostConfirm]}
        dialogTitle="Confirm POST"
        dialogDescription="Are you sure you want to Post employee DTR?"
        dialogAction={PostDTR}
      />
      <Box
        display={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Autocomplete
            sx={{ flex: 1 }}
            size="small"
            options={companyMainData}
            getOptionLabel={(option) => `${option.CompName}` || ""}
            value={
              companyMainData.find((s) => s.id === branchInfo?.companyID) ||
              null
            }
            onChange={(event, newValue) => {
              setBranch((prev) => ({
                ...prev,
                companyID: newValue?.id || null,
                branchID: null,
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
              (b) => b.BrCompIDLink === branchInfo?.companyID
            )}
            getOptionLabel={(option) => `${option.BrName}` || ""}
            value={
              branchMainData.find((s) => s.id === branchInfo?.branchID) || null
            }
            onChange={(event, newValue) => {
              setBranch((prev) => ({
                ...prev,
                branchID: newValue?.id || null,
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
            disabled={!branchInfo?.companyID} // disable if no company selected
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={
                ActivePayroll?.[0]?.PFrom ? dayjs(ActivePayroll[0].PFrom) : null
              }
              format="MM-DD-YYYY"
              sx={{ flex: 2 }}
              slotProps={{
                textField: { size: "small" },
              }}
            />

            <Typography>-</Typography>
            <DatePicker
              label="To"
              value={
                ActivePayroll?.[0]?.PTo ? dayjs(ActivePayroll[0].PTo) : null
              }
              format="MM-DD-YYYY"
              sx={{ flex: 2 }}
              slotProps={{
                textField: { size: "small" },
              }}
            />
          </LocalizationProvider>
          <TextField
            select
            label="Type"
            size="small"
            sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="Q">Q</MenuItem>
            <MenuItem value="W">W</MenuItem>
          </TextField>
        </Box>
        <TextField
          label="Search employee"
          size="small"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        />
        <CustomDataGrid
          columns={ColumnHeader}
          rows={searchFilter(employeeData)}
          height={2000}
          maxHeight={600}
          onRowClick={(params) => {
            if (type) {
              handleSetDtrInfo("empID", params.row.id);
              handleSetDtrInfo("empName", params.row.FullName);
              handleSetDtrInfo("empPosition", params.row.Position);
              queryClient.invalidateQueries(
                `/get-emp-dtrhdr?id=${dtrInfo.empID}&&PFrom=${dtrInfo.PFrom}&&PTo=${dtrInfo.PTo}`
              );
            } else {
              toast.error("Please select a type first");
            }
          }}
          slots={{ noRowsOverlay: NoData }}
        />
      </Box>
      <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              label="ID"
              InputLabelProps={{ shrink: true }}
              sx={{ width: 100 }}
              value={dtrInfo.empID}
            />
            <TextField
              size="small"
              label="Employee Name"
              InputLabelProps={{ shrink: true }}
              value={dtrInfo.empName}
            />
            <TextField
              size="small"
              label="Position"
              InputLabelProps={{ shrink: true }}
              value={dtrInfo.empPosition}
            />
          </Box>

          <Box sx={{display:'flex', gap:2}}>
            {dtrHDR?.[0]?.Status == "SUBMITTED" ? (
              <>
                <Button
                  color="warning"
                  variant="contained"
                  onClick={ReactivateDTR}
                >
                  Re-activate DTR
                </Button>
                <Button color="error" variant="contained" onClick={deleteDTR}>
                  Delete Selection
                </Button>
              </>
            ) : (
              ""
            )}
          </Box>
        </Box>
        <Box></Box>
        <Box
          sx={{ display: "flex", gap: 2, overflowX: "auto", maxWidth: 1150 }}
        >
          <CustomDataGrid
            columns={dtrColumn}
            rows={empDTRList}
            height={2000}
            maxHeight={600}
            slots={{ noRowsOverlay: NoData }}
            checkboxSelection={true}
            onRowClick={(params) => {
              OpenDialog(params.row);
            }}
            onRowSelectionModelChange={(newSelection) => {
              setSelection(newSelection);
            }}
            getRowClassName={(params) =>
              params.row.isSpecial === 1 ? "highlight-special-row" : ""
            }
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <TextField
            size="small"
            sx={{ width: "25%" }}
            label="NET TAKE"
            value={netTake}
            InputProps={{
              sx: { textAlign: "right" }, // Optional, sometimes helpful
              inputProps: { style: { textAlign: "right" } }, // Key part!
            }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          {dtrHDR?.[0]?.Status == "SUBMITTED" ? (
            <>
              <Button
                color="success"
                variant="contained"
                onClick={() => setOpenPostConfirm(true)}
              >
                APPROVE DTR
              </Button>
            </>
          ) : (
            ""
          )}
        </Box>
      </Box>
    </Box>
  );
}
