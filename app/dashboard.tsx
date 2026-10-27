"use client";
import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  Anchor,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  ArrowLeft,
  Bell,
  Box,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Clock,
  Container,
  Copy,
  Download,
  Eye,
  FilePlus2,
  FileText,
  FolderOpen,
  Home,
  IndianRupee,
  Layers,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Settings,
  Ship,
  Trash2,
  Truck,
  Upload,
  Users,
  Waves,
  X,
  Droplet,
  ShieldCheck,
  ChartNoAxesCombined,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui";
import { CargoTable } from "../components/cargo-table";
import {
  initialJob,
  restoreDraft,
  steps,
  voyages,
  number,
  money,
  totals,
  type Job,
  type JobType,
  type Row,
} from "./model";
const stepIcons = [
  FileText,
  Anchor,
  Container,
  Users,
  ShieldCheck,
  Settings,
  IndianRupee,
  Check,
];
const navItems: [string, LucideIcon][] = [
  ["Dashboard", Home],
  ["CHA Jobs", ClipboardList],
  ["Voyages", Ship],
  ["Clients", Users],
  ["Masters", Layers],
  ["Reports", ChartNoAxesCombined],
  ["Billing", FileText],
  ["Settings", Settings],
];
const selectValues: Record<string, string[]> = {
  Priority: ["Normal", "Urgent", "High", "Low"],
  "Assigned To": ["Rahul Sharma", "Darshan K.", "Amit Patel"],
  "Sales Person": ["Darshan K.", "Rahul Sharma"],
  "Shipment Type": ["General Cargo", "Project Cargo", "Hazardous Cargo"],
  "Service Type": ["Full CHA Services", "Customs Clearance", "Transportation"],
  "Movement Type": ["Port to ICD", "Port to CFS", "Direct Delivery"],
  "Job Status": ["In Progress", "Pending", "Completed"],
  "Country of Origin": ["India", "China", "UAE", "Panama"],
  "Country of Destination": ["India", "UAE", "China"],
  Flag: ["Panama", "India", "Liberia"],
  "Vessel Type": ["Container Vessel", "Bulk Carrier", "Tanker"],
  Incoterms: ["FOB", "CIF", "EXW", "CFR"],
  "FCL / LCL": ["FCL", "LCL"],
  Commodity: ["Machinery & Parts", "Electronics", "Textiles", "Chemicals"],
  "Package Type": ["Box", "Pallet", "Carton"],
  "Dangerous Goods": ["No", "Yes"],
  "Special Handling": ["Normal", "Temperature Controlled", "Fragile"],
  "BE Type": ["Home Consumption", "Warehousing", "Ex-Bond"],
  "Assessment Status": ["Assessed", "Pending", "Under Assessment"],
  "Examination Status": ["Not Required", "Examined", "Pending", "In Progress"],
  "Exam Type": ["Normal", "Documentary", "Physical"],
  "Exam Location": ["CFS", "Terminal", "Factory"],
  "OOC Status": ["Pending", "Released"],
  "Delivery Status": ["Pending", "Delivered"],
  "Shipping Bill Type": ["Normal Export", "Drawback", "DEEC"],
  "Scheme / Incentive": ["Drawback", "RoDTEP", "None"],
  "SB Status": ["Filed", "Pending", "Acknowledged"],
  "LEO Status": ["Pending", "Granted"],
  "Customer Payment Status": ["Pending", "Paid", "Partial"],
  "Vendor Payment Status": ["Partial", "Paid", "Pending"],
  "Stuffing Type": ["Factory Stuffing", "CFS Stuffing"],
  "Shipping Line": ["MSC (Mediterranean Shipping)", "ONE", "CMA CGM"],
};
function IconBox({ icon: Icon = FileText }: { icon?: LucideIcon }) {
  return (
    <span className="icon-box">
      <Icon size={22} />
    </span>
  );
}
function Panel({
  title,
  icon: Icon = FileText,
  children,
  action,
  className = "",
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">
        <Icon size={17} />
        <h3>{title}</h3>
        <span className="title-rule" />
        {action}
      </div>
      {children}
    </section>
  );
}
function Status({ value }: { value: string }) {
  return (
    <Badge
      tone={
        /Paid|Stuffed|Completed|Filed|Assessed|Granted|Delivered/.test(value)
          ? "green"
          : /Progress|Gate-in/.test(value)
            ? "blue"
            : /Unpaid|Yes/.test(value)
              ? "red"
              : /Pending/.test(value)
                ? "gray"
                : "amber"
      }
    >
      {value}
    </Badge>
  );
}
type Editor = {
  title: string;
  fields: [string, string][];
  values: Row;
  save: (r: Row) => void;
};
const FormContext = createContext<{
  f: Record<string, string>;
  field: (n: string, v: string) => void;
  errors: string[];
  packageTotal: number;
  weightTotal: number;
}>({ f: {}, field: () => {}, errors: [], packageTotal: 0, weightTotal: 0 });
function Field({
  name,
  required: mandatory = false,
  select = false,
  area = false,
  value,
  disabled = false,
}: {
  name: string;
  required?: boolean;
  select?: boolean;
  area?: boolean;
  value?: string;
  disabled?: boolean;
}) {
  const { f, field, errors, packageTotal, weightTotal } =
    useContext(FormContext);
  const val =
    value ??
    (name === "Total Packages"
      ? String(packageTotal)
      : name === "Gross Weight"
        ? String(weightTotal)
        : f[name]) ??
    "";
  const options =
    selectValues[name] ||
    [
      val,
      "Mundra (INMUN)",
      "Shanghai (CNSHA)",
      "Jebel Ali (AEJEA)",
      "Nhava Sheva (INNSA)",
    ].filter(Boolean);
  return (
    <label className={`field ${errors.includes(name) ? "has-error" : ""}`}>
      <span>
        {name}
        {mandatory && <b> *</b>}
      </span>
      {area ? (
        <textarea
          aria-label={name}
          value={val}
          onChange={(e) => field(name, e.target.value)}
          placeholder={`Enter ${name.toLowerCase()}...`}
          maxLength={500}
        />
      ) : select || selectValues[name] ? (
        <select
          aria-label={name}
          value={val}
          disabled={disabled}
          onChange={(e) => field(name, e.target.value)}
        >
          <option value="">Select {name.toLowerCase()}</option>
          {[...new Set([val, ...options])].filter(Boolean).map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      ) : (
        <div className="input-wrap">
          <Input
            aria-label={name}
            aria-invalid={errors.includes(name)}
            value={val}
            disabled={disabled}
            onChange={(e) => field(name, e.target.value)}
            placeholder={
              /Date|Cut-off|ETA|ETD|ATA|ATD/.test(name)
                ? "Select date"
                : `Enter ${name.toLowerCase()}`
            }
          />
          {/Date|Cut-off|ETA|ETD|ATA|ATD/.test(name) && (
            <CalendarDays size={15} />
          )}
        </div>
      )}
    </label>
  );
}
function Fields({ names, cols = 4 }: { names: string[]; cols?: number }) {
  return (
    <div className={`fields cols-${cols}`}>
      {names.map((n) => (
        <Field
          key={n}
          name={n.replace("*", "")}
          required={n.includes("*")}
          select={/Port of|Country|Terminal|Destination|Agent|Location|Branch|Service$|OOC Type|Regime|Section|Group|Assessed By|Filing Mode|Stuffing Location|Transporter|Supervisor/.test(
            n,
          )}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [type, setType] = useState<JobType | null>(null),
    [step, setStep] = useState(0),
    [jobs, setJobs] = useState<Record<JobType, Job>>({
      Import: initialJob("Import"),
      Export: initialJob("Export"),
    }),
    [ready, setReady] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [destination, setDestination] = useState("CHA Jobs"),
    [voyageMode, setVoyageMode] = useState("search"),
    [query, setQuery] = useState(""),
    [operationTab, setOperationTab] = useState("Container Operations"),
    [toast, setToast] = useState(""),
    [editor, setEditor] = useState<Editor | null>(null),
    [message, setMessage] = useState<{ title: string; text: string } | null>(
      null,
    ),
    [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null),
    formRef = useRef<HTMLDivElement>(null),
    localFiles = useRef(new Map<string, string>());
  useEffect(() => {
    try {
      setJobs({
        Import: restoreDraft(
          "Import",
          localStorage.getItem("portlinks-draft-Import"),
        ),
        Export: restoreDraft(
          "Export",
          localStorage.getItem("portlinks-draft-Export"),
        ),
      });
    } catch {}
    setReady(true);
  }, []);
  useEffect(
    () => () => {
      for (const url of localFiles.current.values()) URL.revokeObjectURL(url);
    },
    [],
  );
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);
  const job = jobs[type || "Import"],
    exp = type === "Export",
    f = job.fields;
  function update(change: Partial<Job>) {
    if (type)
      setJobs((old) => ({ ...old, [type]: { ...old[type], ...change } }));
  }
  function field(name: string, value: string) {
    update({ fields: { ...f, [name]: value } });
    setErrors((e) => e.filter((n) => n !== name));
  }
  function choose(t: JobType) {
    setType(t);
    setStep(0);
    setDestination("CHA Jobs");
    setErrors([]);
    setVoyageMode("search");
  }
  function go(n: number) {
    setStep(n);
    setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function saveDraft() {
    try {
      localStorage.setItem(`portlinks-draft-${type}`, JSON.stringify(job));
      setToast(`${type} draft saved on this browser`);
    } catch {
      setMessage({
        title: "Unable to save draft",
        text: "Browser storage is unavailable or full. Your current entries are still available in this session.",
      });
    }
  }
  function demo(title: string) {
    setMessage({
      title,
      text: "This action requires a connected external service. This prototype uses local sample data; no external request has been sent.",
    });
  }
  const required = [
    exp
      ? ["Client / Exporter", "Branch / Location", "Assigned To"]
      : [
          "Client",
          "Shipment Type",
          "BL No.",
          "BL Date",
          "Assigned To",
          "Port of Loading (POL)",
          "Port of Discharge (POD)",
        ],
    [
      "Vessel Name",
      "Voyage No.",
      "Shipping Line",
      "Port of Loading (POL)",
      "Port of Discharge (POD)",
      "ETD (from POL)",
      "ETA (at POD)",
    ],
    ["Commodity", "Cargo Description", "FCL / LCL"],
    [],
    exp
      ? [
          "Shipping Bill No.",
          "Shipping Bill Date",
          "Shipping Bill Type",
          "Port Code",
          "IEC No.",
          "LEO Status",
        ]
      : ["Bill of Entry No.", "BE Date", "BE Type", "Customs Location"],
    [],
    [],
    [],
  ];
  function validate(all = false) {
    const missing = (all ? required.flat() : required[step]).filter(
      (n) => !f[n]?.trim(),
    );
    if (all || step === 2) {
      if (job.containers.length === 0) missing.push("At least one container");
      if (
        job.containers.some(
          (r) =>
            !r.number.trim() ||
            !r.size.trim() ||
            ["packages", "weight", "vgm"].some(
              (k) =>
                r[k] === "" ||
                !Number.isFinite(Number(r[k].replaceAll(",", ""))) ||
                number(r[k]) < 0,
            ),
        )
      )
        missing.push("Valid container numbers, sizes and quantities");
    }
    if (
      (all || step === 3) &&
      job.parties.some(
        (p) =>
          [
            "Importer",
            "Exporter",
            "Shipper",
            "Consignee",
            "Shipping Line",
          ].includes(p.role) && !p.name.trim(),
      )
    )
      missing.push("Mandatory party details");
    setErrors(missing);
    if (missing.length) {
      setToast("Please complete the highlighted required details");
      return false;
    }
    return true;
  }
  function next() {
    if (step < 7) {
      if (validate()) go(step + 1);
      return;
    }
    if (!validate(true)) return;
    try {
      const id = `CHA/${exp ? "EXP" : "IMP"}/2026/${Date.now().toString().slice(-6)}`;
      const created = { ...job, created: id };
      const records = JSON.parse(
        localStorage.getItem("portlinks-jobs") || "[]",
      );
      records.push({ ...created, type });
      localStorage.setItem("portlinks-jobs", JSON.stringify(records));
      localStorage.setItem(`portlinks-draft-${type}`, JSON.stringify(created));
      update({ created: id });
      setMessage({
        title: "Job created successfully",
        text: `${id} has been saved in this browser. You can continue reviewing or print the job summary.`,
      });
    } catch {
      setMessage({
        title: "Job could not be saved",
        text: "Browser storage is unavailable or full. Please free browser storage and try again.",
      });
    }
  }
  function editRow(
    key: "containers" | "income" | "expense" | "duties",
    row: Row | undefined,
  ) {
    const specs: [string, string][] =
      key === "containers"
        ? [
            ["number", "Container No."],
            ["size", "Size / Type"],
            ["seal", "Seal No."],
            ["packages", "Packages"],
            ["weight", "Gross Weight (KG)"],
            ["vgm", exp ? "VGM (KG)" : "Volume (CBM)"],
            ["stuffing", exp ? "Stuffing Type" : "FCL / LCL"],
            ["status", exp ? "Status" : "IMDG"],
            ["pickup", "Empty Pickup Date"],
            ["stuffingDate", "Stuffing Date"],
            ["stuffingLocation", "Stuffing Location"],
            ["terminal", "Terminal"],
            ["gateIn", "Gate-in Date"],
            ["remarks", "Remarks"],
          ]
        : key === "duties"
          ? [
              ["head", "Duty Head"],
              ["amount", "Amount (INR)"],
              ["challan", "Challan No."],
              ["date", "Challan Date"],
              ["status", "Payment Status"],
              ["payment", "Payment Date"],
              ["remarks", "Remarks"],
            ]
          : [
              ["particulars", "Particulars"],
              ["category", "Category"],
              ["qty", "Quantity"],
              ["rate", "Rate (INR)"],
              ["gst", "GST %"],
              ["party", key === "income" ? "Customer" : "Vendor"],
              ["status", "Payment Status"],
              ["remarks", "Remarks"],
            ];
    setEditor({
      title: `${row ? "Edit" : "Add"} ${key === "containers" ? "Container" : key === "duties" ? "Duty" : key === "income" ? "Income" : "Expense"}`,
      fields: specs,
      values: row
        ? { ...row }
        : {
            id: crypto.randomUUID(),
            qty: "1",
            gst: exp ? "18" : "0",
            packages: "0",
            weight: "0",
            vgm: "0",
            stuffing: exp ? "Factory Stuffing" : "FCL",
            status:
              key === "containers"
                ? exp
                  ? "Ready for Gate-in"
                  : "No"
                : key === "duties"
                  ? "Pending"
                  : key === "income"
                    ? "Unbilled"
                    : "Unpaid",
          },
      save: (r) => {
        const numeric =
          key === "containers"
            ? ["packages", "weight", "vgm"]
            : key === "duties"
              ? ["amount"]
              : ["qty", "rate", "gst"];
        if (
          !r[specs[0][0]]?.trim() ||
          numeric.some(
            (n) =>
              !r[n]?.trim() ||
              !Number.isFinite(Number(r[n].replaceAll(",", ""))) ||
              number(r[n]) < 0,
          )
        ) {
          setToast("Enter a name and valid non-negative numbers");
          return;
        }
        update({
          [key]: row
            ? job[key].map((x) => (x.id === r.id ? r : x))
            : [...job[key], r],
        });
        setEditor(null);
      },
    });
  }
  function removeRow(
    key: "containers" | "income" | "expense" | "duties",
    id: string,
  ) {
    update({ [key]: job[key].filter((r) => r.id !== id) });
    setToast("Row removed");
  }
  function Actions({
    edit,
    remove,
  }: {
    edit: () => void;
    remove?: () => void;
  }) {
    return (
      <span className="row-actions">
        <Button size="icon" onClick={edit} aria-label="Edit row">
          <Pencil size={13} />
        </Button>
        {remove && (
          <Button
            size="icon"
            className="delete"
            onClick={remove}
            aria-label="Delete row"
          >
            <Trash2 size={13} />
          </Button>
        )}
      </span>
    );
  }
  const packageTotal = job.containers.reduce(
      (a, r) => a + number(r.packages),
      0,
    ),
    weightTotal = job.containers.reduce((a, r) => a + number(r.weight), 0),
    vgmTotal = job.containers.reduce((a, r) => a + number(r.vgm), 0),
    inc = totals(job.income),
    expense = totals(job.expense),
    margin = inc.total - expense.total;
  function ContainerTable({
    compact = false,
    operations = false,
  }: {
    compact?: boolean;
    operations?: boolean;
  }) {
    return (
      <CargoTable
        rows={job.containers}
        exp={exp}
        compact={compact}
        operations={operations}
        onChange={(id, key, value) =>
          update({
            containers: job.containers.map((r) =>
              r.id === id ? { ...r, [key]: value } : r,
            ),
          })
        }
        onEdit={(r) => editRow("containers", r)}
        onDelete={(id) => removeRow("containers", id)}
        onDeleteMany={(ids) => {
          update({
            containers: job.containers.filter((r) => !ids.includes(r.id)),
          });
          setToast(ids.length + " containers removed");
        }}
      />
    );
  }
  function FinancialTable({
    kind,
    compact = false,
  }: {
    kind: "income" | "expense";
    compact?: boolean;
  }) {
    const t = totals(job[kind]);
    return (
      <div className="table-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>
                Particulars <b>*</b>
              </TableHead>
              {!compact && (
                <>
                  <TableHead>
                    {exp
                      ? "Category"
                      : kind === "income"
                        ? "Service Type"
                        : "Expense Type"}
                  </TableHead>
                  <TableHead>{exp ? "Qty" : "Quantity"}</TableHead>
                  <TableHead>Rate (INR)</TableHead>
                </>
              )}
              <TableHead>Amount (INR)</TableHead>
              {!compact && exp && (
                <>
                  <TableHead>GST %</TableHead>
                  <TableHead>GST Amount</TableHead>
                  <TableHead>Total (INR)</TableHead>
                  <TableHead>
                    {kind === "income" ? "Customer" : "Vendor"}
                  </TableHead>
                  <TableHead>Payment Status</TableHead>
                </>
              )}
              {!compact && !exp && <TableHead>Remarks</TableHead>}
              {!compact && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {job[kind].map((r, i) => {
              const base = number(r.qty) * number(r.rate),
                gst = (base * number(r.gst)) / 100;
              return (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.particulars}</TableCell>
                  {!compact && (
                    <>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.qty}</TableCell>
                      <TableCell>{money(number(r.rate))}</TableCell>
                    </>
                  )}
                  <TableCell>{money(base)}</TableCell>
                  {!compact && exp && (
                    <>
                      <TableCell>{r.gst}%</TableCell>
                      <TableCell>{money(gst)}</TableCell>
                      <TableCell>{money(base + gst)}</TableCell>
                      <TableCell>{r.party}</TableCell>
                      <TableCell>
                        <Status value={r.status} />
                      </TableCell>
                    </>
                  )}
                  {!compact && !exp && (
                    <TableCell>{r.remarks || "-"}</TableCell>
                  )}
                  {!compact && (
                    <TableCell>
                      <Actions
                        edit={() => editRow(kind, r)}
                        remove={() => removeRow(kind, r.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={compact ? 2 : 5}>
                Total{" "}
                {compact ? (kind === "income" ? "Income" : "Expense") : ""}
              </TableCell>
              <TableCell>{money(t.base)}</TableCell>
              {!compact && exp && (
                <>
                  <TableCell />
                  <TableCell>{money(t.gst)}</TableCell>
                  <TableCell>{money(t.total)}</TableCell>
                  <TableCell colSpan={3} />
                </>
              )}
              {!compact && !exp && <TableCell colSpan={2} />}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
  function Documents({ title = "Attachments" }: { title?: string }) {
    return (
      <Panel title={title} icon={FolderOpen}>
        <div className="documents">
          <button
            className="dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            <Upload size={28} />
            <span>
              Drag & drop files here or
              <br />
              <strong>Browse Files</strong>
            </span>
            <small>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10 MB each)</small>
          </button>
          <div className="table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.documents.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="red-text">{r.type}</TableCell>
                    <TableCell>{r.size}</TableCell>
                    <TableCell>Rahul Sharma</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>
                      <span className="row-actions">
                        <Button
                          size="icon"
                          aria-label={`View ${r.name}`}
                          onClick={() => viewDocument(r)}
                        >
                          <Eye size={13} />
                        </Button>
                        <Button
                          size="icon"
                          aria-label={`Remove ${r.name}`}
                          className="delete"
                          onClick={() =>
                            update({
                              documents: job.documents.filter(
                                (x) => x.id !== r.id,
                              ),
                            })
                          }
                        >
                          <Trash2 size={13} />
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Panel>
    );
  }
  function viewDocument(r: Row) {
    const url = localFiles.current.get(r.id);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setMessage({
      title: r.name,
      text: r.local
        ? "This document was selected in an earlier session. Please select the file again to view its contents; only document metadata is saved in browser drafts."
        : "This is a sample document entry. Upload your own file to view its contents.",
    });
  }
  function addFiles(files: FileList | null) {
    if (!files) return;
    const allowed = /\.(pdf|docx?|xlsx?|jpe?g|png)$/i;
    const valid = Array.from(files).filter(
      (file) => file.size <= 10 * 1024 * 1024 && allowed.test(file.name),
    );
    const documents = valid.map((file) => {
      const id = crypto.randomUUID();
      localFiles.current.set(id, URL.createObjectURL(file));
      return {
        id,
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        size: Math.round(file.size / 1024) + " KB",
        date: "09-Sep-2026",
        local: "true",
      };
    });
    update({ documents: [...job.documents, ...documents] });
    setToast(
      valid.length === files.length
        ? valid.length + " document(s) added"
        : "Some files were rejected. Use a supported format under 10 MB.",
    );
  }
  function Timeline({ small = false }: { small?: boolean }) {
    const labels = exp
      ? [
          "Booking Confirmed",
          "Docs Received",
          "Shipping Bill Filed",
          "Container Allocation",
          "Stuffing",
          "Gate-in",
          "Examination",
          "LEO",
          "Loaded on Vessel",
          "Vessel Sailed",
          "BL Issued",
        ]
      : [
          "Documentation",
          "BE Filed",
          "Assessment",
          "Examination",
          "Duty Payment",
          "OOC",
          "Gate-out",
          "Delivery",
          "Job Completed",
        ];
    return (
      <div className={`timeline ${small ? "mini" : ""}`}>
        {labels.map((l, i) => (
          <button
            key={l}
            onClick={() => {
              if (step === 5) {
                update({ activity: i });
                setToast(`Current activity: ${l}`);
              }
            }}
            title={l}
            className={
              i < job.activity ? "done" : i === job.activity ? "current" : ""
            }
          >
            <span>{i < job.activity ? <Check size={12} /> : i + 1}</span>
            <strong>{l}</strong>
            <small>
              {i < job.activity
                ? exp
                  ? "06-Sep-2026"
                  : "09-Sep-2026"
                : i === job.activity
                  ? "In Progress"
                  : "Pending"}
            </small>
          </button>
        ))}
      </div>
    );
  }
  function StatCards() {
    return (
      <div className="stat-cards">
        <div className="stat green">
          <IndianRupee />
          <span>
            Total Income<strong>₹ {money(inc.total)}</strong>
            <small>
              {exp ? `Incl. GST ₹ ${money(inc.gst)}` : "Job-wise income"}
            </small>
          </span>
        </div>
        <div className="stat red">
          <IndianRupee />
          <span>
            Total Expense<strong>₹ {money(expense.total)}</strong>
            <small>
              {exp ? `Incl. GST ₹ ${money(expense.gst)}` : "Job-wise expense"}
            </small>
          </span>
        </div>
        <div className="stat blue">
          <ChartNoAxesCombined />
          <span>
            {exp ? "Estimated Profit / (Loss)" : "Job Margin"}
            <strong className={margin < 0 ? "red-text" : ""}>
              ₹ {money(margin)}
            </strong>
          </span>
        </div>
        <div className="stat purple">
          <ChartNoAxesCombined />
          <span>
            Margin %
            <strong>
              {inc.total ? ((margin / inc.total) * 100).toFixed(2) : "0.00"}%
            </strong>
          </span>
        </div>
      </div>
    );
  }
  function JobDetails() {
    return exp ? (
      <>
        <Panel title="Basic Job Information" icon={BriefcaseBusiness}>
          <div className="fields export-basics">
            <Field name="Client / Exporter" required select />
            <Field name="Booking No." />
            <Field name="Booking Date" />
            <Field name="Shipping Bill No." />
            <Field name="SB Date" />
            <Field name="BL No." />
            <Field name="BL Date" />
          </div>
          <div className="address-strip">
            <strong>{f["Client / Exporter"]}</strong>
            <p>Plot No. 12, GIDC, Gandhidham, Kutch - 370201, Gujarat, India</p>
            <p>
              GSTIN: 24ABCDE1234F1Z5　 |　 IEC: ABCDE1234F　 |　 PAN: ABCDE1234F
            </p>
            <p>
              Contact: Mr. Ramesh Patel　 |　 +91 98765 43210　 |　
              ramesh@abcexports.com
            </p>
          </div>
          <Fields
            cols={5}
            names={[
              "Branch / Location*",
              "Job Reference",
              "Priority",
              "Job Description",
              "Assigned To*",
            ]}
          />
        </Panel>
        <Panel title="Additional Information" icon={FilePlus2}>
          <Fields
            cols={6}
            names={[
              "Service Type",
              "Incoterms",
              "Country of Origin",
              "Final Destination",
              "Port of Loading (POL)*",
              "Port of Discharge (POD)*",
            ]}
          />
        </Panel>
        <Panel title="Important Dates" icon={CalendarDays}>
          <Fields
            cols={6}
            names={[
              "Shipping Instruction (SI) Date",
              "VGM Cut-off",
              "SI Cut-off",
              "Gate-in Cut-off",
              "ETD (from POL)",
              "ETA (at POD)",
            ]}
          />
        </Panel>
        <Documents />
      </>
    ) : (
      <>
        <Panel title="Job Information" icon={Anchor}>
          <Fields
            names={[
              "Client*",
              "Shipment Type*",
              "Client Code",
              "GSTIN",
              "BL No.*",
              "BL Date*",
              "Job Reference",
              "HB/L No.",
              "HB/L Date",
              "Service Type",
              "Movement Type",
              "Job Status",
              "Branch / Location",
              "Assigned To*",
              "Sales Person",
              "Priority",
            ]}
          />
        </Panel>
        <Panel title="Trade & Route Information" icon={MapPin}>
          <Fields
            names={[
              "Port of Loading (POL)*",
              "Port of Discharge (POD)*",
              "Final Destination",
              "Country of Origin",
              "Country of Destination",
              "Mode of Transport",
              "Shipping Line",
              "Service / Rotation No.",
            ]}
          />
        </Panel>
        <Panel title="Description & Remarks" icon={FileText}>
          <div className="fields cols-2">
            <Field name="Job Description" area />
            <Field name="Internal Remarks" area />
          </div>
        </Panel>
      </>
    );
  }
  function Voyage() {
    return exp ? (
      <>
        <div className="fields vessel-columns">
          <Panel title="Vessel Information" icon={Ship}>
            <Field name="Vessel Name" required select />
            <div className="vessel-profile">
              <div className="vessel-illustration">
                <Ship size={66} />
                <Waves size={64} />
              </div>
              <div>
                <strong>{f["Vessel Name"]}</strong>
                <div className="fields cols-2">
                  <span>
                    IMO No.<b>{f["IMO No."]}</b>
                  </span>
                  <span>
                    Call Sign<b>{f["Call Sign"]}</b>
                  </span>
                  <span>
                    Vessel Type<b>{f["Vessel Type"]}</b>
                  </span>
                  <span>
                    Flag<b>{f.Flag}</b>
                  </span>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="Voyage Information" icon={Anchor}>
            <Fields
              names={[
                "Voyage No.*",
                "Call No.",
                "Rotation No.",
                "Shipping Line*",
              ]}
            />
            <Fields
              cols={3}
              names={["Service*", "Agent (Origin)", "Agent (Destination)"]}
            />
            <Fields cols={2} names={["Terminal (POL)*", "Terminal (POD)*"]} />
          </Panel>
        </div>
        <Panel title="Port & Schedule Details" icon={MapPin}>
          <Fields
            cols={7}
            names={[
              "Port of Loading (POL)*",
              "Port of Discharge (POD)*",
              "Final Destination",
              "ETD (from POL)*",
              "ATD (from POL)",
              "ETA (at POD)*",
              "ATA (at POD)",
            ]}
          />
          <div className="route">
            <span>
              🇮🇳 <b>{f["Port of Loading (POL)"]}</b>
            </span>
            <div>
              <Ship size={34} />
              <span>
                Transit Time <b>3 Days</b>
              </span>
            </div>
            <span>
              🇦🇪 <b>{f["Port of Discharge (POD)"]}</b>
            </span>
          </div>
        </Panel>
        <Panel title="Cut-off Dates (Export)" icon={Clock}>
          <Fields
            cols={6}
            names={[
              "Shipping Instruction (SI) Cut-off",
              "VGM Cut-off",
              "Gate-in Cut-off",
              "Port Cut-off",
              "Customs Cut-off (SB Filing)",
              "Cargo Closing",
            ]}
          />
          <Field name="Voyage Remarks" area />
        </Panel>
      </>
    ) : (
      <>
        <div className="subtabs">
          <button
            className={voyageMode === "search" ? "active" : ""}
            onClick={() => setVoyageMode("search")}
          >
            <span>1</span>Search Existing Voyage
          </button>
          <button
            className={voyageMode === "new" ? "active" : ""}
            onClick={() => setVoyageMode("new")}
          >
            <span>2</span>Enter New Voyage
          </button>
        </div>
        {voyageMode === "search" ? (
          <>
            <Panel
              title="Search Vessel / Voyage / IMO No. / Call No."
              icon={Search}
            >
              <div className="voyage-search">
                <Input
                  placeholder="Type vessel name, voyage no. or IMO no..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  variant="default"
                  onClick={() =>
                    setToast(
                      `${voyages.filter((v) => v.join(" ").toLowerCase().includes(query.toLowerCase())).length} voyages found`,
                    )
                  }
                >
                  <Search size={16} />
                  Search
                </Button>
              </div>
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        "Select",
                        "Vessel Name",
                        "IMO No.",
                        "Voyage No.",
                        "Call No.",
                        "POL",
                        "POD",
                        "ETA",
                        "ETD",
                        "Shipping Line",
                        "Terminal",
                      ].map((x) => (
                        <TableHead key={x}>{x}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voyages
                      .filter((v) =>
                        v.join(" ").toLowerCase().includes(query.toLowerCase()),
                      )
                      .map((v) => (
                        <TableRow
                          key={v[1]}
                          className={
                            f["IMO No."] === v[1] ? "selected-row" : ""
                          }
                        >
                          <TableCell>
                            <input
                              type="radio"
                              name="voyage"
                              aria-label={`Select ${v[0]}`}
                              checked={f["IMO No."] === v[1]}
                              onChange={() => {
                                update({
                                  fields: {
                                    ...f,
                                    "Vessel Name": v[0],
                                    "IMO No.": v[1],
                                    "Voyage No.": v[2],
                                    "Call No.": v[3],
                                    "Port of Loading (POL)": v[4],
                                    "Port of Discharge (POD)": v[5],
                                    "ETA (at POD)": v[6],
                                    "ETD (from POL)": v[7],
                                    "Shipping Line": v[8],
                                    "Terminal (POD)": v[9],
                                  },
                                });
                              }}
                            />
                          </TableCell>
                          {v.map((x, i) => (
                            <TableCell key={i}>{x}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {voyages.filter((v) =>
                  v.join(" ").toLowerCase().includes(query.toLowerCase()),
                ).length === 0 && (
                  <p className="empty">
                    No voyages found. Try another search or enter a new voyage.
                  </p>
                )}
              </div>
            </Panel>
            <Panel title="Selected Voyage Details" icon={Ship}>
              <Fields
                names={[
                  "Vessel Name*",
                  "Voyage No.*",
                  "ETA (at POD)*",
                  "Shipping Line*",
                  "IMO No.",
                  "Port of Loading (POL)*",
                  "ETD (from POL)",
                  "Agent",
                  "Call No.",
                  "Port of Discharge (POD)*",
                  "ATA (at POD)",
                  "Terminal (POD)",
                  "Vessel Type",
                  "Final Destination",
                  "ATD (from POL)",
                  "Berth",
                  "Flag",
                  "Country of Origin",
                  "Country of Destination",
                  "Voyage Remarks",
                ]}
              />
            </Panel>
          </>
        ) : (
          <>
            <Panel title="Enter New Voyage" icon={Ship}>
              <Fields
                names={[
                  "Vessel Name*",
                  "IMO No.*",
                  "Call Sign",
                  "Vessel Type*",
                  "Voyage No.*",
                  "Shipping Line*",
                  "Flag*",
                  "Service / Rotation No.",
                ]}
              />
            </Panel>
            <Panel title="Port & Schedule Information" icon={Anchor}>
              <Fields
                names={[
                  "Port of Loading (POL)*",
                  "Port of Discharge (POD)*",
                  "Final Destination*",
                  "Country of Destination*",
                  "ETD (from POL)*",
                  "ETA (at POD)*",
                  "ATD (from POL)",
                  "ATA (at POD)",
                ]}
              />
            </Panel>
            <Panel title="Additional Details" icon={FileText}>
              <Fields
                names={["Shipping Line*", "Agent", "Terminal (POD)", "Berth"]}
              />
              <Field name="Voyage Remarks" area />
            </Panel>
          </>
        )}
      </>
    );
  }
  function Cargo() {
    return (
      <>
        <Panel
          title="Container Details"
          icon={Container}
          action={
            <>
              <Button
                size="sm"
                onClick={() => editRow("containers", undefined)}
              >
                <Plus size={14} />
                Add Container
              </Button>
              <Button
                size="sm"
                onClick={() => demo("Import containers from Excel")}
              >
                <Upload size={14} />{" "}
                {exp ? "Import from Excel" : "Import Containers"}
              </Button>
              <Button size="sm" onClick={() => demo("Bulk container actions")}>
                <MoreVertical size={15} />
              </Button>
            </>
          }
        >
          {ContainerTable({})}
        </Panel>
        <Panel title="Cargo Information" icon={Box}>
          <div className="fields cargo-top">
            <Field name="Commodity" required select />
            {exp && <Field name="HS Code" />}
            <Field name="Cargo Description" required area />
            {!exp && (
              <>
                <Field name="Country of Origin" select />
                <Field name="Final Destination" select />
              </>
            )}
          </div>
          {exp ? (
            <>
              <Fields
                cols={6}
                names={[
                  "Package Type*",
                  "Total Packages",
                  "Gross Weight",
                  "Net Weight",
                  "Volume (CBM)",
                  "FCL / LCL*",
                ]}
              />
              <Fields
                cols={5}
                names={[
                  "Dangerous Goods",
                  "Country of Origin",
                  "Marks & Numbers",
                  "Special Handling",
                  "Shipping Term (Incoterms)",
                ]}
              />
            </>
          ) : (
            <Fields
              names={[
                "FCL / LCL",
                "HS Code",
                "Marks & Numbers",
                "Special Instructions / Remarks",
              ]}
            />
          )}
          <p className="calculated-note">
            Calculated from containers: {money(packageTotal)} packages ·{" "}
            {money(weightTotal)} KG
          </p>
        </Panel>
        {exp ? (
          <Panel
            title="Container Level Details (Optional)"
            icon={ClipboardList}
            action={
              <Button
                size="sm"
                onClick={() =>
                  setMessage({
                    title: "Container columns",
                    text: "Container number, pickup date, stuffing location, stuffing date, VGM, terminal and gate-in date are shown. Edit a container to update its main details.",
                  })
                }
              >
                Show/Hide Columns
              </Button>
            }
          >
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "#",
                      "Container No.",
                      "Empty Pickup Date",
                      "Stuffing Location",
                      "Stuffing Date",
                      "VGM (KG)",
                      "Terminal",
                      "Gate-in Date",
                      "Remarks",
                      "Actions",
                    ].map((x) => (
                      <TableHead key={x}>{x}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.containers.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.number}</TableCell>
                      <TableCell>{r.pickup || "05-Sep-2026"}</TableCell>
                      <TableCell>
                        {r.stuffingLocation || "Exporter Factory"}
                      </TableCell>
                      <TableCell>{r.stuffingDate || "06-Sep-2026"}</TableCell>
                      <TableCell>{money(number(r.vgm))}</TableCell>
                      <TableCell>{r.terminal || "APM Mundra"}</TableCell>
                      <TableCell>{r.gateIn || "09-Sep-2026"}</TableCell>
                      <TableCell>{r.remarks || "–"}</TableCell>
                      <TableCell>
                        <Actions edit={() => editRow("containers", r)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Panel>
        ) : (
          <Panel title="Additional Information" icon={FileText}>
            <Field name="Internal Remarks" />
          </Panel>
        )}
      </>
    );
  }
  function editParty(p: Row) {
    setEditor({
      title: `Edit ${p.role}`,
      fields: [
        ["name", "Company Name"],
        ["address", "Address"],
        ["tax", "GSTIN / Tax No."],
        ["phone", "Contact Number"],
        ["email", "Email"],
      ],
      values: { ...p },
      save: (r) => {
        if (!r.name?.trim()) {
          setToast("Company name is required");
          return;
        }
        update({ parties: job.parties.map((x) => (x.id === r.id ? r : x)) });
        setEditor(null);
      },
    });
  }
  function Parties() {
    return (
      <>
        <div className={`party-grid ${exp ? "export" : "import"}`}>
          {job.parties.map((p, i) => (
            <section className="party-card" key={p.id}>
              <div className="party-heading">
                <span className={`party-icon color-${i % 6}`}>
                  <Users size={17} />
                </span>
                <h3>
                  {p.role}
                  {[
                    "Importer",
                    "Exporter",
                    "Shipper",
                    "Consignee",
                    "Shipping Line",
                  ].includes(p.role) && <b> *</b>}
                </h3>
                {!exp && i < 3 && <Badge tone="red">Mandatory</Badge>}
                <Button size="sm" onClick={() => editParty(p)}>
                  <Pencil size={12} />
                  Edit
                </Button>
              </div>
              <div className="party-select">
                <Input
                  aria-label={p.role}
                  value={p.name}
                  placeholder={`Select ${p.role}...`}
                  onChange={(e) =>
                    update({
                      parties: job.parties.map((x) =>
                        x.id === p.id ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                />
                {exp && (
                  <Button size="sm" onClick={() => editParty(p)}>
                    <Plus size={13} />
                    Add New
                  </Button>
                )}
              </div>
              <div className={exp ? "party-details" : "address-strip"}>
                {p.name ? (
                  <>
                    <strong>{!exp ? p.name : ""}</strong>
                    <p>
                      <MapPin size={13} />
                      {p.address}
                    </p>
                    <p>
                      <BriefcaseBusiness size={13} />
                      GSTIN: {p.tax}
                    </p>
                    <p>
                      <Users size={13} />
                      {p.phone}
                    </p>
                    <p>
                      <FileText size={13} />
                      {p.email}
                    </p>
                  </>
                ) : (
                  <p className="muted">No details available</p>
                )}
              </div>
            </section>
          ))}
        </div>
        <Panel title="Party Notes" icon={FileText}>
          <Field name="Party Notes" area />
        </Panel>
      </>
    );
  }
  function DutyTable() {
    return (
      <Panel
        title="Duty & Payment Details"
        icon={IndianRupee}
        action={
          <Button size="sm" onClick={() => editRow("duties", undefined)}>
            <Plus size={14} />
            Add Duty
          </Button>
        }
      >
        <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Sr. No.",
                  "Duty Head",
                  "Amount (INR)",
                  "Challan No.",
                  "Challan Date",
                  "Payment Status",
                  "Payment Date",
                  "Remarks",
                  "Actions",
                ].map((x) => (
                  <TableHead key={x}>{x}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {job.duties.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.head}</TableCell>
                  <TableCell>{money(number(r.amount))}</TableCell>
                  <TableCell>{r.challan}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>
                    <Status value={r.status} />
                  </TableCell>
                  <TableCell>{r.payment}</TableCell>
                  <TableCell>{r.remarks}</TableCell>
                  <TableCell>
                    <Actions
                      edit={() => editRow("duties", r)}
                      remove={() => removeRow("duties", r.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell>
                  {money(job.duties.reduce((a, r) => a + number(r.amount), 0))}
                </TableCell>
                <TableCell colSpan={6} />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Panel>
    );
  }
  function Customs() {
    return exp ? (
      <>
        <div className="fields customs-columns">
          <Panel title="Shipping Bill Details" icon={FileText}>
            <Fields
              cols={3}
              names={[
                "Shipping Bill No.*",
                "Shipping Bill Date*",
                "Shipping Bill Type*",
                "Port Code*",
                "IEC No.*",
                "AD Code*",
                "Scheme / Incentive",
                "FOB Value*",
                "Exchange Rate",
                "SB Filing Mode",
                "SB Status",
                "INR Value",
              ]}
            />
          </Panel>
          <Panel title="IGM / CUS Details (Optional)" icon={FileText}>
            <Fields
              cols={2}
              names={[
                "IGM No.",
                "IGM Date",
                "CUS No.",
                "CUS Date",
                "FOB (As per CUS)",
              ]}
            />
            <Field name="IGM Remarks" area />
          </Panel>
        </div>
        <div className="fields cols-3">
          <Panel title="Assessment Details" icon={ClipboardList}>
            <Fields
              cols={2}
              names={[
                "Assessment Status*",
                "Assessment Date",
                "Assessment No.",
                "Duty Amount",
                "Exam Required",
                "Exam Type",
              ]}
            />
          </Panel>
          <Panel title="Examination Details" icon={Search}>
            <Fields
              cols={2}
              names={[
                "Examination Status*",
                "Examination Date",
                "Exam Location",
                "Examiner Name",
              ]}
            />
            <Field name="Exam Remarks" area />
          </Panel>
          <Panel title="Let Export Order (LEO)" icon={ShieldCheck}>
            <Fields
              cols={2}
              names={[
                "LEO Status*",
                "LEO Date",
                "LEO No. / Reference",
                "LEO Valid Till",
              ]}
            />
            <Field name="Customs Remarks" area />
          </Panel>
        </div>
        <Documents title="Supporting Documents" />
      </>
    ) : (
      <>
        <Panel title="Bill of Entry Details" icon={FileText}>
          <Fields
            cols={5}
            names={[
              "Bill of Entry No.*",
              "BE Date*",
              "BE Type*",
              "Customs Location*",
              "CHA Filing No.",
            ]}
          />
          <Fields
            cols={7}
            names={[
              "IEC No.",
              "AD Code",
              "Port Code",
              "Section",
              "Regime",
              "Assessment Group",
              "OOC Type",
            ]}
          />
        </Panel>
        <Panel title="Assessment & Examination" icon={ClipboardList}>
          <Fields
            cols={6}
            names={[
              "Assessment Status",
              "Assessment Date",
              "Assessed By",
              "Examination Status",
              "Examination Date",
              "Exam Type",
            ]}
          />
          <Fields
            cols={3}
            names={["Exam Location", "Examiner Name", "Exam Remarks"]}
          />
        </Panel>
        <DutyTable />
        <Panel title="Out of Charge (OOC) / Delivery" icon={Truck}>
          <Fields
            cols={7}
            names={[
              "OOC Status",
              "OOC Date",
              "OOC No.",
              "Gate Out Date",
              "Delivery Status",
              "Delivery Date",
              "Delivery Remarks",
            ]}
          />
        </Panel>
      </>
    );
  }
  function GateTable() {
    const rows =
      job.gates ??
      job.containers
        .slice(0, 3)
        .map((r, i) => ({
          id: r.id,
          container: r.number,
          activity: i === 2 ? "Gate-out" : "Gate-in",
          date: i === 2 ? "" : "09-Sep-2026 08:30",
          location: "Terminal",
          remarks: "-",
        }));
    function editGate(row?: Row) {
      setEditor({
        title: row ? "Edit Gate Record" : "Add Gate Record",
        fields: [
          ["container", "Container No."],
          ["activity", "Activity"],
          ["date", "Date & Time"],
          ["location", "Location"],
          ["remarks", "Remarks"],
        ],
        values: row
          ? { ...row }
          : {
              id: crypto.randomUUID(),
              activity: "Gate-in",
              location: "Terminal",
            },
        save: (r) => {
          if (!r.container?.trim() || !r.activity?.trim()) {
            setToast("Container and activity are required");
            return;
          }
          update({
            gates: row
              ? rows.map((x) => (x.id === r.id ? r : x))
              : [...rows, r],
          });
          setEditor(null);
        },
      });
    }
    return (
      <>
        <div className="gate-toolbar">
          <Button size="sm" onClick={() => editGate()}>
            <Plus size={13} />
            Add Record
          </Button>
        </div>
        <div className="table-scroll">
          <Table aria-label="Gate in and gate out records">
            <TableHeader>
              <TableRow>
                {[
                  "Sr.",
                  "Container No.",
                  "Activity",
                  "Date & Time",
                  "Location",
                  "Remarks",
                  "Actions",
                ].map((n) => (
                  <TableHead key={n}>{n}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.container}</TableCell>
                  <TableCell>{r.activity}</TableCell>
                  <TableCell>{r.date || "–"}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell>{r.remarks}</TableCell>
                  <TableCell>
                    <Actions
                      edit={() => editGate(r)}
                      remove={() =>
                        update({ gates: rows.filter((x) => x.id !== r.id) })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }
  function Operations() {
    return (
      <>
        <Panel title="Operational Milestones" icon={Clock}>
          <Timeline />
        </Panel>
        {exp ? (
          <>
            <div className="operation-tabs">
              {[
                "Container Operations",
                "Stuffing Details",
                "Gate-in & Terminal",
                "Examination",
                "Loading & Sailing",
                "Other Operations",
                "Operation History",
              ].map((t) => (
                <button
                  className={operationTab === t ? "active" : ""}
                  key={t}
                  onClick={() => setOperationTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {operationTab === "Container Operations" ? (
              <Panel
                title="Container-wise Operations"
                icon={Container}
                action={
                  <Button
                    size="sm"
                    onClick={() => editRow("containers", undefined)}
                  >
                    <Plus size={14} />
                    Add Container Operation
                  </Button>
                }
              >
                {ContainerTable({ operations: true })}
              </Panel>
            ) : (
              <Panel title={operationTab} icon={ClipboardList}>
                {operationTab === "Operation History" ? (
                  <ActivityHistory />
                ) : (
                  <Fields
                    cols={4}
                    names={
                      operationTab === "Stuffing Details"
                        ? [
                            "Stuffing Type",
                            "Stuffing Date",
                            "Stuffing Location",
                            "Stuffing Supervisor",
                          ]
                        : operationTab === "Gate-in & Terminal"
                          ? [
                              "Gate-in Date",
                              "Terminal",
                              "Gate Pass No.",
                              "Weighbridge Slip No.",
                            ]
                          : operationTab === "Examination"
                            ? [
                                "Examination Status",
                                "Examination Date",
                                "Exam Location",
                                "Examiner Name",
                              ]
                            : operationTab === "Loading & Sailing"
                              ? [
                                  "Loaded on Vessel Date",
                                  "Vessel Sailed Date",
                                  "BL No.",
                                  "BL Date",
                                ]
                              : [
                                  "Operation Type",
                                  "Operation Date",
                                  "Reference No.",
                                  "Operation Remarks",
                                ]
                    }
                  />
                )}
              </Panel>
            )}
            <div className="fields cols-3">
              <Panel title="Empty Container Pickup" icon={Truck}>
                <Fields
                  cols={2}
                  names={[
                    "Empty Pickup Date*",
                    "Depot / Location",
                    "Transporter",
                    "Vehicle No.",
                  ]}
                />
                <Field name="Pickup Remarks" area />
              </Panel>
              <Panel title="Stuffing Details" icon={Container}>
                <Fields
                  cols={2}
                  names={[
                    "Stuffing Type*",
                    "Stuffing Date*",
                    "Stuffing Location",
                    "Stuffing Supervisor",
                  ]}
                />
                <Field name="Stuffing Remarks" area />
              </Panel>
              <Panel title="Gate-in to Terminal" icon={Container}>
                <Fields
                  cols={2}
                  names={[
                    "Gate-in Date",
                    "Terminal",
                    "Gate Pass No.",
                    "Weighbridge Slip No.",
                  ]}
                />
                <Field name="Terminal Remarks" area />
              </Panel>
            </div>
            <div className="fields cols-2">
              <Panel title="Loading & Sailing" icon={Ship}>
                <Fields
                  names={[
                    "Loaded on Vessel Date",
                    "Vessel Sailed Date",
                    "BL No.",
                    "BL Date",
                  ]}
                />
              </Panel>
              <Panel title="Additional Operations" icon={ClipboardList}>
                <Fields
                  names={[
                    "Operation Type",
                    "Operation Date",
                    "Reference No.",
                    "Operation Remarks",
                  ]}
                />
              </Panel>
            </div>
          </>
        ) : (
          <>
            <div className="fields operation-columns">
              <Panel
                title={`Current Activity - ${["Documentation", "BE Filed", "Assessment", "Examination", "Duty Payment", "OOC", "Gate-out", "Delivery", "Job Completed"][Math.min(job.activity, 8)]}`}
                icon={FileText}
                action={<Status value="In Progress" />}
              >
                <Fields
                  cols={3}
                  names={[
                    "Examination Status*",
                    "Examination Date*",
                    "Exam Type",
                  ]}
                />
                <Fields cols={2} names={["Exam Location", "Examiner Name"]} />
                <Field name="Activity Remarks" area />
                <div className="button-row">
                  <Button
                    variant="default"
                    onClick={() => setToast("Activity updated")}
                  >
                    Update Activity
                  </Button>
                  <Button
                    className="success"
                    onClick={() => {
                      update({ activity: Math.min(job.activity + 1, 9) });
                      setToast("Activity completed");
                    }}
                  >
                    Mark as Completed
                  </Button>
                </div>
              </Panel>
              <Panel title="Activity History" icon={Clock}>
                <ActivityHistory />
              </Panel>
            </div>
            <div className="fields cols-2">
              <Panel title="Container Movement" icon={Container}>
                <div className="table-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Container No.</TableHead>
                        <TableHead>Current Location</TableHead>
                        <TableHead>Last Status</TableHead>
                        <TableHead>Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {job.containers.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.number}</TableCell>
                          <TableCell>CFS</TableCell>
                          <TableCell>Under Examination</TableCell>
                          <TableCell>10-Sep-2026 11:40</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Panel>
              <Panel title="Gate In / Gate Out Details" icon={Truck}>
                {GateTable()}
              </Panel>
            </div>
          </>
        )}
      </>
    );
  }
  function ActivityHistory() {
    const labels = exp
      ? [
          "Booking Confirmed",
          "Docs Received",
          "Shipping Bill Filed",
          "Container Allocation",
          "Stuffing",
          "Gate-in",
          "Examination",
          "LEO",
          "Loaded on Vessel",
          "Vessel Sailed",
          "BL Issued",
        ]
      : [
          "Documentation",
          "BE Filed",
          "Assessment",
          "Examination",
          "Duty Payment",
          "OOC",
          "Gate-out",
          "Delivery",
          "Job Completed",
        ];
    return (
      <div className="table-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr.</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labels.map((l, i) => (
              <TableRow key={l}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{l}</TableCell>
                <TableCell>
                  <Status
                    value={
                      i < job.activity
                        ? "Completed"
                        : i === job.activity
                          ? "In Progress"
                          : "Pending"
                    }
                  />
                </TableCell>
                <TableCell>{i <= job.activity ? "09-Sep-2026" : "–"}</TableCell>
                <TableCell>
                  {i <= job.activity ? "Rahul Sharma" : "–"}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    aria-label={`View ${l}`}
                    onClick={() =>
                      setMessage({
                        title: l,
                        text: `Status: ${i < job.activity ? "Completed" : i === job.activity ? "In Progress" : "Pending"}. Activity is tracked in this local job.`,
                      })
                    }
                  >
                    <Eye size={13} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  function Finance() {
    return (
      <>
        <Panel
          title="Income Details"
          icon={IndianRupee}
          className="income-panel"
          action={
            <>
              <Button size="sm" onClick={() => editRow("income", undefined)}>
                <Plus size={14} />
                Add Income
              </Button>
              <Button
                size="sm"
                onClick={() => demo("Import income from template")}
              >
                <Upload size={14} />
                {exp ? "Import from Excel" : "Import from Template"}
              </Button>
              {exp && (
                <Button
                  size="sm"
                  onClick={() => demo("Copy income from previous job")}
                >
                  <Copy size={14} />
                  Copy from Previous Job
                </Button>
              )}
            </>
          }
        >
          <FinancialTable kind="income" />
        </Panel>
        <Panel
          title="Expense Details"
          icon={IndianRupee}
          className="expense-panel"
          action={
            <>
              <Button size="sm" onClick={() => editRow("expense", undefined)}>
                <Plus size={14} />
                Add Expense
              </Button>
              <Button
                size="sm"
                onClick={() => demo("Import expenses from template")}
              >
                <Upload size={14} />
                {exp ? "Import from Excel" : "Import from Template"}
              </Button>
            </>
          }
        >
          <FinancialTable kind="expense" />
        </Panel>
        {!exp && (
          <Panel title="Payment Status" icon={BriefcaseBusiness}>
            <Fields
              cols={5}
              names={[
                "Customer Payment Status",
                "Expected Payment Date",
                "Vendor Payment Status",
                "Amount Paid",
                "Payment Remarks",
              ]}
            />
            <p className="calculated-note">
              Balance: ₹ {money(expense.total - number(f["Amount Paid"]))}
            </p>
          </Panel>
        )}
        <Panel title="Job Margin Summary" icon={ChartNoAxesCombined} className="financial-summary-panel">
          <StatCards />
          {margin < 0 && !exp && (
            <div className="warning">
              Expense is higher than income. Please review.
            </div>
          )}
          {exp && <Field name="Financial Remarks" area />}
        </Panel>
      </>
    );
  }
  function KeyValues({ names }: { names: string[] }) {
    return (
      <dl className="key-values">
        {names.map((n) => (
          <div key={n}>
            <dt>{n}</dt>
            <dd>
              {n === "Job Type"
                ? type
                : n === "Cargo Type"
                  ? job.cargo
                  : n === "Job No."
                    ? job.created || "Auto Generate"
                    : f[n] || "–"}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  function Review() {
    return (
      <div className={`review-grid ${exp?"review-export":"review-import"}`}>
        <Panel
          title="Job Details"
          icon={FileText}
          action={
            <Button size="sm" onClick={() => go(0)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <KeyValues
            names={[
              "Job Type",
              "Cargo Type",
              exp ? "Client / Exporter" : "Client",
              exp ? "Booking No." : "BL No.",
              "Job Date",
              "Job Reference",
              "Assigned To",
              "Priority",
              "Job Description",
            ]}
          />
        </Panel>
        <Panel
          title="Vessel & Voyage"
          icon={Ship}
          action={
            <Button size="sm" onClick={() => go(1)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <KeyValues
            names={[
              "Vessel Name",
              "IMO No.",
              "Voyage No.",
              "Shipping Line",
              "Port of Loading (POL)",
              "Port of Discharge (POD)",
              "ETD (from POL)",
              "ETA (at POD)",
              "Terminal (POL)",
            ]}
          />
        </Panel>
        <Panel
          title="Cargo Details"
          icon={Container}
          className="review-cargo"
          action={
            <Button size="sm" onClick={() => go(2)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <div className="cargo-stats">
            <span>
              <Container />
              <strong>{job.containers.length}</strong>Containers
            </span>
            <span>
              <Box />
              <strong>{money(packageTotal)}</strong>Packages
            </span>
            <span>
              <Layers />
              <strong>{money(weightTotal)} KG</strong>Gross Weight
            </span>
            <span>
              <Box />
              <strong>{exp ? f["Volume (CBM)"] : money(vgmTotal)} CBM</strong>
              Volume
            </span>
          </div>
          {ContainerTable({ compact: true })}
        </Panel>
        <Panel
          title="Parties"
          icon={Users}
          action={
            <Button size="sm" onClick={() => go(3)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <dl className="key-values">
            {job.parties.map((p) => (
              <div key={p.id}>
                <dt>{p.role}</dt>
                <dd>{p.name || "–"}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel
          title="Customs & Clearance"
          icon={ShieldCheck}
          action={
            <Button size="sm" onClick={() => go(4)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <KeyValues
            names={
              exp
                ? [
                    "Shipping Bill No.",
                    "Shipping Bill Date",
                    "Shipping Bill Type",
                    "Port Code",
                    "IEC No.",
                    "FOB Value",
                    "Assessment Status",
                    "Examination Status",
                    "LEO Status",
                  ]
                : [
                    "Bill of Entry No.",
                    "BE Date",
                    "BE Type",
                    "Assessment Status",
                    "Assessment Date",
                    "Examination Status",
                    "Examination Date",
                    "OOC Status",
                  ]
            }
          />
        </Panel>
        <Panel
          title="Operations Summary"
          icon={Settings}
          action={
            <Button size="sm" onClick={() => go(5)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <Timeline small />
          <KeyValues
            names={
              exp
                ? ["Stuffing Type", "Stuffing Date", "Gate-in Date"]
                : ["Exam Location", "Examiner Name", "Exam Remarks"]
            }
          />
        </Panel>
        <Panel
          title="Income & Expense Summary"
          icon={IndianRupee}
          className="review-finance"
          action={
            <Button size="sm" onClick={() => go(6)}>
              <Pencil size={12} />
              Edit
            </Button>
          }
        >
          <StatCards />
          {!exp && (
            <div className="fields cols-2">
              <FinancialTable kind="income" compact />
              <FinancialTable kind="expense" compact />
            </div>
          )}
        </Panel>
        {exp && <Documents title="Documents" />}
      </div>
    );
  }
  function QuickActions() {
    const items =
      step === 1
        ? [
            "View Full Voyage Details",
            "Create New Voyage",
            "Import Voyage Data",
            "Manage Voyages",
          ]
        : step === 6
          ? [
              "View Income Report",
              "View Expense Report",
              "Export to Billing",
              "Download Financial Summary",
            ]
          : step === 7
            ? [
                "Download Job Summary",
                "Download Checklist",
                "Save as Template",
                "Clone Job",
              ]
            : step === 4
              ? exp
                ? [
                    "Fetch SB from ICEGATE",
                    "Validate SB Details",
                    "Download SB Acknowledgement",
                  ]
                : ["View BE Document", "View Duty Challan"]
              : [
                  "Import Data",
                  "Copy from Existing Job",
                  "Fetch from Vessel/Voyage",
                  "Upload Documents",
                ];
    return (
      <div className="quick-actions">
        {items.map((x, i) => (
          <button
            key={x}
            onClick={() => {
              if (x === "Create New Voyage") {
                setVoyageMode("new");
                go(1);
              } else if (/Download|Report/.test(x)) {
                window.print();
              } else if (/Upload Documents/.test(x)) fileRef.current?.click();
              else if (x === "Save as Template") {
                try {
                  localStorage.setItem(
                    `portlinks-template-${type}`,
                    JSON.stringify(job),
                  );
                  setToast("Template saved in this browser");
                } catch {
                  setToast("Unable to save template");
                }
              } else if (x === "Clone Job") {
                const clone = { ...job, created: undefined };
                update(clone);
                go(0);
                setToast("Job copied into a new local draft");
              } else if (x === "View Full Voyage Details") {
                setMessage({
                  title: "Voyage Details",
                  text: `${f["Vessel Name"]} · ${f["Voyage No."]} · ${f["Port of Loading (POL)"]} → ${f["Port of Discharge (POD)"]} · ETA ${f["ETA (at POD)"]}`,
                });
              } else demo(x);
            }}
          >
            <span>{i % 2 ? <Copy size={21} /> : <FilePlus2 size={21} />}</span>
            <div>
              <strong>{x}</strong>
              <small>
                {/Download|Report/.test(x)
                  ? "Print or save as PDF"
                  : x === "Upload Documents"
                    ? "Attach related documents"
                    : "View and manage job information"}
              </small>
            </div>
          </button>
        ))}
      </div>
    );
  }
  function Summary() {
    return (
      <aside className="right-column">
        <section className="summary-card">
          <div className="aside-heading">
            <IconBox icon={BriefcaseBusiness} />
            <h3>Job Summary</h3>
            <button onClick={() => go(7)}>View Details</button>
          </div>
          <dl>
            {[
              ["Job No.", job.created || "Auto Generate"],
              ["Job Type", type || ""],
              ["Cargo Type", job.cargo],
              ["Client", f[exp ? "Client / Exporter" : "Client"]],
              [
                exp ? "Booking No." : "BL No.",
                f[exp ? "Booking No." : "BL No."],
              ],
              ["Job Date", f["Job Date"]],
              ...(step > 0
                ? [
                    ["Vessel", f["Vessel Name"]],
                    ["Voyage", f["Voyage No."]],
                  ]
                : []),
              [
                "POL → POD",
                exp
                  ? "INMUN → AEJEA"
                  : `${f["Port of Loading (POL)"].split(" (")[0]} → ${f["Port of Discharge (POD)"].split(" (")[0]}`,
              ],
              [
                "Status",
                job.created
                  ? "Created"
                  : step === 7
                    ? "Ready to Create"
                    : "In Progress",
              ],
              ["Assigned To", f["Assigned To"]],
            ].map(([label, value], i) => {
              const Icon = [
                ClipboardList,
                Anchor,
                Container,
                Users,
                FileText,
                CalendarDays,
                Ship,
                Anchor,
                MapPin,
                Clock,
                Users,
              ][i % 11];
              return (
                <div key={label}>
                  <dt>
                    <Icon size={15} />
                    {label}
                  </dt>
                  <dd>
                    {label === "Job Type" ? (
                      <Badge tone="green">{value}</Badge>
                    ) : label === "Cargo Type" ? (
                      <Badge>{value}</Badge>
                    ) : label === "Status" ? (
                      <Badge tone="amber">
                        <span className="status-dot" />
                        {value}
                      </Badge>
                    ) : label === "Assigned To" ? (
                      <span className="assignee">
                        <span className="avatar tiny">RS</span>
                        {value}
                      </span>
                    ) : (
                      value || "–"
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
        {(step === 2 || step === 5) && (
          <section className="summary-card">
            <div className="aside-heading">
              <IconBox icon={Container} />
              <h3>Cargo Summary</h3>
            </div>
            <div className="cargo-stats side">
              <span>
                <Container />
                <strong>{job.containers.length}</strong>Containers
              </span>
              <span>
                <Box />
                <strong>{packageTotal}</strong>Packages
              </span>
              <span>
                <Layers />
                <strong>{money(weightTotal)} KG</strong>Gross Weight
              </span>
              <span>
                <Box />
                <strong>{exp ? f["Volume (CBM)"] : money(vgmTotal)} CBM</strong>
                Volume
              </span>
            </div>
          </section>
        )}
        {step === 6 ? (
          <section className="summary-card">
            <div className="aside-heading">
              <IconBox icon={IndianRupee} />
              <h3>Financial Summary</h3>
            </div>
            <StatCards />
          </section>
        ) : exp || step === 7 ? (
          <section className="summary-card">
            <div className="aside-heading">
              <IconBox icon={ClipboardList} />
              <h3>
                {step === 7 ? "Validation Checklist" : "Workflow Progress"}
              </h3>
            </div>
            <div className="workflow">
              {steps.map((s, i) => (
                <button
                  className={i === step ? "active" : i < step ? "done" : ""}
                  key={s}
                  onClick={() => go(i)}
                >
                  <span>
                    {i < step || step === 7 ? <Check size={14} /> : i + 1}
                  </span>
                  <div>
                    <strong>{s}</strong>
                    {step !== 7 && (
                      <small>
                        {
                          [
                            "Enter basic information",
                            "Select vessel and voyage details",
                            "Add container and cargo information",
                            "Add all related parties",
                            "Shipping bill, examination and LEO",
                            "Track operational activities",
                            "Add job-wise financial details",
                            "Confirm and create job",
                          ][i]
                        }
                      </small>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : step === 3 ? (
          <section className="summary-card">
            <div className="aside-heading">
              <IconBox icon={Users} />
              <h3>Parties Summary</h3>
            </div>
            <dl>
              {job.parties.map((p) => (
                <div key={p.id}>
                  <dt>{p.role}</dt>
                  <dd>{p.name || "–"}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : step === 4 ? (
          <section className="summary-card">
            <div className="aside-heading">
              <IconBox icon={ClipboardList} />
              <h3>Customs Progress</h3>
            </div>
            <div className="workflow">
              {[
                "BE Filed",
                "Assessment",
                "Examination",
                "Duty Payment",
                "OOC",
                "Delivery",
              ].map((s, i) => (
                <button
                  key={s}
                  className={i < 3 ? "done" : ""}
                  onClick={() =>
                    setToast(`${s}: ${i < 3 ? "Completed" : "Pending"}`)
                  }
                >
                  <span>{i < 3 ? <Check size={14} /> : i + 1}</span>
                  <div>
                    <strong>{s}</strong>
                    <small>
                      {i < 3 ? "09-Sep-2026 · By Rahul Sharma" : "Pending"}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        <section className="summary-card">
          <div className="aside-heading">
            <IconBox icon={FilePlus2} />
            <h3>{step === 1 ? "Voyage Actions" : "Quick Actions"}</h3>
          </div>
          <QuickActions />
        </section>
      </aside>
    );
  }
  const subtitle = exp
    ? [
        "Create a new Export job for containerised cargo. Enter job basic details to get started.",
        "Create a new Export job for containerised cargo. Enter vessel and voyage details.",
        "Create a new Export job for containerised cargo. Enter container and cargo details.",
        "Create a new Export job for containerised cargo. Add all related parties for this shipment.",
        "Create a new Export job for containerised cargo. Enter customs and clearance details.",
        "Track operational activities, container movement and key milestones for this export job.",
        "Add job-wise income and expense details. These entries will be used for billing, profitability and financial tracking.",
        "Review all details before creating the export job. You can go back to any step and make changes.",
      ][step]
    : "Create a new Import/Export job for vessel voyage";
  const StepIcon = stepIcons[step];
  return (
    <FormContext.Provider
      value={{ f, field, errors, packageTotal, weightTotal }}
    >
      <div className={`application ${collapsed ? "collapsed" : ""}`}>
        <aside className="sidebar">
          <button
            className="brand"
            onClick={() => {
              setType(null);
              setDestination("CHA Jobs");
            }}
            aria-label="Portlinks home"
          >
            <Ship size={48} strokeWidth={1.6} />
            <strong>PORTLINKS</strong>
            <small>INDIA</small>
          </button>
          <nav>
            {navItems.map(([label, Icon]) => (
              <button
                key={label}
                className={type && destination === label ? "active" : ""}
                onClick={() => {
                  if (label === "CHA Jobs") {
                    setDestination(label);
                    if (!type) setType("Import");
                  } else {
                    setDestination(label);
                    if (!type) setType("Import");
                  }
                }}
                title={label}
              >
                <Icon size={23} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <button className="collapse" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? (
              <ChevronsRight size={19} />
            ) : (
              <ChevronsLeft size={19} />
            )}
            <span>Collapse</span>
          </button>
        </aside>
        <div className="app-main">
          <header className="topbar">
            <div className="breadcrumbs">
              <Ship size={18} />
              <span>CHA Module</span>
              <ChevronRight size={14} />
              <button
                onClick={() => {
                  setDestination("CHA Jobs");
                  setType(null);
                }}
              >
                CHA Jobs
              </button>
              {type && (
                <>
                  <ChevronRight size={14} />
                  <strong>Create Job</strong>
                </>
              )}
            </div>
            <div className="topbar-right">
              <label className="global-search">
                <Search size={16} />
                <input
                  placeholder="Search..."
                  aria-label="Search workspace"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim())
                      setMessage({
                        title: "Workspace search",
                        text: `Search for “${e.currentTarget.value}” requires a connected job database. Use the step navigation to explore this local prototype.`,
                      });
                  }}
                />
              </label>
              <button
                className="bell"
                aria-label="Notifications"
                onClick={() =>
                  setMessage({
                    title: "Notifications",
                    text: "Your CHA job workspace is ready. Drafts are saved locally when you click Save Draft.",
                  })
                }
              >
                <Bell size={22} />
                <b>3</b>
              </button>
              <span className="avatar">RS</span>
              <div className="profile">
                <strong>Rahul Sharma</strong>
                <small>Operations</small>
              </div>
              <ChevronDown size={16} />
            </div>
          </header>
          {!type ? (
            <main className="start-page">
              <div className="start-eyebrow">
                <Anchor size={15} /> PORTLINKS CHA WORKSPACE
              </div>
              <div className="start-icon">
                <Ship size={50} />
              </div>
              <h1>
                Every shipment.
                <br />
                <span>A seamless start.</span>
              </h1>
              <p>
                Create and manage your customs clearance jobs.
                <br />
                Choose a shipment direction to get started.
              </p>
              <div className="choice-grid">
                {(["Import", "Export"] as JobType[]).map((t, i) => {
                  const Icon = i ? ArrowUpFromLine : ArrowDownToLine;
                  return (
                    <button
                      key={t}
                      onClick={() => choose(t)}
                      className="choice-card"
                      disabled={!ready}
                    >
                      <span className={`choice-icon ${i ? "export" : ""}`}>
                        <Icon size={30} />
                      </span>
                      <span className="choice-number">0{i + 1}</span>
                      <h2>Create {t} Job</h2>
                      <p>
                        {i
                          ? "From your origin to the world. Manage bookings, shipping bills and vessel operations."
                          : "From arrival to final delivery. Manage bills of entry, clearance and cargo movement."}
                      </p>
                      <div className="choice-footer">
                        <span>
                          {ready && jobs[t].created
                            ? "View saved job"
                            : "Start " + t.toLowerCase() + " workflow"}
                        </span>
                        <ArrowRight size={20} />
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="start-note">
                <ShieldCheck size={16} />
                One workspace. Eight guided steps. Complete visibility.
              </div>
            </main>
          ) : destination !== "CHA Jobs" ? (
            <main className="placeholder-page">
              <IconBox icon={navItems.find((x) => x[0] === destination)?.[1]} />
              <h1>{destination}</h1>
              <p>This module is outside the job creation prototype.</p>
              <Button
                variant="default"
                onClick={() => setDestination("CHA Jobs")}
              >
                <ArrowLeft size={16} />
                Return to CHA Job
              </Button>
            </main>
          ) : (
            <>
              <div className="page-heading">
                <IconBox />
                <div>
                  <h1>{exp ? "Create Export CHA Job" : "Create CHA Job"}</h1>
                  <p>{subtitle}</p>
                </div>
                <div className="heading-actions">
                  {step < 7 && (
                    <Button
                      className="import-button"
                      onClick={() => demo("Import job data")}
                    >
                      <Upload size={16} />
                      Import Data
                    </Button>
                  )}
                  <Button onClick={saveDraft}>
                    <Save size={16} />
                    Save Draft
                  </Button>
                  <Button variant="default" onClick={next}>
                    {step === 7
                      ? exp
                        ? "Create Job"
                        : "Save & Create Job"
                      : "Save & Continue"}
                    {step === 7 ? (
                      <Check size={18} />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </Button>
                </div>
              </div>
              <main className="workspace">
                <div className="left-column">
                  <section className="job-selector">
                    <div>
                      <label>
                        Job Type <b>*</b>
                      </label>
                      <div className="button-row">
                        {(["Import", "Export"] as JobType[]).map((t) => {
                          const Icon =
                            t === "Import" ? ArrowDownToLine : ArrowUpFromLine;
                          return (
                            <Button
                              key={t}
                              className="job-type"
                              variant={type === t ? "default" : "outline"}
                              onClick={() => choose(t)}
                            >
                              <Icon size={20} />
                              {t}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label>
                        Cargo Type <b>*</b>
                      </label>
                      <div className="button-row cargo-buttons">
                        {(
                          [
                            ["Containerised", Container],
                            ["Dry Bulk", Layers],
                            ["Break Bulk", BriefcaseBusiness],
                            ["Liquid Cargo", Droplet],
                          ] as [string, LucideIcon][]
                        ).map(([c, Icon]) => (
                          <Button
                            key={c}
                            className={job.cargo === c ? "selected-cargo" : ""}
                            onClick={() => update({ cargo: c })}
                          >
                            <Icon size={23} />
                            {c}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Field
                      name="Job No."
                      value={job.created || "Auto Generate"}
                      disabled
                    />
                    <Field name="Job Date" />
                  </section>
                  <nav className="steps" aria-label="Job creation steps">
                    {steps.map((s, i) => (
                      <button
                        aria-current={step === i ? "step" : undefined}
                        className={step === i ? "active" : ""}
                        key={s}
                        onClick={() => go(i)}
                      >
                        <span>{i + 1}</span>
                        <strong>{s}</strong>
                      </button>
                    ))}
                  </nav>
                  {job.cargo !== "Containerised" && (
                    <div className="cargo-notice">
                      <Box size={16} />
                      {job.cargo} selected. This prototype provides the
                      containerised detail screens shown in the references.
                    </div>
                  )}
                  <section
                    className={`screen-content screen-step-${step} ${exp?"export-flow":"import-flow"} ${!exp && step === 0 ? "import-basics" : ""}`}
                    ref={formRef}
                  >
                    <div className="screen-heading">
                      <IconBox icon={StepIcon} />
                      <div>
                        <h2>
                          {step + 1}. {steps[step]}
                          {step === 2 && !exp ? " - Containerised" : ""}
                        </h2>
                        <p>
                          {
                            [
                              "Enter basic job information, client, booking and shipment references.",
                              "Select vessel, voyage and port details for this job.",
                              "Add container details and cargo information for this job.",
                              "Add all related parties involved in this job.",
                              "Enter customs, examination, duty and clearance details for this job.",
                              "Track and manage all operational activities for this job.",
                              "Record job-wise income and expense details. These will reflect in billing and accounts.",
                              "Please review all details before creating the job. You can go back and edit if required.",
                            ][step]
                          }
                        </p>
                      </div>
                      <div className="screen-actions">
                        {step === 1 ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                exp
                                  ? setMessage({
                                      title: "Search Voyage",
                                      text: "For this export prototype, edit the vessel and voyage fields below. The Import workflow includes a searchable sample voyage table.",
                                    })
                                  : setVoyageMode("new")
                              }
                            >
                              <Plus size={14} />
                              {exp ? "Search Voyage" : "Create New Voyage"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => demo("Import Voyage Data")}
                            >
                              <Upload size={14} />
                              {exp ? "Import Voyage" : "Import Voyage Data"}
                            </Button>
                          </>
                        ) : step === 3 ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              demo("Copy parties from Existing Job")
                            }
                          >
                            <Copy size={14} />
                            Copy from Existing Job
                          </Button>
                        ) : step === 4 && exp ? (
                          <Button
                            size="sm"
                            onClick={() => demo("View EDI Status")}
                          >
                            <Eye size={14} />
                            View EDI Status
                          </Button>
                        ) : step === 5 ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                setEditor({
                                  title: "Update Operation",
                                  fields: [
                                    ["activity", "Current milestone (number)"],
                                  ],
                                  values: {
                                    activity: String(job.activity + 1),
                                  },
                                  save: (r) => {
                                    const n = Number(r.activity);
                                    if (
                                      !Number.isInteger(n) ||
                                      n < 1 ||
                                      n > (exp ? 11 : 9)
                                    ) {
                                      setToast(
                                        "Enter a valid milestone number",
                                      );
                                      return;
                                    }
                                    update({ activity: n - 1 });
                                    setEditor(null);
                                    setToast("Operation updated");
                                  },
                                })
                              }
                            >
                              <Plus size={14} />
                              {exp ? "Add Operation" : "Add Activity"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                setMessage({
                                  title: "Operation Timeline",
                                  text: (exp
                                    ? [
                                        "Booking Confirmed",
                                        "Docs Received",
                                        "Shipping Bill Filed",
                                        "Container Allocation",
                                        "Stuffing",
                                        "Gate-in",
                                        "Examination",
                                        "LEO",
                                        "Loaded on Vessel",
                                        "Vessel Sailed",
                                        "BL Issued",
                                      ]
                                    : [
                                        "Documentation",
                                        "BE Filed",
                                        "Assessment",
                                        "Examination",
                                        "Duty Payment",
                                        "OOC",
                                        "Gate-out",
                                        "Delivery",
                                        "Job Completed",
                                      ]
                                  )
                                    .map(
                                      (x, i) =>
                                        `${i + 1}. ${x}: ${i < job.activity ? "Completed" : i === job.activity ? "In Progress" : "Pending"}`,
                                    )
                                    .join("\n"),
                                })
                              }
                            >
                              <Eye size={14} />
                              View Timeline
                            </Button>
                          </>
                        ) : step === 7 ? (
                          <Button size="sm" onClick={() => window.print()}>
                            <Printer size={14} />
                            Print Preview
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {errors.length > 0 && (
                      <div className="validation" role="alert">
                        Required details: {errors.join(", ")}
                      </div>
                    )}
                    {step === 0
                      ? JobDetails()
                      : step === 1
                        ? Voyage()
                        : step === 2
                          ? Cargo()
                          : step === 3
                            ? Parties()
                            : step === 4
                              ? Customs()
                              : step === 5
                                ? Operations()
                                : step === 6
                                  ? Finance()
                                  : Review()}
                  </section>
                </div>
                <Summary />
              </main>
              <footer className="bottom-bar">
                <Button disabled={step === 0} onClick={() => go(step - 1)}>
                  <ArrowLeft size={16} />
                  Previous
                </Button>
                <div>
                  <Button onClick={saveDraft}>
                    <Save size={16} />
                    Save Draft
                  </Button>
                  <Button variant="default" onClick={next}>
                    {step === 7
                      ? exp
                        ? "Create Export Job"
                        : "Save & Create Job"
                      : "Save & Continue"}
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </footer>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={19} />
            {toast}
            <button
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}
        <Dialog
          open={!!message}
          onOpenChange={(v) => !v && setMessage(null)}
          title={message?.title || ""}
        >
          <p className="dialog-message">{message?.text}</p>
          <Button variant="default" onClick={() => setMessage(null)}>
            Got it
          </Button>
        </Dialog>
        <Dialog
          open={!!editor}
          onOpenChange={(v) => !v && setEditor(null)}
          title={editor?.title || ""}
        >
          {editor && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editor.save(editor.values);
              }}
            >
              <div className="fields cols-2">
                {editor.fields.map(([key, label]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <Input
                      value={editor.values[key] || ""}
                      onChange={(e) =>
                        setEditor({
                          ...editor,
                          values: { ...editor.values, [key]: e.target.value },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="dialog-footer">
                <Button type="button" onClick={() => setEditor(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  <Save size={15} />
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      </div>
    </FormContext.Provider>
  );
}
