export type JobType = "Import" | "Export";
export type Row = Record<string, string>;
export type Job = {
  fields: Record<string, string>;
  containers: Row[];
  income: Row[];
  expense: Row[];
  duties: Row[];
  parties: Row[];
  documents: Row[];
  activity: number;
  cargo: string;
  gates?: Row[];
  created?: string;
};
export const steps = [
  "Job Details",
  "Vessel & Voyage",
  "Cargo Details",
  "Parties",
  "Customs & Clearance",
  "Operations",
  "Income & Expense",
  "Review & Save",
];
export const voyages = [
  [
    "MV MSC EXAMPLE",
    "9876543",
    "125E",
    "004",
    "Shanghai",
    "Mundra",
    "12-Sep-2026",
    "14-Sep-2026",
    "MSC",
    "APMT",
  ],
  [
    "MV ONE INTEGRITY",
    "9781234",
    "088W",
    "002",
    "Singapore",
    "Nhava Sheva",
    "15-Sep-2026",
    "17-Sep-2026",
    "ONE",
    "JNPT",
  ],
  [
    "MV CMA CGM VICTORY",
    "9705678",
    "346N",
    "007",
    "Colombo",
    "Mundra",
    "18-Sep-2026",
    "20-Sep-2026",
    "CMA CGM",
    "MICT",
  ],
];
export function initialJob(type: JobType): Job {
  const exp = type === "Export";
  return {
    cargo: "Containerised",
    activity: exp ? 4 : 3,
    fields: {
      Client: exp ? "ABC Exports Pvt. Ltd." : "ABC Logistics Pvt. Ltd.",
      "Client / Exporter": "ABC Exports Pvt. Ltd.",
      "Job Date": "09-Sep-2026",
      "BL No.": exp ? "" : "MEDU123456789",
      "BL Date": exp ? "" : "08-Sep-2026",
      "Booking No.": "BK2026/001",
      "Booking Date": "05-Sep-2026",
      "Shipping Bill No.": "SB1234567",
      "Shipping Bill Date": "09-Sep-2026",
      "SB Date": "09-Sep-2026",
      "Job Reference": exp ? "ABC/EXP/2026/001" : "CUST/REF/2026/001",
      "Assigned To": "Rahul Sharma",
      Priority: exp ? "Urgent" : "Normal",
      "Branch / Location": "Mundra (INMUN)",
      "Shipment Type": "General Cargo",
      "Client Code": "ABC0001",
      GSTIN: "24ABCDE1234F1Z5",
      "HB/L No.": "HBL/2026/4587",
      "HB/L Date": "08-Sep-2026",
      "Service Type": exp ? "Full CHA Services" : "Customs Clearance",
      "Movement Type": "Port to ICD",
      "Job Status": "In Progress",
      "Sales Person": "Darshan K.",
      "Port of Loading (POL)": exp ? "Mundra (INMUN)" : "Shanghai (CNSHA)",
      "Port of Discharge (POD)": exp ? "Jebel Ali (AEJEA)" : "Mundra (INMUN)",
      "Final Destination": "Ahmedabad (INAMD)",
      "Country of Origin": exp ? "India" : "China",
      "Country of Destination": exp ? "UAE" : "India",
      "Mode of Transport": "Sea",
      "Shipping Line": "MSC (Mediterranean Shipping)",
      "Service / Rotation No.": "AE12",
      Incoterms: "FOB",
      "Job Description": exp
        ? "Export of Machinery - 3 x 40HC"
        : "Import of electronic goods as per invoice and packing list.",
      "Internal Remarks": "Handle with care. Temperature controlled cargo.",
      "Vessel Name": "MV MSC EXAMPLE",
      "IMO No.": "9876543",
      "Voyage No.": "125E",
      "Call No.": "004",
      "Call Sign": "V7ABC",
      "Vessel Type": "Container Vessel",
      Flag: "Panama",
      "Rotation No.": "R-2026-125",
      Service: "INMUN - AEJEA",
      Agent: "MSC Agency India Pvt. Ltd.",
      "Agent (Origin)": "MSC India Pvt. Ltd.",
      "Agent (Destination)": "MSC UAE LLC",
      "Terminal (POL)": "APM Terminals Mundra (APMT)",
      "Terminal (POD)": exp
        ? "DP World Jebel Ali (DPW)"
        : "APM Terminals Mundra (APMT)",
      Berth: "Berth No. 3",
      "ETD (from POL)": "12-Sep-2026",
      "ETA (at POD)": exp ? "15-Sep-2026" : "12-Sep-2026",
      "Shipping Instruction (SI) Date": "03-Sep-2026",
      "Shipping Instruction (SI) Cut-off": "08-Sep-2026",
      "VGM Cut-off": "07-Sep-2026",
      "SI Cut-off": "08-Sep-2026",
      "Gate-in Cut-off": "09-Sep-2026",
      "Port Cut-off": "10-Sep-2026",
      "Customs Cut-off (SB Filing)": "09-Sep-2026",
      "Cargo Closing": "11-Sep-2026",
      Commodity: exp ? "Machinery & Parts" : "Electronics",
      "HS Code": exp ? "8479.89" : "8542",
      "Cargo Description": exp
        ? "Used Construction Machinery and Spare Parts"
        : "Electronic goods, as per invoice and packing list.",
      "Package Type": "Box",
      "Net Weight": "45,200",
      "Volume (CBM)": exp ? "72.50" : "223.10",
      "FCL / LCL": "FCL",
      "Dangerous Goods": "No",
      "Marks & Numbers": exp ? "As per packing list" : "ABC/01-04",
      "Special Handling": "Normal",
      "Shipping Term (Incoterms)": "FOB",
      "Bill of Entry No.": "1234567",
      "BE Date": "08-Sep-2026",
      "BE Type": "Home Consumption",
      "Customs Location": "Mundra (INMUN)",
      "CHA Filing No.": "CHA/2026/4587",
      "IEC No.": "ABCDE1234F",
      "AD Code": "AD01234",
      "Port Code": "INMUN",
      Section: "46",
      Regime: "Normal",
      "Assessment Group": "Group III",
      "OOC Type": "Self",
      "Assessment Status": "Assessed",
      "Assessment Date": "09-Sep-2026",
      "Assessed By": "Self Assessment",
      "Examination Status": exp ? "Not Required" : "Examined",
      "Examination Date": "10-Sep-2026",
      "Exam Type": exp ? "Documentary" : "Normal",
      "Exam Location": "CFS",
      "Examiner Name": "Mr. R. Patel",
      "Exam Remarks": "No discrepancies found.",
      "OOC Status": "Pending",
      "Delivery Status": "Pending",
      "Shipping Bill Type": "Normal Export",
      "Scheme / Incentive": "Drawback",
      "FOB Value": "12,50,000",
      Currency: "USD",
      "Exchange Rate": "83.25",
      "INR Value": "1,04,06,250",
      "SB Filing Mode": "EDI (ICEGATE)",
      "SB Status": "Filed",
      "Duty Amount": "0.00",
      "LEO Status": "Pending",
      "Customer Payment Status": "Pending",
      "Expected Payment Date": "20-Sep-2026",
      "Vendor Payment Status": "Partial",
      "Amount Paid": "50,000",
      "Empty Pickup Date": "05-Sep-2026",
      "Depot / Location": "APM Mundra",
      Transporter: "Kutch Transport Co.",
      "Vehicle No.": "GJ12AB1234",
      "Stuffing Type": "Factory Stuffing",
      "Stuffing Date": "06-Sep-2026",
      "Stuffing Location": "Exporter Factory",
      "Stuffing Supervisor": "Amit Patel",
      Terminal: "APM Mundra",
    },
    containers: (exp
      ? [
          [
            "MEDU1234567",
            "40 HC",
            "SEAL001",
            "100",
            "18500",
            "18650",
            "Factory Stuffing",
            "Stuffed",
          ],
          [
            "MEDU1234568",
            "40 HC",
            "SEAL002",
            "80",
            "16200",
            "16300",
            "Factory Stuffing",
            "Stuffed",
          ],
          [
            "TLLU9876543",
            "20 GP",
            "SEAL003",
            "120",
            "12000",
            "12150",
            "CFS Stuffing",
            "Ready for Gate-in",
          ],
        ]
      : [
          [
            "MEDU1234567",
            "40 HC",
            "S123456",
            "120",
            "18500",
            "67.50",
            "FCL",
            "No",
          ],
          [
            "MEDU1234568",
            "40 HC",
            "S123457",
            "100",
            "16200",
            "65.00",
            "FCL",
            "No",
          ],
          [
            "TRHU8765432",
            "20 GP",
            "T998877",
            "80",
            "12500",
            "28.30",
            "FCL",
            "Yes",
          ],
          [
            "GESU7654321",
            "40 HC",
            "G112233",
            "90",
            "14800",
            "62.30",
            "FCL",
            "No",
          ],
        ]
    ).map((a, i) => ({
      id: String(i + 1),
      number: a[0],
      size: a[1],
      seal: a[2],
      packages: a[3],
      weight: a[4],
      vgm: a[5],
      stuffing: a[6],
      status: a[7],
    })),
    income: (exp
      ? [
          ["CHA Service Charges", "CHA Charges", "15000"],
          ["Documentation Charges", "Documentation", "2500"],
          ["Customs Service Charges", "Customs", "8000"],
          ["Other Income", "Other", "1500"],
        ]
      : [
          ["CHA Service Charges", "Customs Clearance", "15000"],
          ["Documentation Charges", "Documentation", "2500"],
          ["Transport Charges (Income)", "Transportation", "3000"],
          ["Other Income", "Other", "1500"],
        ]
    ).map((a, i) => ({
      id: String(i + 1),
      particulars: a[0],
      category: a[1],
      qty: "1",
      rate: a[2],
      gst: exp ? "18" : "0",
      remarks: [
        "BE filing and follow up",
        "Docs preparation",
        "Inland transport",
        "Misc charges",
      ][i],
      party: "ABC Exports Pvt. Ltd.",
      status: "Unbilled",
    })),
    expense: (exp
      ? [
          ["Shipping Line Charges", "Shipping Line", "12000"],
          ["Transport Charges", "Transport", "8500"],
          ["CFS Charges", "CFS", "4800"],
          ["Labour Charges", "Labour", "1200"],
          ["Other Expenses", "Other", "950"],
        ]
      : [
          ["Customs Duty", "Duty & Tax", "120000"],
          ["Port Charges", "Port Charges", "8500"],
          ["Transportation", "Transportation", "12000"],
          ["Document Charges", "Documentation", "3000"],
          ["Other Expense", "Other", "2500"],
        ]
    ).map((a, i) => ({
      id: String(i + 1),
      particulars: a[0],
      category: a[1],
      qty: "1",
      rate: a[2],
      gst: exp ? "18" : "0",
      remarks: "",
      party: [
        "MSC (India) Pvt. Ltd.",
        "Kutch Transport Co.",
        "APM Terminals",
        "Shree Labour Supply",
        "Local Vendor",
      ][i],
      status: "Unpaid",
    })),
    duties: [
      ["Basic Customs Duty", "120000"],
      ["IGST", "240000"],
      ["Social Welfare Surcharge", "12000"],
    ].map((a, i) => ({
      id: String(i + 1),
      head: a[0],
      amount: a[1],
      challan: "CHL123456",
      date: "09-Sep-2026",
      status: "Paid",
      payment: "09-Sep-2026",
      remarks: "-",
    })),
    parties: (exp
      ? [
          "Exporter",
          "Shipper",
          "Consignee",
          "Notify Party",
          "CHA / Agent",
          "Shipping Line",
          "Freight Forwarder",
          "Transporter",
          "Other Party (Optional)",
        ]
      : [
          "Importer",
          "Consignee",
          "Shipper",
          "Notify Party",
          "CHA / Agent",
          "Shipping Line",
          "Freight Forwarder",
          "Transporter",
        ]
    ).map((role, i) => ({
      id: String(i),
      role,
      name:
        role === "Shipping Line"
          ? "MSC (Mediterranean Shipping Co.)"
          : role === "CHA / Agent"
            ? "Portlinks India Pvt. Ltd."
            : role === "Transporter"
              ? "Kutch Transport Co."
              : role === "Freight Forwarder"
                ? exp
                  ? "Ocean Freight Forwarders Pvt. Ltd."
                  : ""
                : role.startsWith("Other")
                  ? ""
                  : exp
                    ? i === 2 || i === 3
                      ? "Global Equipment LLC"
                      : "ABC Exports Pvt. Ltd."
                    : role === "Shipper"
                      ? "XYZ Global Trading Co."
                      : "ABC Industries Pvt. Ltd.",
      address:
        exp && (i === 2 || i === 3)
          ? "Plot No. 455, Jebel Ali Free Zone, Dubai, UAE"
          : "Plot No. 12, GIDC, Gandhidham, Kutch - 370201, Gujarat, India",
      tax: "24ABCDE1234F1Z5",
      phone: "+91 98765 43210",
      email: exp ? "ramesh@abcexports.com" : "ramesh@abcind.com",
    })),
    documents: (exp
      ? ["Proforma Invoice.pdf", "Packing List.pdf", "Export Contract.pdf"]
      : ["BE Copy.pdf", "Exam Report.pdf"]
    ).map((name, i) => ({
      id: String(i),
      name,
      type: "PDF",
      size: i ? "980 KB" : "1.2 MB",
      date: "09-Sep-2026",
    })),
  };
}
export const number = (v: string | undefined) =>
  Number((v || "0").replaceAll(",", "")) || 0;
export const money = (v: number) =>
  v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export function totals(rows: Row[]) {
  return rows.reduce(
    (a, r) => {
      const base = number(r.qty) * number(r.rate),
        gst = (base * number(r.gst)) / 100;
      return {
        base: a.base + base,
        gst: a.gst + gst,
        total: a.total + base + gst,
      };
    },
    { base: 0, gst: 0, total: 0 },
  );
}
export function restoreDraft(type: JobType, raw: string | null): Job {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (
      value?.fields &&
      Array.isArray(value.containers) &&
      Array.isArray(value.income) &&
      Array.isArray(value.expense) &&
      Array.isArray(value.parties) &&
      Array.isArray(value.documents) &&
      Array.isArray(value.duties)
    )
      return value;
  } catch {}
  return initialJob(type);
}
