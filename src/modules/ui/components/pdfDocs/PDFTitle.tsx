import { StyleSheet, Text } from "@react-pdf/renderer";

function PDFTitle(props: React.ComponentProps<typeof Text>) {
  const styles = StyleSheet.create({
    text: {
      fontSize: 15,
      textAlign: "center",
      fontFamily: "Helvetica-Bold",
      ...props.style,
      opacity: undefined,
    },
  });
  return <Text {...props} style={{ ...styles.text }} />;
}

export default PDFTitle;
