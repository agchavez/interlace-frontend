import { View, StyleSheet } from "@react-pdf/renderer";
import TableCell from "./TableCell";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomColor: "black",
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 1,
  },
  cell: {},
});

export interface PDFTableHeaderProps {
  item: string[];
  cellStyles?: { [key: string]: string | number }[];
}

function PDFTableHeader({ item, cellStyles }: PDFTableHeaderProps) {
  return (
    <View style={styles.row}>
      {item.map((item, index) => (
        <TableCell
          key={item}
          style={{
            ...styles,
            ...(cellStyles
              ? { cell: { ...styles.cell, ...cellStyles[index] } }
              : undefined),
          }}
        >
          {item}
        </TableCell>
      ))}
    </View>
  );
}

export default PDFTableHeader;
