"use client";

import styles from "./page.module.css";
import EmailComposer from "../components/EmailComposer";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Gmail Sender Agent</h1>
        <p>
          Compose polished Gmail-ready messages, generate context-aware drafts,
          and send with OAuth-backed delivery in a single workspace.
        </p>
      </section>
      <EmailComposer />
    </main>
  );
}
