import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 8,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 11,
    marginLeft: 15,
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
});

interface PRDDocumentProps {
  prd: any;
}

export function PRDDocument({ prd }: PRDDocumentProps) {
  return (
    <Document>
      {/* Page 1: Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{prd.projectOverview.productName}</Text>
          <Text style={styles.subtitle}>{prd.projectOverview.tagline}</Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <Text style={styles.text}>{prd.projectOverview.description}</Text>

          <Text style={styles.subsectionTitle}>Target Audience</Text>
          <Text style={styles.text}>{prd.projectOverview.targetAudience}</Text>

          <Text style={styles.subsectionTitle}>Problem Statement</Text>
          <Text style={styles.text}>{prd.projectOverview.problemStatement}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purpose & Goals</Text>
          <Text style={styles.subsectionTitle}>Vision</Text>
          <Text style={styles.text}>{prd.purposeAndGoals.vision}</Text>

          <Text style={styles.subsectionTitle}>Key Objectives</Text>
          {prd.purposeAndGoals.keyObjectives.map((obj: string, i: number) => (
            <Text key={i} style={styles.bulletPoint}>
              • {obj}
            </Text>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 1 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 2: Tech Stack */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Technical Stack</Text>
        </View>

        {Object.entries(prd.techStack).map(([key, value]: [string, any]) => {
          if (key === "reasoning" || key === "additionalTools") return null;
          return (
            <View key={key} style={styles.section}>
              <Text style={styles.sectionTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.subsectionTitle}>{value.name}</Text>
              <Text style={styles.text}>{value.purpose}</Text>

              <Text style={{ ...styles.subsectionTitle, color: "#059669" }}>Pros</Text>
              {value.pros.map((pro: string, i: number) => (
                <Text key={i} style={styles.bulletPoint}>
                  • {pro}
                </Text>
              ))}

              <Text style={{ ...styles.subsectionTitle, color: "#DC2626" }}>Cons</Text>
              {value.cons.map((con: string, i: number) => (
                <Text key={i} style={styles.bulletPoint}>
                  • {con}
                </Text>
              ))}
            </View>
          );
        })}

        <Text style={styles.footer}>
          Page 2 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 3: Features */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Features</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MVP Features</Text>
          {prd.features.mvpFeatures.map((feature: any, i: number) => (
            <View key={i} style={{ marginBottom: 15 }}>
              <Text style={styles.subsectionTitle}>
                {i + 1}. {feature.name}
              </Text>
              <Text style={styles.text}>{feature.description}</Text>
              <Text style={{ ...styles.text, fontStyle: "italic" }}>
                User Story: {feature.userStory}
              </Text>

              <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 5 }}>
                Acceptance Criteria:
              </Text>
              {feature.acceptanceCriteria.map((criteria: string, j: number) => (
                <Text key={j} style={styles.bulletPoint}>
                  • {criteria}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 3 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 4: Architecture */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Technical Architecture</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Design</Text>
          <Text style={styles.text}>{prd.technicalArchitecture.systemDesign}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Models</Text>
          {prd.technicalArchitecture.dataModels.map((model: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionTitle}>{model.entityName}</Text>
              <Text style={styles.text}>{model.description}</Text>
              {model.fields.map((field: any, j: number) => (
                <Text key={j} style={{ fontSize: 9, marginLeft: 10 }}>
                  - {field.name}: {field.type} {field.required ? "*" : ""}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 4 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>

      {/* Page 5: Timeline */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Timeline & Risks</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Timeline</Text>
          <Text style={styles.text}>
            Estimated Duration: {prd.timeline.estimatedDuration}
          </Text>

          {prd.timeline.phases.map((phase: any, i: number) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={styles.subsectionTitle}>
                {phase.name} ({phase.duration})
              </Text>
              {phase.deliverables.map((deliverable: string, j: number) => (
                <Text key={j} style={styles.bulletPoint}>
                  • {deliverable}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks & Mitigation</Text>
          {prd.risks.map((risk: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionTitle}>
                {risk.category}: {risk.description}
              </Text>
              <Text style={styles.text}>Impact: {risk.impact}</Text>
              <Text style={styles.text}>Mitigation: {risk.mitigation}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 5 | {prd.projectOverview.productName} PRD
        </Text>
      </Page>
    </Document>
  );
}
