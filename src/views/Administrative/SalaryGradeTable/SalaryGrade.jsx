import { Box, Button, Paper, TextField } from "@mui/material";
import React, { useState } from "react";
import CustomDataGrid from "../../../components/CustomDataGrid";
import NoData from "../../../components/CustomDataTable/NoData";
import { hookContainer } from "../../../hooks/globalQuery";
import { http } from "../../../api/http";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const initialData = {
  SGName: "",
  MonthlyRate: "",
  DailyRate: "",
  HourlyRate: "",
};

export default function SalaryGrade() {
  const { data: salaryGrade } = hookContainer("/get-salary-grade");
  const queryClient = useQueryClient();

  const salaryGradeList = Array.isArray(salaryGrade)
    ? salaryGrade.map((row) => {
        return {
          ...row,
          id: row.SGID,
        };
      })
    : [];

  const [salary, setSalary] = useState(initialData);

  const formatTo2Decimals = (val) => {
    if (val === "" || isNaN(val)) return "";
    return parseFloat(val).toFixed(2);
  };

  const handleSetSalary = (key, value) => {
    if (key === "MonthlyRate") {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setSalary((prev) => ({
          ...prev,
          MonthlyRate: value, // keep raw string for typing
          DailyRate: formatTo2Decimals(num / 22.8),
          HourlyRate: formatTo2Decimals(num / 22.8 / 8),
        }));
      } else {
        setSalary((prev) => ({ ...prev, MonthlyRate: value }));
      }
    } else if (key === "DailyRate") {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setSalary((prev) => ({
          ...prev,
          DailyRate: value, // keep raw string
          MonthlyRate: formatTo2Decimals(num * 22.8),
          HourlyRate: formatTo2Decimals(num / 8),
        }));
      } else {
        setSalary((prev) => ({ ...prev, DailyRate: value }));
      }
    } else {
      setSalary((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const ColumnHeader = [
    {
      field: "SGName",
      headerName: "Salary Grade Name",
      flex: 1,
      renderCell: (params) => <Box sx={{ paddingLeft: 1 }}>{params.value}</Box>,
    },
    {
      field: "MonthlyRate",
      headerName: "Monthly Basic",
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

  const saveSalaryGrade = async () => {
    // Convert stored strings into numbers before sending
    const payload = {
      ...salary,
      MonthlyRate: parseFloat(salary.MonthlyRate) || 0,
      DailyRate: parseFloat(salary.DailyRate) || 0,
      HourlyRate: parseFloat(salary.HourlyRate) || 0,
    };

    const response = await http.post("/save-salary-grade", {
      dataVariable: payload,
    });
    if (response.data.success) {
      toast.success("added Salary Grade");
      queryClient.invalidateQueries({
        queryKey: ["/get-salary-grade"],
      });
      setSalary(initialData);
    }
  };

  return (
    <Box>
      <Paper>
        <CustomDataGrid
          columns={ColumnHeader}
          rows={salaryGradeList}
          maxHeight={450}
          height={450}
          slots={{ noRowsOverlay: NoData }}
        />
        <Box sx={{ display: "flex", gap: 1, margin: 2 }}>
          <TextField
            sx={{ flex: 1 }}
            label="Salary Grade Name"
            value={salary.SGName}
            onChange={(e) => handleSetSalary("SGName", e.target.value)}
          />
          <TextField
            sx={{ flex: 1 }}
            label="Monthly Basic"
            value={salary.MonthlyRate}
            onChange={(e) => handleSetSalary("MonthlyRate", e.target.value)}
          />
          <TextField
            sx={{ flex: 1 }}
            label="Daily Rate"
            value={salary.DailyRate}
            onChange={(e) => handleSetSalary("DailyRate", e.target.value)}
          />
          <TextField
            sx={{ flex: 1 }}
            label="Hourly Rate"
            value={salary.HourlyRate}
            InputProps={{ readOnly: true }}
          />
        </Box>
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
            onClick={() => setSalary(initialData)}
          >
            New
          </Button>
          <Button color="success" variant="contained" onClick={saveSalaryGrade}>
            Save
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
