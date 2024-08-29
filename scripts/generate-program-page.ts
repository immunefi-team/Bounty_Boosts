import fs from "fs";
import path from "path";

/**
 * File related functions
 */

type ProgramDirectory = {
  fullPath: string;
  name: string;
};

function getProgramDirectories(
  srcPath: string,
  ignore: string[] = []
): ProgramDirectory[] {
  const files = fs.readdirSync(srcPath);
  return files
    .filter((file) => {
      const fullPath = path.join(srcPath, file);
      return fs.statSync(fullPath).isDirectory() && !ignore.includes(file);
    })
    .map((dir) => ({ fullPath: path.join(srcPath, dir), name: dir }));
}

function listMarkdownFiles(dir: string, ignore: string[] = []) {
  let results: string[] = [];

  // Read the contents of the directory
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (file.endsWith(".md") && !ignore.includes(file)) {
      // Add markdown file to the results
      results.push(filePath);
    }
  });

  return results;
}

function searchContent(content: string, searchString: string) {
  // Read the file content
  const lines = content.split("\n");
  let result: string | null = null;
  for (const line of lines) {
    const regex = new RegExp(`${searchString}\\s+(.+)`, "i");
    const match = line.match(regex);

    if (match) {
      result = match[1]; // Capture the desired part
      break;
    }
  }
  return result;
}

/**
 * Report related functions
 */

enum Severity {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Insight = "Insight",
}

const SeverityOrder = {
  [Severity.Insight]: 1,
  [Severity.Low]: 2,
  [Severity.Medium]: 3,
  [Severity.High]: 4,
  [Severity.Critical]: 5,
};

type ReportMetadata = {
  filePath: string;
  reportType: string;
  reportSeverity: Severity;
};

function isReportSeverity(severity: string): severity is Severity {
  return Object.values(Severity).includes(severity as Severity);
}

function getReportMetadata(filePath: string): ReportMetadata | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const reportType = searchContent(content, "Report Type:");
    const reportSeverity = searchContent(content, "Report severity:");

    if (!reportType) {
      console.error(`Report Type not found in file: ${filePath}`);
    }

    if (!reportSeverity || !isReportSeverity(reportSeverity)) {
      console.error(`Report Severity not found in file: ${filePath}`);
    }

    return {
      filePath,
      reportType: reportType ?? "",
      reportSeverity: reportSeverity as Severity,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading file: ${error.message}`);
    }
    console.error(`Error reading file: ${filePath}`);
  }

  return null;
}

function groupReportsByType(reports: ReportMetadata[]) {
  const byReportType = reports.reduce((acc, report) => {
    acc[report.reportType] = acc[report.reportType] ?? [];
    acc[report.reportType].push(report);
    return acc;
  }, {} as Record<string, ReportMetadata[]>);

  return byReportType;
}

function groupReportsBySeverity(reports: ReportMetadata[]) {
  const reportsBySeverity = reports.reduce((acc, report) => {
    acc[report.reportSeverity] = acc[report.reportSeverity] ?? [];
    acc[report.reportSeverity].push(report);
    return acc;
  }, {} as Record<Severity, ReportMetadata[]>);

  return reportsBySeverity;
}

function getReportsGroupContent({
  groupName,
  reports,
}: {
  groupName: string;

  reports: ReportMetadata[];
}) {
  return {
    hashTag: `[${groupName}](<README.md#${sluggify(groupName)}>)`,
    content: `<details>
<summary>${groupName}</summary>

${reports
  .map((report) => {
    return `* [${path.basename(report.filePath, ".md")}](./${encodeURIComponent(
      path.basename(report.filePath)
    )})`;
  })
  .join("\n")}

</details>`,
  };
}

function sluggify(title: string) {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing spaces
    .replace(/[\s]+/g, "-") // Replace spaces with hyphens
    .replace(/[\/]+/g, "-") // Replace forward slashes with hyphens
    .replace(/[^\w\-]+/g, ""); // Remove all non-word characters (except hyphens)
}

function generateProgramReadme(directory: ProgramDirectory) {
  console.log("Processing: ", directory.name);
  const markdownFiles = listMarkdownFiles(directory.fullPath, ["README.md"]);
  const reports = markdownFiles
    .map((file) => getReportMetadata(file))
    .filter((report): report is ReportMetadata => report !== null);

  const reportsByType = groupReportsByType(reports);
  const reportsBySeverity = groupReportsBySeverity(reports)
  const contentByType = Object.entries(reportsByType).map(
    ([reportType, reports]) =>
      getReportsGroupContent({
        groupName: reportType,
        reports,
      })
  );
  const reportsBySeverityEntries = Object.entries(reportsBySeverity) as [Severity, ReportMetadata[]][];
  reportsBySeverityEntries.sort((entryA, entryB) => {
    const [severityA, _reportsA] = entryA;
    const [severityB, _reportsB] = entryB;
    return SeverityOrder[severityB] - SeverityOrder[severityA];
  });
  const contentBySeverity = reportsBySeverityEntries.map(
    ([reportSeverity, reports]) =>
      getReportsGroupContent({
        groupName: reportSeverity,
        reports,
      })
  );

  const content = `
# ${directory.name}

## Reports by Severity

${contentBySeverity.map((content) => content.hashTag).join(" | ")}
${contentBySeverity.map((content) => content.content).join("\n")}

## Reports by Type

${contentByType.map((content) => content.hashTag).join(" | ")}
${contentByType.map((content) => content.content).join("\n")}
`;

  const readmePath = path.join(directory.fullPath, "README.md");
  fs.writeFileSync(readmePath, content);
  console.log("README.md generated");
}

function main() {
  const directoryPath = path.join(__dirname, "../");
  const allDirectories = getProgramDirectories(directoryPath, [
    ".git",
    "node_modules",
    "scripts",
  ]);
  for (const directory of allDirectories) {
    generateProgramReadme(directory);
  }
}

main();
