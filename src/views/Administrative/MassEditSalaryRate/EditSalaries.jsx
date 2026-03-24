import {
  Autocomplete,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import CustomDataGrid from "../../../components/CustomDataGrid";
import NoData from "../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../hooks/globalQuery";
import { use } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../../api/http";
import { toast } from "sonner";
import { AuthContext } from "../../../modules/context/AuthContext";

const initialData = {
  ERID: "",
  SGID_link: "",
  SGName: "",
  MonthlyBasic: 0.0,
  DailyRate: 0.0,
  HourlyRate: 0.0,
  RDHR: 0.0,
  RDOT: 0.0,
  RDND: 0.0,
  SHHR: 0.0, //special holiday hourly rate
  SHOT: 0.0, //special holiday overtime rate
  SHND: 0.0, //special holiday night differential
  RegHr: 0.0, // Regular Hourly Rate
  RegOt: 0.0, // Regular Overtime Rate
  RegHND: 0.0, // Regular Holiday Night Differential
  EmpIDLink: 0,
  status: "",
  updated_by: "",
};

export default function EditSalaries() {
  const { accessToken } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [fromSalary, setFromSalary] = useState({
    SGID: "",
    SGName: "",
    MonthlyRate: "",
    DailyRate: "",
    HourlyRate: "",
  });
  const [toSalary, setToSalary] = useState(initialData);
  const [selectedRows, setSelectedRows] = useState([]);
  const handleFromSetSalary = (key, value) => {
    setFromSalary((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleToSetSalary = (key, value) => {
    setToSalary((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const { data: salaryGrade } = hookContainer("/get-salary-grade");
  const salaryGradeList = Array.isArray(salaryGrade)
    ? salaryGrade.map((row) => {
        return {
          ...row,
          id: row.SGID,
        };
      })
    : [];

  const truncate = (num, decimals = 3) => {
    const factor = 10 ** decimals;
    return Math.floor(num * factor) / factor;
  };

  const calculateRates = (dailyRate, hourlyRate) => {
    const RegHr = dailyRate / 8;
    const RegOt = hourlyRate + hourlyRate * 0.2;
    const RegHND = hourlyRate * 0.1;

    const shhr = (dailyRate + dailyRate * 0.3) / 8;
    const shot = shhr + shhr * 0.2;
    const shnd = shhr * 0.1;

    const rhhr = hourlyRate * 2;
    const rhot = rhhr + rhhr * 0.2;
    const rhnd = rhhr * 0.1;

    return {
      DailyRate: truncate(dailyRate, 3),
      HourlyRate: truncate(hourlyRate, 3),
      RegHr: truncate(RegHr, 3),
      RegOt: truncate(RegOt, 3),
      RegHND: truncate(RegHND, 3),
      SHHR: truncate(shhr, 3),
      SHOT: truncate(shot, 3),
      SHND: truncate(shnd, 3),
      RDHR: truncate(rhhr, 3),
      RDOT: truncate(rhot, 3),
      RDND: truncate(rhnd, 3),
    };
  };

  const { data: empSalary } = hookContainer(
    `/get-emp-salary-grade?id=${fromSalary.SGID}`
  );
  const empSalaryList = Array.isArray(empSalary?.data)
    ? empSalary.data?.map((row) => {
        return {
          ...row,
          id: row.EmpIDLink,
          FullName: `${row.LName}, ${row.FName} ${row.MName} ${row.ExtName}`,
        };
      })
    : [];

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["/get-salary-grade"],
    });
  }, [fromSalary]);
  const ColumnHeader = [
    {
      field: "id",
      headerName: "Employee ID",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "FullName",
      headerName: "Employee Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "SGName",
      headerName: "Salary Grade Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "MonthlyBasic",
      headerName: "MonthlyBasic",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "DailyRate",
      headerName: "Daily Rate",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "HourlyRate",
      headerName: "Hourly Rate",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
  ];
  const saveEmployeeRates = async () => {
    try {
      for (const row of selectedRows) {
        const response = await http.post("/save-employee-rate-group", {
          dataVariable: toSalary,
          empID: row.id,
          ERID: row.ERID,
        });
      }
      // e.g. show a success toast or navigate
      toast.success("All rates saved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["/get-salary-grade"],
      });
      setToSalary(initialData);
    } catch (error) {
      toast.error("Error saving rates:", error);
      // optionally show error toast
    }
  };
  return (
    <Box>
      <Paper>
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: 1,
              margin: 2,
            }}
          >
            <Typography>FROM</Typography>
            <Autocomplete
              size="small"
              options={salaryGradeList}
              getOptionLabel={(option) => `${option.SGName}` || ""}
              value={
                salaryGradeList.find((s) => s.id === fromSalary?.SGID) || null
              }
              onChange={(event, newValue) => {
                handleFromSetSalary("SGID", newValue?.SGID);
                handleFromSetSalary("SGName", newValue?.SGName);
                handleFromSetSalary("MonthlyRate", newValue?.MonthlyRate);
                handleFromSetSalary("DailyRate", newValue?.DailyRate);
                handleFromSetSalary("HourlyRate", newValue?.HourlyRate);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Box display={{ display: "flex", gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Monthly Basic"
                value={fromSalary.MonthlyRate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Daily Rate"
                value={fromSalary.DailyRate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Hourly Rate"
                value={fromSalary.HourlyRate}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: 1,
              margin: 2,
            }}
          >
            <Typography>TO</Typography>
            <Autocomplete
              size="small"
              options={salaryGradeList}
              getOptionLabel={(option) => `${option.SGName}` || ""}
              value={
                salaryGradeList.find((s) => s.id === toSalary?.SGID) || null
              }
              onChange={(event, newValue) => {
                if (!newValue) {
                  setToSalary({});
                  return;
                }

                const rates = calculateRates(
                  newValue.DailyRate,
                  newValue.HourlyRate
                );

                setToSalary({
                  SGID: newValue.id,
                  SGName: newValue.SGName,
                  MonthlyRate: newValue.MonthlyRate,
                  DailyRate: newValue.DailyRate,
                  HourlyRate: newValue.HourlyRate,
                  updated_by: accessToken?.Fname,
                  ...rates,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Box display={{ display: "flex", gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Monthly Basic"
                value={toSalary.MonthlyRate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Daily Rate"
                value={toSalary.DailyRate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Hourly Rate"
                value={toSalary.HourlyRate}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </Box>

        <CustomDataGrid
          columns={ColumnHeader}
          rows={empSalaryList}
          maxHeight={450}
          height={450}
          checkboxSelection={true}
          slots={{ noRowsOverlay: NoData }}
          onRowSelectionModelChange={(newSelection) => {
            const selectedRowsData = newSelection.map((id) => {
              const matchingRow = empSalaryList.find((row) => row.id === id);
              return {
                id,
                ERID: matchingRow?.ERID || "",
              };
            });

            setSelectedRows(selectedRowsData);
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            margin: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            color="secondary"
            variant="contained"
            onClick={() => console.log(selectedRows, toSalary, empSalary.data)}
          >
            New
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={saveEmployeeRates}
          >
            Save
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
