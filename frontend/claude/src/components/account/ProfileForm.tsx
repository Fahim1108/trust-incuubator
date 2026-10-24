"use client";

import { useState, useTransition } from "react";
import { Button, DemoNotice, Input } from "@/components/ui";
import { isValidBdPhone, isValidEmail, type FieldErrors } from "@/lib/validation";
import { updateProfileAction } from "@/services/actions";
import type { Customer } from "@/types";

export function ProfileForm({ customer }: { customer: Customer }) {
  const [form, setForm] = useState({ fullName: customer.fullName, email: customer.email, phone: customer.phone });
  const [errors, setErrors] = useState<FieldErrors<keyof typeof form>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (form.fullName.trim().length < 3) errs.fullName = "Enter your full name";
        if (!isValidEmail(form.email)) errs.email = "Enter a valid email";
        if (!isValidBdPhone(form.phone)) errs.phone = "Enter a valid mobile number";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await updateProfileAction(form);
          setMessage(r.ok ? "Profile updated." : r.message);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} wrapperClassName="sm:col-span-2" />
        <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
        <Input label="Mobile Number" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
      </div>
      {message && <DemoNotice force>{message}</DemoNotice>}
      <Button type="submit" loading={pending}>
        Save Changes
      </Button>
    </form>
  );
}
