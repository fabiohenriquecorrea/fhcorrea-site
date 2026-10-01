"use client";

import { useId, useState } from "react";
import type { Project } from "@/lib/types";
import { isVimeo, parseVimeo } from "@/lib/vimeo";
import { MediaPicker, Thumb } from "./MediaPicker";
import { getAt, type Field } from "./schema";

type Change = (key: string, value: unknown) => void;

function Arrow({ dir }: { dir: "up" | "down" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={dir === "up" ? "M8 13V3M4 7l4-4 4 4" : "M8 3v10M4 9l4 4 4-4"}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function VimeoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  const [text, setText] = useState(isVimeo(value) ? value : "");
  const invalid = text.trim() !== "" && !isVimeo(text);
  return (
    <div className="ed-vimeo">
      <label htmlFor={id} className="ed-hint">
        ou cole um link do Vimeo (vídeos pesados ficam lá, não no site)
      </label>
      <div className="ed-vimeo-row">
        <input
          id={id}
          className="ed-input"
          placeholder="https://vimeo.com/123456789"
          value={text}
          aria-invalid={invalid}
          onChange={(e) => {
            setText(e.target.value);
            if (isVimeo(e.target.value)) onChange(e.target.value.trim());
          }}
        />
      </div>
      {invalid && <span className="ed-error">Esse não parece um link do Vimeo. Copie o endereço do vídeo no Vimeo.</span>}
    </div>
  );
}

function MediaField({
  label,
  hint,
  value,
  onChange,
  allowVimeo = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  allowVimeo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const vimeo = parseVimeo(value);
  return (
    <div className="ed-field">
      <span className="ed-label">{label}</span>
      <div className="ed-media">
        <button type="button" className="ed-media-preview" onClick={() => setOpen(true)} aria-label={`Trocar ${label.toLowerCase()}`}>
          <Thumb src={value} />
          <span className="ed-media-over">{value ? "Trocar" : "Escolher"}</span>
        </button>
        <div className="ed-media-meta">
          <span className="ed-media-name">
            {vimeo ? `Vimeo · ${vimeo.id}` : value ? value.split("/").pop() : "Nenhum arquivo"}
          </span>
          <div className="ed-media-actions">
            <button type="button" className="ed-link" onClick={() => setOpen(true)}>
              {value ? "Trocar" : "Escolher"}
            </button>
            {value && (
              <button type="button" className="ed-link is-danger" onClick={() => onChange("")}>
                Remover
              </button>
            )}
          </div>
        </div>
      </div>
      {allowVimeo && <VimeoInput key={value} value={value} onChange={onChange} />}
      {hint && <span className="ed-hint">{hint}</span>}
      {open && (
        <MediaPicker
          current={value}
          onClose={() => setOpen(false)}
          onPick={(src) => {
            onChange(src);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function FieldView({
  field,
  data,
  onChange,
  onOpenCase,
  onAddCase,
  onMoveCase,
}: {
  field: Field;
  data: Record<string, unknown>;
  onChange: Change;
  onOpenCase?: (i: number) => void;
  onAddCase?: () => void;
  onMoveCase?: (from: number, to: number) => void;
}) {
  const id = useId();

  if (field.kind === "projects") {
    const projects = (data.__projects as Project[]) ?? [];
    return (
      <div className="ed-field">
        <span className="ed-label">Páginas de projeto</span>
        <span className="ed-hint">Cada projeto tem uma página própria. Clique para editar; a ordem vale para o “próximo projeto”.</span>
        <ul className="ed-list">
          {projects.map((p, i) => (
            <li key={p.slug} className="ed-list-row">
              <Thumb src={p.cover?.src} />
              <button type="button" className="ed-list-title" onClick={() => onOpenCase?.(i)}>
                <strong>{p.client}</strong>
                <span>{p.fronts.join(" · ")}</span>
              </button>
              <div className="ed-list-tools">
                <button type="button" className="ed-icon-btn" disabled={i === 0} onClick={() => onMoveCase?.(i, i - 1)} aria-label="Mover para cima">
                  <Arrow dir="up" />
                </button>
                <button
                  type="button"
                  className="ed-icon-btn"
                  disabled={i === projects.length - 1}
                  onClick={() => onMoveCase?.(i, i + 1)}
                  aria-label="Mover para baixo"
                >
                  <Arrow dir="down" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="ed-btn ed-btn-ghost ed-add" onClick={onAddCase}>
          + Novo projeto
        </button>
      </div>
    );
  }

  if (field.kind === "heading") {
    return (
      <div className="ed-field ed-heading">
        <span className="ed-label">{field.label}</span>
        {field.hint && <span className="ed-hint">{field.hint}</span>}
      </div>
    );
  }

  const value = getAt(data, field.key);

  switch (field.kind) {
    case "text":
      return (
        <label className="ed-field" htmlFor={id}>
          <span className="ed-label">{field.label}</span>
          <input
            id={id}
            className="ed-input"
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
          {field.hint && <span className="ed-hint">{field.hint}</span>}
        </label>
      );
    case "textarea": {
      const text = (value as string) ?? "";
      return (
        <label className="ed-field" htmlFor={id}>
          <span className="ed-label">
            {field.label}
            <span className="ed-count">{text.length}</span>
          </span>
          <textarea
            id={id}
            className="ed-input"
            rows={field.rows ?? 3}
            value={text}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
          {field.hint && <span className="ed-hint">{field.hint}</span>}
        </label>
      );
    }
    case "number":
      return (
        <label className="ed-field" htmlFor={id}>
          <span className="ed-label">{field.label}</span>
          <div className="ed-suffix">
            <input
              id={id}
              className="ed-input"
              type="number"
              min={field.min}
              max={field.max}
              value={(value as number) ?? field.min}
              onChange={(e) => onChange(field.key, Math.min(field.max, Math.max(field.min, Number(e.target.value) || field.min)))}
            />
            {field.suffix && <span>{field.suffix}</span>}
          </div>
          {field.hint && <span className="ed-hint">{field.hint}</span>}
        </label>
      );
    case "range":
      return (
        <label className="ed-field" htmlFor={id}>
          <span className="ed-label">
            {field.label}
            <span className="ed-count">
              {(value as number) ?? 0}
              {field.suffix}
            </span>
          </span>
          <input
            id={id}
            className="ed-range"
            type="range"
            min={field.min}
            max={field.max}
            value={(value as number) ?? 0}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
          />
        </label>
      );
    case "select":
      return (
        <div className="ed-field">
          <span className="ed-label">{field.label}</span>
          <div className="ed-seg is-wrap" role="radiogroup" aria-label={field.label}>
            {field.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                aria-pressed={value === o.value}
                onClick={() => onChange(field.key, o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          {field.hint && <span className="ed-hint">{field.hint}</span>}
        </div>
      );
    case "multi": {
      const list = (value as string[]) ?? [];
      return (
        <div className="ed-field">
          <span className="ed-label">{field.label}</span>
          <div className="ed-seg is-wrap" role="group" aria-label={field.label}>
            {field.options.map((o) => {
              const on = list.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    onChange(
                      field.key,
                      on ? list.filter((v) => v !== o.value) : field.options.map((x) => x.value).filter((v) => v === o.value || list.includes(v)),
                    )
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {field.hint && <span className="ed-hint">{field.hint}</span>}
        </div>
      );
    }
    case "mode": {
      const modes = [
        { mode: "online", label: "No ar", hint: "Todo mundo vê o site normalmente." },
        { mode: "construction", label: "Em construção", hint: "Visitantes veem uma página de lançamento. Use antes de estrear." },
        { mode: "maintenance", label: "Em manutenção", hint: "Visitantes veem um aviso temporário. Use para ajustes rápidos." },
      ];
      return (
        <div className="ed-field">
          <span className="ed-label">{field.label}</span>
          <div className="ed-modes" role="radiogroup" aria-label={field.label}>
            {modes.map((m) => (
              <button
                key={m.mode}
                type="button"
                role="radio"
                aria-checked={value === m.mode}
                className="ed-mode"
                data-mode={m.mode}
                onClick={() => onChange(field.key, m.mode)}
              >
                <span className="ed-mode-dot" aria-hidden="true" />
                <strong>{m.label}</strong>
                <span>{m.hint}</span>
              </button>
            ))}
          </div>
          <span className="ed-hint">A mudança vale para os visitantes depois de clicar em Publicar.</span>
        </div>
      );
    }
    case "toggle":
      return (
        <label className="ed-toggle">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(field.key, e.target.checked)} />
          <span className="ed-switch" aria-hidden="true" />
          <span>{field.label}</span>
        </label>
      );
    case "media":
      return (
        <MediaField
          label={field.label}
          hint={field.hint}
          value={(value as string) ?? ""}
          allowVimeo={Boolean(field.vimeo)}
          onChange={(v) => onChange(field.key, v)}
        />
      );
    case "strings": {
      const list = (value as string[]) ?? [];
      return (
        <div className="ed-field">
          <span className="ed-label">{field.label}</span>
          <ul className="ed-strings">
            {list.map((s, i) => (
              <li key={i}>
                <input
                  className="ed-input"
                  value={s}
                  aria-label={`${field.label} ${i + 1}`}
                  onChange={(e) => onChange(field.key, list.map((x, j) => (j === i ? e.target.value : x)))}
                />
                <button
                  type="button"
                  className="ed-icon-btn"
                  aria-label="Remover"
                  onClick={() => onChange(field.key, list.filter((_, j) => j !== i))}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="ed-btn ed-btn-ghost ed-add" onClick={() => onChange(field.key, [...list, ""])}>
            + {field.addLabel}
          </button>
        </div>
      );
    }
    case "list":
      return <ListField field={field} list={(value as Record<string, unknown>[]) ?? []} onChange={(v) => onChange(field.key, v)} />;
  }
}

function ListField({
  field,
  list,
  onChange,
}: {
  field: Extract<Field, { kind: "list" }>;
  list: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="ed-field">
      <span className="ed-label">{field.label}</span>
      {field.hint && <span className="ed-hint">{field.hint}</span>}
      <ul className="ed-list">
        {list.map((item, i) => (
          <li key={i} className={`ed-list-item ${open === i ? "is-open" : ""}`}>
            <div className="ed-list-row">
              <Thumb src={field.itemMedia?.(item)} />
              <button
                type="button"
                className="ed-list-title"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <strong>{field.itemTitle(item, i)}</strong>
                <span>{open === i ? "Fechar" : "Editar"}</span>
              </button>
              <div className="ed-list-tools">
                <button
                  type="button"
                  className="ed-icon-btn"
                  disabled={i === 0}
                  onClick={() => {
                    onChange(move(list, i, i - 1));
                    if (open === i) setOpen(i - 1);
                  }}
                  aria-label="Mover para cima"
                >
                  <Arrow dir="up" />
                </button>
                <button
                  type="button"
                  className="ed-icon-btn"
                  disabled={i === list.length - 1}
                  onClick={() => {
                    onChange(move(list, i, i + 1));
                    if (open === i) setOpen(i + 1);
                  }}
                  aria-label="Mover para baixo"
                >
                  <Arrow dir="down" />
                </button>
                <button
                  type="button"
                  className="ed-icon-btn is-danger"
                  aria-label="Remover"
                  onClick={() => {
                    if (!window.confirm("Remover este item?")) return;
                    onChange(list.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.5 8.5h5l.5-8.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
            {open === i && (
              <div className="ed-list-body">
                {field.fields.map((f) => (
                    <FieldView
                      key={"key" in f ? f.key : f.kind === "heading" ? f.label : f.kind}
                      field={f}
                      data={item}
                      onChange={(k, v) => onChange(list.map((x, j) => (j === i ? { ...x, [k]: v } : x)))}
                    />
                  ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ed-btn ed-btn-ghost ed-add"
        onClick={() => {
          onChange([...list, field.create()]);
          setOpen(list.length);
        }}
      >
        + {field.addLabel}
      </button>
    </div>
  );
}
