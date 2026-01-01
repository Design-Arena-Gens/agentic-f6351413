"use client";

import cn from "clsx";
import { useMemo } from "react";
import styles from "./EmailPreview.module.css";

type Props = {
  subject: string;
  html: string;
  open: boolean;
  onToggle: () => void;
};

function sanitizeHtml(html: string) {
  if (typeof window === "undefined") {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, style, iframe, object, embed").forEach((node) => {
    node.parentNode?.removeChild(node);
  });
  template.content.querySelectorAll("[onload],[onclick],[onerror],[style]").forEach((node) => {
    if (node instanceof HTMLElement) {
      node.removeAttribute("onload");
      node.removeAttribute("onclick");
      node.removeAttribute("onerror");
      node.removeAttribute("style");
    }
  });
  return template.innerHTML;
}

export default function EmailPreview({ subject, html, open, onToggle }: Props) {
  const cleanHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <aside className={cn(styles.preview, open && styles.open)}>
      <header className={styles.header}>
        <div>
          <h3>Live Gmail Preview</h3>
          <p>Sanitized HTML view, perfect for last checks.</p>
        </div>
        <button type="button" onClick={onToggle} className={styles.toggle}>
          {open ? "Hide" : "Show"}
        </button>
      </header>
      <div className={styles.subject}>
        <span>Subject</span>
        <strong>{subject || "—"}</strong>
      </div>
      <article className={styles.body} dangerouslySetInnerHTML={{ __html: cleanHtml || "<p>—</p>" }} />
    </aside>
  );
}
