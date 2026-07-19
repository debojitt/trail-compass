import { useState } from "react";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createBooking, formatINR, type Booking } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export type BookingDraft = {
  kind: Booking["kind"];
  title: string;
  detail: string;
  /** Price per traveller */
  unitPrice: number;
  /** If false the total does not multiply by travellers (e.g. cabs) */
  perPerson?: boolean;
};

type Props = {
  draft: BookingDraft | null;
  onClose: () => void;
};

/**
 * Universal demo checkout: traveller count → confirm → reference code.
 * Replace `createBooking` with a real payments/booking API to go live.
 */
export function BookingDialog({ draft, onClose }: Props) {
  const [travellers, setTravellers] = useState(2);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const open = draft !== null;
  const perPerson = draft?.perPerson ?? true;
  const total = draft ? draft.unitPrice * (perPerson ? travellers : 1) : 0;

  const close = () => {
    onClose();
    /* reset after the dialog animates out */
    setTimeout(() => {
      setTravellers(2);
      setBusy(false);
      setConfirmed(null);
    }, 250);
  };

  const confirm = async () => {
    if (!draft) return;
    setBusy(true);
    const booking = await createBooking({
      kind: draft.kind,
      title: draft.title,
      detail: draft.detail,
      amount: total,
      travellers,
    });
    setBusy(false);
    setConfirmed(booking);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md rounded-3xl">
        {confirmed ? (
          <div className="py-4 text-center">
            <CheckCircle2 size={52} className="mx-auto" style={{ color: GREEN }} />
            <h2 className="mt-4 text-[22px] font-bold tracking-tight">Booking confirmed</h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              {confirmed.title} · {confirmed.travellers} traveller
              {confirmed.travellers !== 1 ? "s" : ""}
            </p>
            <div
              className="mx-auto mt-4 inline-block rounded-2xl border border-dashed px-5 py-3"
              style={{ borderColor: GREEN, background: GREEN_LIGHT }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                Reference
              </p>
              <p className="text-[20px] font-bold tracking-wider" style={{ color: GREEN }}>
                {confirmed.id}
              </p>
            </div>
            <p className="mt-4 text-[12px] text-neutral-400">
              Demo booking — saved on this device, no payment taken.
            </p>
            <button
              onClick={close}
              className="mt-5 w-full rounded-full py-2.5 text-[14px] font-bold text-white"
              style={{ background: RED }}
            >
              Done
            </button>
          </div>
        ) : draft ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[20px] leading-snug tracking-tight">
                {draft.title}
              </DialogTitle>
              <DialogDescription className="text-[13px]">{draft.detail}</DialogDescription>
            </DialogHeader>

            <div
              className="flex items-center justify-between rounded-2xl border px-4 py-3"
              style={{ borderColor: "rgba(0,0,0,0.1)" }}
            >
              <div>
                <p className="text-[14px] font-semibold">Travellers</p>
                <p className="text-[11px] text-neutral-400">Adults and children</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTravellers((t) => Math.max(1, t - 1))}
                  className="grid h-8 w-8 place-items-center rounded-full border text-neutral-500 hover:bg-neutral-50"
                  style={{ borderColor: "rgba(0,0,0,0.15)" }}
                  aria-label="Fewer travellers"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-[15px] font-semibold">{travellers}</span>
                <button
                  onClick={() => setTravellers((t) => t + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full border hover:bg-neutral-50"
                  style={{ borderColor: GREEN, color: GREEN }}
                  aria-label="More travellers"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-neutral-400">
                  {formatINR(draft.unitPrice)} {perPerson ? "per traveller" : "flat"}
                </p>
                <p className="text-[24px] font-bold tracking-tight" style={{ color: RED }}>
                  {formatINR(total)}
                </p>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: GREEN_LIGHT, color: GREEN }}
              >
                Demo checkout
              </span>
            </div>

            <button
              onClick={confirm}
              disabled={busy}
              className="w-full rounded-full py-3 text-[15px] font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: RED }}
            >
              {busy ? "Confirming…" : "Confirm demo booking"}
            </button>
            <p className="text-center text-[11px] text-neutral-400">
              No payment — this simulates the real booking flow end to end.
            </p>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
