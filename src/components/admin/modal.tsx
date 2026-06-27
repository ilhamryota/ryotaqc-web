import { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  if (!open) return null;
  const w = size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full ${w} rounded-2xl border border-border bg-card shadow-2xl my-8`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  label = "data ini",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Konfirmasi Hapus">
      <p className="text-sm text-muted-foreground">
        Anda yakin ingin menghapus {label}? Tindakan ini tidak dapat dibatalkan.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">
          Batal
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          Hapus
        </button>
      </div>
    </Modal>
  );
}
