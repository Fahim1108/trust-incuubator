"use client";

import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Checkbox, DemoNotice, EmptyState, Input, Modal, Select, Textarea } from "@/components/ui";
import { areasOf, districtsOf, divisionNames } from "@/data/bangladesh";
import { isValidBdPhone, type FieldErrors } from "@/lib/validation";
import { deleteAddressAction, saveAddressAction } from "@/services/actions";
import type { Address } from "@/types";

const empty: Address = { id: "", label: "Home", fullName: "", phone: "", division: "", district: "", area: "", addressLine: "", isDefault: false };

/** Address book. Edits are applied to local state for the demo; the server action reports "not connected". */
export function AddressManager({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<Address | null>(null);
  const [errors, setErrors] = useState<FieldErrors<keyof Address>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const districts = useMemo(() => districtsOf(editing?.division ?? ""), [editing?.division]);
  const areas = useMemo(() => areasOf(editing?.district ?? ""), [editing?.district]);

  const save = async () => {
    if (!editing) return;
    const e: typeof errors = {};
    if (editing.fullName.trim().length < 3) e.fullName = "Required";
    if (!isValidBdPhone(editing.phone)) e.phone = "Enter a valid mobile number";
    if (!editing.division) e.division = "Required";
    if (!editing.district) e.district = "Required";
    if (!editing.area.trim()) e.area = "Required";
    if (editing.addressLine.trim().length < 6) e.addressLine = "Enter full address";
    setErrors(e);
    if (Object.keys(e).length) return;
    const saved = { ...editing, id: editing.id || `local_${Date.now()}` };
    setAddresses((list) => {
      const next = list.some((a) => a.id === saved.id) ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved];
      return saved.isDefault ? next.map((a) => ({ ...a, isDefault: a.id === saved.id })) : next;
    });
    setEditing(null);
    const r = await saveAddressAction(saved);
    setNotice(r.ok ? null : `${r.message} The change is shown on this page only.`);
  };

  const remove = async (id: string) => {
    setAddresses((list) => list.filter((a) => a.id !== id));
    const r = await deleteAddressAction(id);
    setNotice(r.ok ? null : `${r.message} The change is shown on this page only.`);
  };

  const upd = (patch: Partial<Address>) => setEditing((a) => (a ? { ...a, ...patch } : a));

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-3xl text-ink">Saved Addresses</h2>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setErrors({}); setEditing({ ...empty }); }}>
          Add Address
        </Button>
      </div>
      {notice && <DemoNotice force className="mb-4">{notice}</DemoNotice>}
      {addresses.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col rounded-card border border-line p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-medium text-ink">{a.label}</span>
                {a.isDefault && <Badge tone="soft">Default</Badge>}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {a.fullName} · {a.phone}
                <br />
                {a.addressLine}, {a.area}, {a.district}, {a.division}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <Button size="sm" variant="ghost" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => { setErrors({}); setEditing(a); }}>
                  Edit
                </Button>
                {!a.isDefault && (
                  <Button size="sm" variant="ghost" leftIcon={<Star className="h-3.5 w-3.5" />} onClick={() => setAddresses((l) => l.map((x) => ({ ...x, isDefault: x.id === a.id })))}>
                    Set default
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-danger" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => remove(a.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={<MapPin className="h-7 w-7" />} title="No saved addresses" description="Add an address for faster checkout." />
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit Address" : "New Address"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save Address</Button>
          </div>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Label" options={["Home", "Office", "Other"].map((v) => ({ value: v, label: v }))} value={editing.label} onChange={(e) => upd({ label: e.target.value })} />
            <Input label="Full Name" value={editing.fullName} onChange={(e) => upd({ fullName: e.target.value })} error={errors.fullName} />
            <Input label="Mobile Number" type="tel" placeholder="01XXXXXXXXX" value={editing.phone} onChange={(e) => upd({ phone: e.target.value })} error={errors.phone} wrapperClassName="sm:col-span-2" />
            <Select label="Division" placeholder="Select division" options={divisionNames.map((d) => ({ value: d, label: d }))} value={editing.division} onChange={(e) => upd({ division: e.target.value, district: "", area: "" })} error={errors.division} />
            <Select label="District" placeholder="Select district" disabled={!editing.division} options={districts.map((d) => ({ value: d, label: d }))} value={editing.district} onChange={(e) => upd({ district: e.target.value, area: "" })} error={errors.district} />
            {areas.length ? (
              <Select label="Area / Thana" placeholder="Select area" options={areas.map((d) => ({ value: d, label: d }))} value={editing.area} onChange={(e) => upd({ area: e.target.value })} error={errors.area} wrapperClassName="sm:col-span-2" />
            ) : (
              <Input label="Area / Upazila" value={editing.area} disabled={!editing.district} onChange={(e) => upd({ area: e.target.value })} error={errors.area} wrapperClassName="sm:col-span-2" />
            )}
            <Textarea label="Detailed Address" value={editing.addressLine} onChange={(e) => upd({ addressLine: e.target.value })} error={errors.addressLine} wrapperClassName="sm:col-span-2" className="min-h-[80px]" />
            <Checkbox label="Set as default address" checked={editing.isDefault} onChange={(e) => upd({ isDefault: e.target.checked })} className="sm:col-span-2" />
          </div>
        )}
      </Modal>
    </section>
  );
}
