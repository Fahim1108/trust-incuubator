"use client";
import Link from "next/link";
import {shirtAttributes} from "@/lib/admin/validation";
import {missingProductFacts} from "@/lib/admin/product-review";
import {useUnsavedDraft} from "./useUnsavedDraft";
import Image from "next/image";
import { useActionState, useState } from "react";
import { saveThriftDraft } from "@/lib/admin/actions";
import type { IntakeItem } from "@/lib/admin/validation";
export function IntakeEditor({
  item,
  editable,
  initiallyOpen=false,
}: {
  item: IntakeItem;
  editable: boolean;
  initiallyOpen?:boolean;
}) {
  const [dirty,setDirty]=useState(false);
  useUnsavedDraft(dirty);
  const [state, action, pending] = useActionState(async(previous:import("@/lib/admin/validation").AdminActionState,form:FormData)=>{
    const result=await saveThriftDraft(previous,form);if(result.success)setDirty(false);return result;
  }, {});
  const [step, setStep] = useState(1);
  return (
    <article className="aa-panel aa-product">
      <div className="aa-product-heading">
        <Image src={item.image_path} alt={item.name} width={100} height={125} />
        <div>
          <p className="aa-eyebrow">
            {item.source_id} · {item.status}
          </p>
          <h2>{item.name}</h2>
          <p>
            {item.actual_size
              ? `Recorded size: ${item.actual_size}`
              : "Actual size not yet recorded"}
          </p>
        </div>
      </div>
      <p>{missingProductFacts(item).join(" · ")||"Facts entered — verification and publication pending"}</p>
      <Link href={"/product/"+item.slug} target="_blank" rel="noopener noreferrer" prefetch={false} className="aa-button aa-secondary">Preview saved product</Link>
      <details open={initiallyOpen||undefined}>
        <summary>
          {editable ? "Edit imported draft" : "View product details"}
        </summary>
        <form action={action} className="aa-form" onChange={()=>setDirty(true)}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="updated_at" value={item.updated_at} />
          <ol className="aa-steps" aria-label="Product editor steps">
            {["Name", "Price & size", "Details", "Review"].map(
              (label, index) => (
                <li key={label}>
                  <button
                    type="button"
                    className="aa-secondary"
                    aria-current={step === index + 1 ? "step" : undefined}
                    onClick={() => setStep(index + 1)}
                  >
                    {index + 1}. {label}
                  </button>
                </li>
              ),
            )}
          </ol>
          <fieldset disabled={!editable || pending}>
            <legend className="sr-only">Product draft</legend>
            <div hidden={step !== 1}>
              <label>
                Product name
                <input
                  name="name"
                  defaultValue={item.name}
                  required
                  maxLength={200}
                />
              </label>
              <p>
                Original product photography is preserved. Upload management is
                not connected yet.
              </p>
            </div>
            <div hidden={step !== 2}>
              <div className="aa-fields">
                <label>
                  Price (BDT)
                  <input
                    name="price"
                    inputMode="decimal"
                    defaultValue={(item.price_minor / 100).toFixed(2)}
                    required
                    pattern="[0-9]{1,9}(\.[0-9]{1,2})?"
                  />
                </label>
                <label>
                  Physical quantity
                  <select
                    name="stock_quantity"
                    defaultValue={String(item.stock_quantity)}
                  >
                    <option value="0">0 — no physical stock</option>
                    <option value="1">1 — one original shirt</option>
                  </select>
                </label>
                <label>
                  Actual size
                  <select name="actual_size" defaultValue={item.actual_size||""}><option value="">Not recorded</option>{Array.from(new Set([...(item.actual_size?[item.actual_size]:[]),'S','M','L','XL','2XL','3XL','Over Size'])).map(size=><option key={size} value={size}>{size}</option>)}</select>
                </label>
                <label>
                  Actual color
                  <input
                    name="actual_color"
                    defaultValue={item.actual_color || ""}
                    maxLength={80}
                  />
                </label>
              </div>
              <div className="aa-fields"><label>Actual chest (inches)<input name="chest_inches" inputMode="decimal" type="number" min="0.01" max="100" step="0.01" defaultValue={item.chest_inches??''}/></label><label>Actual length (inches)<input name="length_inches" inputMode="decimal" type="number" min="0.01" max="100" step="0.01" defaultValue={item.length_inches??''}/></label><label>Condition<select name="condition" defaultValue={item.condition||''}><option value="">Not recorded</option><option value="excellent">Excellent</option><option value="very_good">Very good</option><option value="good">Good</option><option value="fair">Fair — describe flaws</option></select></label></div>
              <p>
                Leave unknown measurements blank. This form never creates
                artificial size variants.
              </p>
            </div>
            <div hidden={step !== 3}>
              <label htmlFor={`description-${item.id}`}>Description</label>
              <textarea
                id={`description-${item.id}`}
                name="description"
                rows={5}
                defaultValue={item.description}
                maxLength={20000}
              />
            </div>
            <div hidden={step !== 4}>
              <fieldset><legend>Shirt attributes — choose all that apply</legend><div className="aa-fields">{shirtAttributes.map(attribute=><label key={attribute} style={{display:'flex',alignItems:'center',gap:8,minHeight:44}}><input style={{width:18,minHeight:18}} type="checkbox" name="attributes" value={attribute} defaultChecked={item.attributes.includes(attribute)}/>{attribute}</label>)}</div></fieldset>
              <details><summary>SEO information</summary><label>SEO title<input name="seo_title" maxLength={70} defaultValue={item.seo_title||''}/></label><label htmlFor={`seo-${item.id}`}>SEO description</label><textarea id={`seo-${item.id}`} name="seo_description" maxLength={160} defaultValue={item.seo_description||''}/><p>Saved draft metadata; public SEO is unchanged until the publication workflow is connected.</p></details>
              <h3>Save for verification</h3>
              <p>
                This saves an unpublished draft and records an audit entry. It
                does not create a purchasable SKU or confirm size verification.
                Publication will be added with the dedicated inventory workflow.
              </p>
            </div>
          </fieldset>
          {state.error && <p role="alert">{state.error}</p>}
          {state.success && <p role="status">{state.success}</p>}
          <div className="aa-editor-actions">
            {step > 1 && (
              <button
                key="back"
                type="button"
                className="aa-secondary"
                onClick={() => setStep((value) => Math.max(1, value - 1))}
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                key="continue"
                type="button"
                onClick={() => setStep((value) => Math.min(4, value + 1))}
              >
                Continue
              </button>
            ) : (
              editable && (
                <>
                <button key="save" type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Save draft"}
                </button>
                <button type="submit" name="save_next" value="1" disabled={pending}>Save &amp; Next</button>
                </>
              )
            )}
          </div>
        </form>
      </details>
    </article>
  );
}
