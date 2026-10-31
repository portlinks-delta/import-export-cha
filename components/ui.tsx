"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";
import { calendarInputValue } from "../app/model";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const variants = cva("ui-button", {
  variants: {
    variant: {
      default: "primary",
      outline: "outline",
      ghost: "ghost",
      destructive: "destructive",
    },
    size: { default: "", sm: "small", icon: "icon-button" },
  },
  defaultVariants: { variant: "outline", size: "default" },
});
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(variants({ variant, size }), className)} {...props} />
  );
}
export function Input({ className, type, value, ...props }: React.ComponentProps<"input">) {
  const calendar = type === "date" || type === "datetime-local";
  return <input className={cn("ui-input", className)} type={type}
    value={calendar && typeof value === "string" ? calendarInputValue(value, type === "datetime-local") : value}
    {...props} />;
}
export type TableColumns = {
  name: string;
  labels: string[];
  locked: string[];
  hidden: string[];
  onChange: (hidden: string[]) => void;
};
const HiddenColumns = React.createContext<number[]>([]);
function rowCells(children: React.ReactNode): React.ReactElement<React.ComponentProps<"td">>[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<React.ComponentProps<"td">>(child)) return [];
    return child.type === React.Fragment ? rowCells(child.props.children) : [child];
  });
}
export function Table({ className, columns, ...props }: React.ComponentProps<"table"> & { columns?: TableColumns }) {
  const hidden = columns?.labels.flatMap((label, index) =>
    columns.hidden.includes(label) && !columns.locked.includes(label) ? [index] : []) || [];
  return (
    <HiddenColumns.Provider value={hidden}>
      {columns && (
        <details className="column-picker">
          <summary aria-label={`${columns.name} columns`}>Columns</summary>
          <div className="column-options" role="group" aria-label={`${columns.name} column visibility`}>
            {columns.labels.map((label) => (
              <label key={label}>
                <input type="checkbox" checked={!columns.hidden.includes(label) || columns.locked.includes(label)}
                  disabled={columns.locked.includes(label)}
                  onChange={(event) => columns.onChange(event.target.checked
                    ? columns.hidden.filter((item) => item !== label)
                    : [...columns.hidden, label])} />
                {label}
              </label>
            ))}
            <Button type="button" size="sm" onClick={() => columns.onChange([])}>Reset Columns</Button>
          </div>
        </details>
      )}
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </HiddenColumns.Provider>
  );
}
export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}
export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}
export function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium", className)}
      {...props}
    />
  );
}
export function TableRow({ className, children, ...props }: React.ComponentProps<"tr">) {
  const hidden = React.useContext(HiddenColumns);
  let position = 0;
  const cells = hidden.length ? rowCells(children).map((cell, index) => {
    const span = cell.props.colSpan || 1;
    const visible = Array.from({ length: span }, (_, offset) => position + offset)
      .filter((column) => !hidden.includes(column)).length;
    position += span;
    return visible ? React.cloneElement(cell, { key: index, colSpan: visible }) : null;
  }) : children;
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    >{cells}</tr>
  );
}
export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}
export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-2 align-middle", className)}
      {...props}
    />
  );
}
export function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content className="dialog-content">
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {title} details
          </DialogPrimitive.Description>
          <DialogPrimitive.Close
            className="dialog-close"
            aria-label="Close dialog"
          >
            <X size={18} />
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
