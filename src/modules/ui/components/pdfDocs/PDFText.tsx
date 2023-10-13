import { StyleSheet, Text } from "@react-pdf/renderer";

function PDFText(props: React.ComponentProps<typeof Text>) {
  const styles = StyleSheet.create({
    text: {
      fontSize: 11,
      ...props.style,
      opacity: undefined,
    },
  });
  return <Text {...props} style={{ ...styles.text }} />;
}

export default PDFText;
