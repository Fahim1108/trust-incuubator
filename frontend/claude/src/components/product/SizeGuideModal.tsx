"use client";

import { Modal } from "@/components/ui";
import type { SizeGuide } from "@/types";

export function SizeGuideModal({ guide, open, onClose }: { guide: SizeGuide; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={guide.title} description={`All measurements in ${guide.unit}.`}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {guide.columns.map((c) => (
                <th key={c} scope="col" className="px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row.join("-")} className="border-b border-line/70 last:border-0">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-2 py-2.5 font-medium text-ink">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-2 py-2.5 text-ink">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-ink-muted">
        {guide.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </Modal>
  );
}
