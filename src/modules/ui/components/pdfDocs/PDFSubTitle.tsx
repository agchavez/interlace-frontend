import { StyleSheet, Text } from "@react-pdf/renderer";

function PDFSubTitle(props: React.ComponentProps<typeof Text>) {
  const styles = StyleSheet.create({
    text: {
      fontSize: 12,
      textAlign: "left",
      fontFamily: "Helvetica-Bold",
      ...props.style,
      opacity: undefined,
    },
  });
  return <Text {...props} style={{ ...styles.text }} />;
}

export default PDFSubTitle;
