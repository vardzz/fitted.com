import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TailoredResume } from "@/lib/types";

export default function ResumePdf({ data }: { data: TailoredResume["resume"] }) {
  return (
    <Document>
      <Page size="A4">
        <View>
          <Text>{data?.name || "Resume"}</Text>
        </View>
      </Page>
    </Document>
  );
}
