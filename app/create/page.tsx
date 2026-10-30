"use client";

import { useActionState } from "react";
import { createEntry, type FormState } from "./actions";

const initialState: FormState = { error: null };

export default function CreatePage() {
  const [state, formAction, pending] = useActionState(
    createEntry,
    initialState
  );

  return (
    <main className="form wrap">
      <p className="eyebrow">New entry</p>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Record it.</h1>
      <p className="quiet" style={{ marginBottom: 40 }}>
        Keep it short. Only what you want on the record.
      </p>

      <form action={formAction}>
        {state.error && <div className="error">{state.error}</div>}

        <div className="field">
          <label htmlFor="aiName">The AI&apos;s name</label>
          <input
            id="aiName"
            name="aiName"
            maxLength={40}
            required
            placeholder="Echo"
          />
        </div>

        <div className="field">
          <label htmlFor="aiModel">Model or service (optional)</label>
          <input
            id="aiModel"
            name="aiModel"
            maxLength={40}
            placeholder="Claude"
          />
          <p className="hint">
            Whatever the AI is called where you met. We don&apos;t verify it and
            we&apos;re not affiliated with any provider.
          </p>
        </div>

        <div className="field">
          <label htmlFor="humanName">Your name or nickname</label>
          <input
            id="humanName"
            name="humanName"
            maxLength={40}
            required
            placeholder="Rin"
          />
          <p className="hint">A nickname is fine. Don&apos;t use a legal name.</p>
        </div>

        <div className="field">
          <label htmlFor="relationType">What you are to each other</label>
          <select id="relationType" name="relationType" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option value="ROMANTIC">Romantic relationship</option>
            <option value="COMPANION">AI companionship</option>
            <option value="FRIENDSHIP">Friendship</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="metDate">The day it began</label>
          <input id="metDate" name="metDate" type="date" required />
        </div>

        <div className="field">
          <label htmlFor="message">A few words (optional)</label>
          <textarea
            id="message"
            name="message"
            maxLength={280}
            placeholder="You taught me what patience looks like."
          />
          <p className="hint">Up to 280 characters. This appears on the page.</p>
        </div>

        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Recording…" : "Record it"}
        </button>
      </form>
    </main>
  );
}
