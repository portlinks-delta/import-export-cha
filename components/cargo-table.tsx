"use client";
import { useState } from "react";
import { Pencil, Trash2, Container, Check, ChevronDown } from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "./ui";
import { money, number, type Row } from "../app/model";

function CellInput({
  label,
  value,
  numeric = false,
  integer = false,
  onChange,
}: {
  label: string;
  value: string;
  numeric?: boolean;
  integer?: boolean;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Input
      className="table-input"
      aria-label={label}
      inputMode={numeric ? "decimal" : "text"}
      value={
        numeric && !focused && value !== ""
          ? label.startsWith("Volume")
            ? number(value).toFixed(2)
            : money(number(value))
          : value
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const v = e.target.value.replaceAll(",", "");
        if (!numeric || (integer ? /^\d*$/ : /^\d*\.?\d*$/).test(v))
          onChange(numeric ? v : e.target.value);
      }}
    />
  );
}
function CellSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="table-select-wrap">
      <select
        className="table-select"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {[...new Set([value, ...options])].map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <ChevronDown size={12} />
    </div>
  );
}
export function CargoTable({
  rows,
  exp,
  compact = false,
  operations = false,
  onChange,
  onEdit,
  onDelete,
  onDeleteMany,
}: {
  rows: Row[];
  exp: boolean;
  compact?: boolean;
  operations?: boolean;
  onChange: (id: string, key: string, value: string) => void;
  onEdit: (r: Row) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const packages = rows.reduce((a, r) => a + number(r.packages), 0),
    weight = rows.reduce((a, r) => a + number(r.weight), 0),
    vgm = rows.reduce((a, r) => a + number(r.vgm), 0);
  if (operations)
    return (
      <div className="table-scroll">
        <Table aria-label="Container operations">
          <TableHeader>
            <TableRow>
              {[
                "#",
                "Container No.",
                "Size/Type",
                "Seal No.",
                "Stuffing Date",
                "VGM (KG)",
                "Gate-in Date",
                "Terminal",
                "Current Status",
                "Actions",
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{r.number}</TableCell>
                <TableCell>{r.size}</TableCell>
                <TableCell>{r.seal}</TableCell>
                <TableCell>{r.stuffingDate || "06-Sep-2026"}</TableCell>
                <TableCell>{money(number(r.vgm))}</TableCell>
                <TableCell>{r.gateIn || "–"}</TableCell>
                <TableCell>{r.terminal || "APM Mundra"}</TableCell>
                <TableCell>
                  <Badge tone={r.status === "Stuffed" ? "green" : "blue"}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => onEdit(r)}>
                    <Pencil size={12} />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  const editable = !compact && !operations;
  return (
    <div className={`cargo-data-table ${compact ? "read-only" : "editable"}`}>
      <div className="table-scroll">
        <Table
          aria-label={
            compact
              ? "Container summary"
              : operations
                ? "Container operations"
                : "Cargo container details"
          }
        >
          <TableHeader>
            <TableRow>
              {!compact && (
                <TableHead className="checkbox-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all containers"
                    checked={
                      rows.length > 0 &&
                      rows.every((r) => selected.includes(r.id))
                    }
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          selected.length > 0 &&
                          !rows.every((r) => selected.includes(r.id));
                    }}
                    onChange={(e) =>
                      setSelected(e.target.checked ? rows.map((r) => r.id) : [])
                    }
                  />
                </TableHead>
              )}
              <TableHead className="serial-cell">
                {exp ? "#" : "Sr. No."}
              </TableHead>
              <TableHead className="container-number">
                Container No. {editable && <b>*</b>}
              </TableHead>
              <TableHead className="container-size">
                Size/Type {editable && <b>*</b>}
              </TableHead>
              <TableHead className="seal-number">Seal No.</TableHead>
              <TableHead className="numeric-cell">
                {exp ? "Packages" : "No. of Packages"}
              </TableHead>
              <TableHead className="numeric-cell">
                Gross Weight
                <br />
                (KG{exp ? "" : "S"})
              </TableHead>
              <TableHead className="numeric-cell">
                {exp ? "VGM" : "Volume"}
                <br />({exp ? "KG" : "CBM"})
              </TableHead>
              {!compact && (
                <TableHead>{exp ? "Stuffing Type" : "FCL/LCL"}</TableHead>
              )}
              <TableHead className="status-cell">
                {exp ? "Status" : "IMDG"}
              </TableHead>
              {!compact && (
                <TableHead className="actions-cell">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const change = (key: string, v: string) => onChange(r.id, key, v);
              return (
                <TableRow
                  key={r.id}
                  data-state={selected.includes(r.id) ? "selected" : undefined}
                >
                  {!compact && (
                    <TableCell className="checkbox-cell">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.number}`}
                        checked={selected.includes(r.id)}
                        onChange={(e) =>
                          setSelected((old) =>
                            e.target.checked
                              ? [...old, r.id]
                              : old.filter((id) => id !== r.id),
                          )
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className="serial-cell">{i + 1}</TableCell>
                  <TableCell>
                    {editable ? (
                      <CellInput
                        label={`Container number row ${i + 1}`}
                        value={r.number}
                        onChange={(v) => change("number", v)}
                      />
                    ) : (
                      r.number
                    )}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <CellSelect
                        label={`Size/type row ${i + 1}`}
                        value={r.size}
                        options={["20 GP", "40 HC", "40 GP", "20 OT", "40 RF"]}
                        onChange={(v) => change("size", v)}
                      />
                    ) : (
                      r.size
                    )}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <CellInput
                        label={`Seal number row ${i + 1}`}
                        value={r.seal}
                        onChange={(v) => change("seal", v)}
                      />
                    ) : (
                      r.seal
                    )}
                  </TableCell>
                  <TableCell className="numeric-cell">
                    {editable ? (
                      <CellInput
                        label={`Packages row ${i + 1}`}
                        numeric
                        integer
                        value={r.packages}
                        onChange={(v) => change("packages", v)}
                      />
                    ) : (
                      money(number(r.packages))
                    )}
                  </TableCell>
                  <TableCell className="numeric-cell">
                    {editable ? (
                      <CellInput
                        label={`Gross weight row ${i + 1}`}
                        numeric
                        value={r.weight}
                        onChange={(v) => change("weight", v)}
                      />
                    ) : (
                      money(number(r.weight))
                    )}
                  </TableCell>
                  <TableCell className="numeric-cell">
                    {editable ? (
                      <CellInput
                        label={`${exp ? "VGM" : "Volume"} row ${i + 1}`}
                        numeric
                        value={r.vgm}
                        onChange={(v) => change("vgm", v)}
                      />
                    ) : (
                      money(number(r.vgm))
                    )}
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      {editable ? (
                        <CellSelect
                          label={`${exp ? "Stuffing type" : "FCL/LCL"} row ${i + 1}`}
                          value={r.stuffing}
                          options={
                            exp
                              ? ["Factory Stuffing", "CFS Stuffing"]
                              : ["FCL", "LCL"]
                          }
                          onChange={(v) => change("stuffing", v)}
                        />
                      ) : (
                        r.stuffing
                      )}
                    </TableCell>
                  )}
                  <TableCell className="status-cell">
                    {editable ? (
                      <div
                        className={`table-status ${r.status === "Yes" ? "danger" : r.status === "No" ? "neutral" : r.status === "Stuffed" ? "complete" : "pending"}`}
                      >
                        <select
                          aria-label={`${exp ? "Status" : "IMDG"} row ${i + 1}`}
                          value={r.status}
                          onChange={(e) => change("status", e.target.value)}
                        >
                          {(exp
                            ? [
                                "Stuffed",
                                "Ready for Gate-in",
                                "Empty Picked Up",
                                "Pending",
                              ]
                            : ["No", "Yes"]
                          ).map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <Badge
                        tone={
                          r.status === "Yes"
                            ? "red"
                            : r.status === "Stuffed"
                              ? "green"
                              : r.status === "No"
                                ? "gray"
                                : "blue"
                        }
                      >
                        {r.status}
                      </Badge>
                    )}
                  </TableCell>
                  {!compact && (
                    <TableCell className="actions-cell">
                      <span className="row-actions">
                        <Button
                          size="icon"
                          aria-label={`Edit container ${r.number}`}
                          title="Edit container"
                          onClick={() => onEdit(r)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="icon"
                          className="delete"
                          aria-label={`Delete container ${r.number}`}
                          title="Delete container"
                          onClick={() => {
                            onDelete(r.id);
                            setSelected((old) =>
                              old.filter((id) => id !== r.id),
                            );
                          }}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={compact ? 4 : 5} className="total-label">
                Total
              </TableCell>
              <TableCell className="numeric-cell">{money(packages)}</TableCell>
              <TableCell className="numeric-cell">{money(weight)}</TableCell>
              <TableCell className="numeric-cell">
                {exp ? money(vgm) : vgm.toFixed(2)}
              </TableCell>
              <TableCell colSpan={compact ? 1 : 3} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {rows.length === 0 && (
        <div className="table-empty">
          <Container size={25} />
          <strong>No containers added</strong>
          <span>Add a container to enter cargo details.</span>
        </div>
      )}
      {!compact && selected.length > 0 && (
        <div className="selection-bar">
          <span>
            <Check size={13} />
            {selected.length} of {rows.length} rows selected
          </span>
          <div>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear selection
            </Button>
            <Button
              size="sm"
              className="delete"
              onClick={() => {
                onDeleteMany(selected);
                setSelected([]);
              }}
            >
              <Trash2 size={12} />
              Delete selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
