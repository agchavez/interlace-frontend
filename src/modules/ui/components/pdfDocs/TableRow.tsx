import { Fragment } from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TableCell from "./TableCell";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  cell: {},
});

export interface TableRowProps {
  item: PDFTableRow;
  cellStyles?: { [key: string]: string | number }[];
}
export type PDFTableRow = (string | number | undefined)[];

function TableRow({ item, cellStyles }: TableRowProps) {
  return (
    <Fragment>
      <View style={styles.row}>
        {item.map((value, index) => {
          return (
            <TableCell
              key={value}
              style={{
                ...styles,
                ...(cellStyles
                  ? { cell: { ...styles.cell, ...cellStyles[index] } }
                  : undefined),
              }}
            >
              {value}
            </TableCell>
          );
        })}
      </View>
    </Fragment>
  );
}

export default TableRow;
