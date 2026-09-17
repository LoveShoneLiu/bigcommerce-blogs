"use client";

import { useFormStatus } from "react-dom";
import { repairScriptsAction, saveSettingsAction } from "@/app/actions";
import type { ThemePreset } from "@/features/theme/presets";
import { THEME_META, THEME_PRESETS } from "@/features/theme/presets";

type ChannelSummary = {
  id: number;
  name: string;
  platform: string;
};

type DashboardFormProps = {
  context: string;
  capability: string;
  reason: string;
  canConfigure: boolean;
  themePreset: ThemePreset;
  seoEnabled: boolean;
  scriptsMissing: boolean;
  scriptDetails: string[];
  enabledChannelName?: string;
  otherChannels: ChannelSummary[];
  saveAction?: (formData: FormData) => void | Promise<void>;
  repairAction?: (formData: FormData) => void | Promise<void>;
};

function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button className="bd-button" type="submit" disabled={disabled || pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function DashboardForm({
  context,
  capability,
  reason,
  canConfigure,
  themePreset,
  seoEnabled,
  scriptsMissing,
  scriptDetails,
  enabledChannelName,
  otherChannels,
  saveAction = saveSettingsAction,
  repairAction = repairScriptsAction,
}: DashboardFormProps) {
  const statusClass =
    capability === "stencil_blog"
      ? "bd-banner is-ok"
      : capability === "catalyst_limited"
        ? "bd-banner is-warn"
        : "bd-banner is-bad";

  const statusLabel =
    capability === "stencil_blog"
      ? "Supported"
      : capability === "catalyst_limited"
        ? "Limited"
        : "Unsupported";

  return (
    <div className="bd-stack">
      <section className={statusClass} aria-live="polite">
        <p className="bd-kicker">{statusLabel}</p>
        <p>{reason}</p>
        {enabledChannelName ? (
          <p className="bd-muted">Active storefront: {enabledChannelName}</p>
        ) : null}
      </section>

      {scriptsMissing ? (
        <section className="bd-banner is-warn">
          <p className="bd-kicker">Repair needed</p>
          <p>
            Storefront scripts created by this app are missing. They are not
            restored automatically.
          </p>
          <ul>
            {scriptDetails.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <form action={repairAction}>
            <input type="hidden" name="context" value={context} />
            <input type="hidden" name="themePreset" value={themePreset} />
            {seoEnabled ? <input type="hidden" name="seoEnabled" value="on" /> : null}
            <SubmitButton label="Repair installation" pendingLabel="Repairing…" />
          </form>
        </section>
      ) : null}

      <form className="bd-stack" action={saveAction}>
        <input type="hidden" name="context" value={context} />
        <fieldset className="bd-fieldset" disabled={!canConfigure}>
          <legend>Blog theme</legend>
          <div className="bd-theme-grid">
            {THEME_PRESETS.map((preset) => (
              <label key={preset} className="bd-theme-card">
                <input
                  type="radio"
                  name="themePreset"
                  value={preset}
                  defaultChecked={preset === themePreset}
                />
                <span className={`bd-theme-preview is-${preset}`} aria-hidden="true" />
                <strong>{THEME_META[preset].label}</strong>
                <span>{THEME_META[preset].summary}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="bd-fieldset" disabled={!canConfigure}>
          <legend>SEO</legend>
          <label className="bd-check">
            <input
              type="checkbox"
              name="seoEnabled"
              defaultChecked={seoEnabled}
            />
            Add BlogPosting and breadcrumb structured data on native blog pages
          </label>
        </fieldset>

        <SubmitButton
          label="Save"
          pendingLabel="Saving…"
          disabled={!canConfigure}
        />
        {!canConfigure ? (
          <p className="bd-muted">
            Saving is disabled until this store uses a supported Stencil blog.
          </p>
        ) : null}
      </form>

      {otherChannels.length > 0 ? (
        <section>
          <h2>Other storefronts</h2>
          <p className="bd-muted">
            This release injects scripts on the default Stencil channel only.
          </p>
          <ul>
            {otherChannels.map((channel) => (
              <li key={channel.id}>
                {channel.name} ({channel.platform})
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
