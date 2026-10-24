"use client";

import { useState, useTransition } from "react";
import { Button, DemoNotice, Input, Select, Textarea } from "@/components/ui";
import { isValidEmail, type FieldErrors } from "@/lib/validation";
import { submitContactFormAction } from "@/services/actions";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Order support", message: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof typeof form>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (form.name.trim().length < 2) errs.name = "Enter your name";
        if (!isValidEmail(form.email)) errs.email = "Enter a valid email";
        if (form.message.trim().length < 10) errs.message = "Please write at least 10 characters";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await submitContactFormAction(form);
          setNotice(r.ok ? "Thanks — we'll reply within one working day." : r.message);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" required value={form.name} onChange={set("name")} error={errors.name} />
        <Input label="Email" type="email" required value={form.email} onChange={set("email")} error={errors.email} />
        <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} />
        <Select label="Subject" options={["Order support", "Returns & exchange", "Product question", "Wholesale", "Other"].map((v) => ({ value: v, label: v }))} value={form.subject} onChange={set("subject")} />
      </div>
      <Textarea label="Message" required value={form.message} onChange={set("message")} error={errors.message} />
      {notice && <DemoNotice force>{notice}</DemoNotice>}
      <Button type="submit" size="lg" loading={pending}>
        Send Message
      </Button>
    </form>
  );
}
