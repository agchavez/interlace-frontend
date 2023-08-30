import { esES } from "@mui/x-data-grid";

export const tableBase = {
    localeText: esES.components.MuiDataGrid.defaultProps.localeText,
    className: "base__table",
    columnHeaderHeight: 35,
    style: { height: "60vh", width: "100%", cursor: "pointer" },
    pageSizeOptions: [15, 20, 50],
    disableColumnFilter: true,
    disableColumnMenu: true,
}
