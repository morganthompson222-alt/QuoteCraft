"use client";

import Link from "next/link";
import { Modal } from "./Modal";

type PlanLimitModalProps = {
  open: boolean;
  onClose: () => void;
  resource?: string;
};

export function PlanLimitModal({ open, onClose, resource }: PlanLimitModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Plan limit reached">
      <div style={{ padding: "0 20px 20px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {resource
            ? `You've reached the limit for ${resource}. Upgrade your plan to continue.`
            : `You've reached your current plan limit. Upgrade to unlock more.`}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button className="button button--secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <Link className="button button--primary" href="/settings">
            Upgrade plan
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export function isPlanLimitError(response: Response, body: unknown): boolean {
  if (response.status === 403 || response.status === 429) {
    const err = (body as { error?: { code?: string } })?.error;
    if (err?.code === "PLAN_LIMIT_REACHED") return true;
  }
  return false;
}

export function getPlanLimitResource(body: unknown): string | undefined {
  const msg = (body as { error?: { message?: string } })?.error?.message?.toLowerCase() ?? "";
  if (msg.includes("quote")) return "quotes";
  if (msg.includes("customer")) return "customers";
  if (msg.includes("ai")) return "AI generations";
  return undefined;
}
