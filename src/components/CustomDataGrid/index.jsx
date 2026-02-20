import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";

const CustomDataGrid = ({
  columns,
  rows,
  slots,
  loading,
  hideFooter,
  hideFooterPagination,
  maxHeight,
  height,
  width,
  gridOverLay,
  onRowClick,
  columnGroupingModel,
  checkboxSelection,
  rowSelection,
  disableRowSelectionOnClick,
  onRowSelectionModelChange,
  getRowClassName,
  isRowSelectable,
  rowSelectionModel,
  rowid,
  onRowHover,
  onGridMouseLeave,
}) => {
  const theme = useTheme();

  const customGetRowClassName = (params) => {
    let baseClass = getRowClassName ? getRowClassName(params) : "";
    return params.isSelected ? `${baseClass} checked-row` : baseClass;
  };

  return (
    <DataGrid
      getRowHeight={() => 'auto'}
      getRowId={rowid}
      columnHeaderHeight={30}
      loading={loading}
      columns={columns}
      rows={rows}
      slots={slots}
      checkboxSelection={checkboxSelection}
      rowHeight={30}
      rowSelection={rowSelection}
      disableRowSelectionOnClick={disableRowSelectionOnClick}
      onRowClick={onRowClick}
      hideFooter={hideFooter}
      columnGroupingModel={columnGroupingModel}
      hideFooterPagination={hideFooterPagination}
      onRowSelectionModelChange={onRowSelectionModelChange}
      isRowSelectable={isRowSelectable}
      rowSelectionModel={rowSelectionModel}
      getRowClassName={customGetRowClassName}
      onCellMouseEnter={(params, event) => {
        if (typeof onRowHover === "function") {
          onRowHover(params.row, event);
        }
      }}
      onMouseLeave={() => {
        if (typeof onGridMouseLeave === "function") {
          onGridMouseLeave();
        }
      }}
      sx={{
        ...(width != null && { width }),
        "& .checked-row": {
          backgroundColor: "rgba(255, 0, 0, 0.3) !important",
        },
        "& .highlight-special-row": {
          backgroundColor: "#ff9800", // light orange
        },
        "--DataGrid-overlayHeight": gridOverLay,
        borderRadius: 0,
        height: height,
        maxHeight: maxHeight,
        fontSize: "12px",
        "&.MuiDataGrid-root": {
          border: 0,
          borderBottom:
            theme.palette.appSettings.paletteMode === "dark"
              ? "1px solid rgba(81, 81, 81, 1)"
              : "1px solid rgba(224, 224, 224, 1)",
        },
        "& .MuiDataGrid-container--top [role=row]": {
          background:
            theme.palette.appSettings.paletteMode === "dark"
              ? "rgb(40,50,61)"
              : "",
          borderBottom: "none",
        },
        ".MuiDataGrid-cell": {
          borderBottom:
            theme.palette.appSettings.paletteMode === "dark"
              ? "1px dashed rgb(46, 50, 54)"
              : "1px dashed rgb(241, 243, 244)",
          borderTop: "none",
          padding: 0,
        },
        "& .Mui-selected": {
          backgroundColor: "red !important",
          color: "white",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor:
            theme.palette.appSettings.paletteMode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
          cursor: "pointer",
        },
      }}
    />
  );
};

CustomDataGrid.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.array,
  getRowId: PropTypes.func,
  slots: PropTypes.object,
  loading: PropTypes.bool,
  hideFooter: PropTypes.bool,
  hideFooterPagination: PropTypes.bool,
  maxHeight: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gridOverLay: PropTypes.string,
  onRowClick: PropTypes.any,
  columnGroupingModel: PropTypes.array,
  checkboxSelection: PropTypes.bool,
  disableRowSelectionOnClick: PropTypes.bool,
  rowSelection: PropTypes.bool,
  onRowSelectionModelChange: PropTypes.func,
  getRowClassName: PropTypes.func,
  isRowSelectable: PropTypes.bool,
  rowSelectionModel: PropTypes.array,
  onRowHover: PropTypes.func,
  onGridMouseLeave: PropTypes.func,
};

export default CustomDataGrid;
