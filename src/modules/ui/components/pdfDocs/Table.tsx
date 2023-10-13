import { View, StyleSheet } from "@react-pdf/renderer";
import TableRow, { PDFTableRow } from "./TableRow";
import PDFTableHeader from "./TableHeader";

const styles = StyleSheet.create({
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
  },
});

interface ItemsTableProps {
  data: PDFTableRow[];
  header?: string[];
  headerCellsStyle?: { [key: string]: string | number }[];
  rowCellsStyle?: { [key: string]: string | number }[];
}

function PDFTable({
  data,
  header,
  headerCellsStyle,
  rowCellsStyle,
}: ItemsTableProps) {
  return (
    <View style={styles.table} wrap={false}>
      {header && <PDFTableHeader item={header} cellStyles={headerCellsStyle} />}
      {data.map((item) => (
        <TableRow item={item} cellStyles={rowCellsStyle} />
      ))}
    </View>
  );
}

export default PDFTable;
