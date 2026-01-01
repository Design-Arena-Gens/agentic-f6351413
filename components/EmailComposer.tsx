"use client";

import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import styles from "./EmailComposer.module.css";
import { useToast } from "./ToastProvider";
import EmailPreview from "./EmailPreview";

type DraftOptions = {
  objective: string;
  tone: ToneOption;
  context: string;
};

type ToneOption =
  | "professional"
  | "friendly"
  | "persuasive"
  | "apologetic"
  | "urgent";

const payloadSchema = z.object({
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).default([]),
  bcc: z.array(z.string().email()).default([]),
  subject: z.string().min(1),
  body: z.string().min(1),
  replyTo: z.string().email().optional()
});

const toneLabels: Record<ToneOption, string> = {
  professional: "Professional",
  friendly: "Friendly",
  persuasive: "Persuasive",
  apologetic: "Apologetic",
  urgent: "Urgent"
};

function sanitizeAddresses(value: string) {
  return value
    .split(/[,\n;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function segmentObjective(objective: string) {
  const segments = objective
    .split(/\r?\n|;/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length > 0) return segments;
  if (objective.includes(". ")) {
    return objective
      .split(".")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return objective ? [objective] : [];
}

function buildDraft({ objective, tone, context }: DraftOptions) {
  const now = new Date();
  const weekday = now.toLocaleDateString(undefined, { weekday: "long" });
  const templateBlocks: Record<ToneOption, { greeting: string; signoff: string; closing: string }> =
    {
      professional: {
        greeting: "I hope you're well.",
        closing: "Please let me know if you need anything else.",
        signoff: "Best regards"
      },
      friendly: {
        greeting: "Hope you've been doing great!",
        closing: "Excited to hear your thoughts.",
        signoff: "Cheers"
      },
      persuasive: {
        greeting: "I appreciate your time.",
        closing: "I'd love to move this forward together.",
        signoff: "Warm regards"
      },
      apologetic: {
        greeting: "I want to acknowledge what happened right away.",
        closing: "Thanks for your patience and understanding.",
        signoff: "Sincerely"
      },
      urgent: {
        greeting: "I'm reaching out with an urgent update.",
        closing: "A quick reply would be incredibly helpful.",
        signoff: "Thank you"
      }
    };

  const contextBlock = context
    ? `<p><strong>Context</strong>: ${context}</p>`
    : "";

  const intro = templateBlocks[tone];
  const body =
    tone === "apologetic"
      ? "I take full responsibility for the inconvenience and I want to outline how we'll put this right immediately."
      : tone === "urgent"
        ? "I'm sharing a concise overview so we can act on this without delay."
        : "I'm outlining the key points so you have everything you need at a glance.";

  const checklist =
    tone === "persuasive"
      ? [
          "Why this matters now",
          "Key benefits you can expect",
          "What support we provide next"
        ]
      : tone === "apologetic"
        ? [
            "What caused the issue",
            "Immediate steps we're taking",
            "How we'll prevent this going forward"
          ]
        : [
            "Current status",
            "Next recommended steps",
            "Timeline and owners"
          ];

  const objectiveSegments = segmentObjective(objective);

  const bullets = checklist
    .map((item, index) => {
      const segment =
        objectiveSegments.length > 0
          ? objectiveSegments[index] ?? objectiveSegments[objectiveSegments.length - 1]
          : undefined;
      const detail = segment || "Add detail here.";
      return `<li><strong>${item}:</strong> ${detail}</li>`;
    })
    .join("");

  return `
    <p>${intro.greeting}</p>
    <p>${body}</p>
    ${contextBlock}
    <ul>${bullets}</ul>
    <p>${intro.closing}</p>
    <p>${intro.signoff},<br/>${weekday === "Friday" ? "Have a restful weekend!" : "All the best"},<br/>{{sender_name}}</p>
  `;
}

export default function EmailComposer() {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [objective, setObjective] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<ToneOption>("professional");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { setToasts } = useToast();

  const previewContent = useMemo(() => {
    const replacement = process.env.NEXT_PUBLIC_SENDER_NAME || "Your Name";
    return body.replace(/{{sender_name}}/gi, replacement);
  }, [body]);

  const pushToast = useCallback(
    (message: string) => setToasts((prev) => [...prev, message]),
    [setToasts]
  );

  const onGenerate = useCallback(() => {
    const draft = buildDraft({ objective, tone, context });
    setBody(draft.trim());
    pushToast("Draft generated");
    setShowPreview(true);
  }, [objective, tone, context, pushToast]);

  const onSend = useCallback(async () => {
    setSending(true);
    try {
      const payload = payloadSchema.parse({
        to: sanitizeAddresses(to),
        cc: sanitizeAddresses(cc),
        bcc: sanitizeAddresses(bcc),
        subject,
        body,
        replyTo: replyTo.trim() || undefined
      });

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || `Request failed with ${response.status}`);
      }

      pushToast("Email dispatched via Gmail");
      setShowPreview(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error sending email";
      pushToast(message);
    } finally {
      setSending(false);
    }
  }, [to, cc, bcc, subject, body, replyTo, pushToast]);

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h2>Compose &amp; Send</h2>
          <p>
            Draft precise outreach, personalize the tone, and deliver through your Gmail account.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onGenerate} className={styles.secondary}>
            Generate Draft
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !body || !subject || !to.trim()}
            className={styles.primary}
          >
            {sending ? "Sending…" : "Send with Gmail"}
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.formColumn}>
          <label>
            <span>To</span>
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="name@example.com, second@example.com"
            />
          </label>
          <div className={styles.row}>
            <label>
              <span>CC</span>
              <input
                value={cc}
                onChange={(event) => setCc(event.target.value)}
                placeholder="Optional"
              />
            </label>
            <label>
              <span>BCC</span>
              <input
                value={bcc}
                onChange={(event) => setBcc(event.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>
          <label>
            <span>Reply-To</span>
            <input
              value={replyTo}
              onChange={(event) => setReplyTo(event.target.value)}
              placeholder="Optional reply-to address"
            />
          </label>
          <label>
            <span>Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject line"
            />
          </label>
          <label>
            <span>Objective</span>
            <textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              rows={3}
              placeholder="What outcome are you trying to achieve?"
            />
          </label>
          <label>
            <span>Additional Context</span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              rows={3}
              placeholder="Add specifics, deadlines, data points…"
            />
          </label>
          <label className={styles.tonesLabel}>
            <span>Tone</span>
            <div className={styles.tones}>
              {(Object.keys(toneLabels) as ToneOption[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={option === tone ? styles.toneActive : styles.tone}
                >
                  {toneLabels[option]}
                </button>
              ))}
            </div>
          </label>
          <label>
            <span>Body</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              placeholder="Compose your email or generate a draft above"
            />
          </label>
        </div>
        <EmailPreview
          html={previewContent}
          subject={subject}
          open={showPreview}
          onToggle={() => setShowPreview(!showPreview)}
        />
      </div>
    </section>
  );
}
