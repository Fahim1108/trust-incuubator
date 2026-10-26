"use client";

import { contact } from "@/config/contact";
import styles from "./WhatsAppSupport.module.css";
import { useEffect, useRef, useState } from "react";

export function WhatsAppSupport() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const link = ref.current;
        if (!link) return;
        const mobile = window.innerWidth < 768;
        const keyboard = mobile && (document.activeElement?.matches('input, textarea, select') || (window.visualViewport && innerHeight - window.visualViewport.height > 100));
        const rect = link.getBoundingClientRect();
        const overlap = mobile && Array.from(document.querySelectorAll<HTMLElement>('main input, main textarea, main select, main button, [data-checkout-content] p, [data-checkout-content] label')).some(element => {
          const r = element.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.left < rect.right + 8 && r.right > rect.left - 8 && r.top < rect.bottom + 8 && r.bottom > rect.top - 8;
        });
        setVisible(!keyboard && !overlap);
      });
    }
    update();
    document.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    window.visualViewport?.addEventListener('resize', update);
    const observer = new MutationObserver(update);
    const content = document.querySelector('[data-checkout-content]');
    if (content) observer.observe(content, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      document.removeEventListener('scroll', update, true); window.removeEventListener('resize', update);
      document.removeEventListener('focusin', update); document.removeEventListener('focusout', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return <a ref={ref} href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer"
    aria-label="Contact us on WhatsApp"
    aria-hidden={!visible} tabIndex={visible ? 0 : -1} data-whatsapp-support
    className={`${styles.button} aa-press fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#25D366] text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:bottom-6 md:right-6 ${visible ? '' : 'invisible pointer-events-none'}`}>
    <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor" aria-hidden><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0 11.9 11.9 0 0 0 1.7 17.9L0 24l6.3-1.7A12 12 0 0 0 24 12c0-3.2-1.2-6.2-3.5-8.5ZM12 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 1 1 12 22Zm5.5-7.5c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2l-.9 1c-.2.2-.3.2-.6.1a8.2 8.2 0 0 1-4-3.5c-.3-.4.3-.6.8-1.5.1-.2 0-.4 0-.6l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4a3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.2.1.2 2.2 3.4 5.4 4.8 2 .9 2.8.9 3.8.8.6-.1 1.8-.7 2-1.4.3-.6.3-1.2.2-1.4-.1-.1-.3-.2-.6-.4Z"/></svg>
  </a>;
}
