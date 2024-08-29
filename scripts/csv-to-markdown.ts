import fs from "fs";
import path from "path";
import csv from "csv-parser";

type ReportData = {
  reportid: string;
  reportdate: string;
  reporttitle: string;
  securityresearcher: string;
  program: string;
  slug: string;
  reportType: string;
  severity: string;
  targetlink: string;
  impacts: string;
  description: string;
  proofofconcept: string;
};

const ReportTypes: { [key: string]: string } = {
  smart_contract: "Smart Contract",
  blockchain_dlt: "Blockchain/DLT",
  websites_and_applications: "Websites and Applications",
};

const ShortReportTypes: { [key: string]: string } = {
  smart_contract: "SC",
  blockchain_dlt: "BC",
  websites_and_applications: "W&A",
};

const ReportSeverities: { [key: string]: string } = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
  insight: "Insight",
};

function getLabelFromType(reportType: string): string {
  return ReportTypes[reportType] || reportType;
}

function getShortReportTypeLabel(reportType: string): string {
  return ShortReportTypes[reportType] || reportType;
}

function getLabelFromSeverity(reportSeverity: string): string {
  return ReportSeverities[reportSeverity] || reportSeverity;
}

function formatImpacts(impacts: string): string {
  return impacts
    .split("///")
    .map((impact) => `- ${impact.trim()}`)
    .join("\n");
}

function formatDate(date: Date) {
  // Array of month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Get the components of the date
  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()]; // Get the month name
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0'); // Format hours
  const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Format minutes
  const seconds = String(date.getUTCSeconds()).padStart(2, '0'); // Format seconds

  // Determine the suffix for the day
  const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                 (day % 10 === 2 && day !== 12) ? 'nd' :
                 (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

  // Construct the final formatted string
  return `${month} ${day}${suffix} ${year} at ${hours}:${minutes}:${seconds} UTC`;
}

function generateFileName(
  reportTitle: string,
  program: string,
  reportID: string,
  reportType: string,
  reportSeverity: string
): string {
  const sanitizedTitle = reportTitle.replace(/[^a-zA-Z_\- ]/g, "").trim();
  const truncatedTitle =
    sanitizedTitle.length > 50
      ? sanitizedTitle.slice(0, 47) + "..."
      : sanitizedTitle;
  return `${reportID} - [${getShortReportTypeLabel(
    reportType
  )} - ${getLabelFromSeverity(reportSeverity)}] ${truncatedTitle}.md`;
}

function generateFileContent(data: ReportData): string {
  const impactsList = formatImpacts(data.impacts);
  let content = `
# ${data.reporttitle}

Submitted on ${formatDate(new Date(data.reportdate))} by @${data.securityresearcher} for [${
    data.program
  }](https://immunefi.com/bounty/${data.slug}/)

Report ID: #${data.reportid}

Report type: ${getLabelFromType(data.reportType)}

Report severity: ${getLabelFromSeverity(data.severity)}

Target: ${data.targetlink}

Impacts:
${impactsList}

## Description
${data.description}`;

  if (data.proofofconcept) {
    content += `

${
  data.proofofconcept.search(new RegExp("# Proof of concept", "i")) !== -1
    ? ""
    : "## Proof of concept"
}
${data.proofofconcept}`;
  }

  return content;
}

function createProgramFolder(programName: string): string {
  const sanitizedProgramName = programName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const folderPath = path.join(process.cwd(), sanitizedProgramName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  return folderPath;
}

function createFiles(data: ReportData[]): void {
  data.forEach((row) => {
    const programFolder = createProgramFolder(row.program);
    const fileName = generateFileName(
      row.reporttitle,
      row.program,
      row.reportid,
      row.reportType,
      row.severity
    );
    const filePath = path.join(programFolder, fileName);
    console.log(`Creating file: ${filePath}`);
    const content = generateFileContent(row);
    fs.writeFileSync(filePath, content);
  });
}

function processCSV(filePath: string): void {
  const results: ReportData[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data: ReportData) => results.push(data))
    .on("end", () => {
      createFiles(results);
      console.log("Reports created successfully!");
    });
}

// Check if a file path is provided as a command-line argument
if (process.argv.length < 3) {
  console.error("Please provide the path to the CSV file as an argument.");
  console.error("Usage: ts-node csvToMarkdown.ts <path-to-csv-file>");
  process.exit(1);
}

const csvFilePath = process.argv[2];

// Check if the file exists
if (!fs.existsSync(csvFilePath)) {
  console.error(`The file "${csvFilePath}" does not exist.`);
  process.exit(1);
}

// Process the CSV file
processCSV(csvFilePath);
