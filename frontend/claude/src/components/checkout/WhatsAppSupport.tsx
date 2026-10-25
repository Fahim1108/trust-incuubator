"use client";

import { MessageCircle } from "lucide-react";
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
        const overlap = mobile && Array.from(document.querySelectorAll<HTMLElement>('[data-checkout-content] input, [data-checkout-content] textarea, [data-checkout-content] select, [data-checkout-content] button, [data-checkout-content] p, [data-checkout-content] label')).some(element => {
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
  return <a ref={ref} href="https://wa.me/8801632915921" target="_blank" rel="noopener noreferrer"
    aria-label="WhatsApp support: 01632915921 (opens in a new tab)"
    aria-hidden={!visible} tabIndex={visible ? 0 : -1} data-whatsapp-support
    className={`aa-press fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#400000] text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:bottom-6 md:right-6 ${visible ? '' : 'invisible pointer-events-none'}`}>
    <MessageCircle size={23} aria-hidden />
  </a>;
}
