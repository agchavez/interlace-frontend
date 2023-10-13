import { Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    padding: 6,
    fontSize: 10,
  },
});

interface TableCellProps {
  children?: string | number;
  style?: ReturnType<typeof StyleSheet.create>;
}

const TableCell = ({ children, style }: TableCellProps) => {
  return <Text style={{ ...styles.cell, ...style?.cell }}>{children}</Text>;
};

export default TableCell;
