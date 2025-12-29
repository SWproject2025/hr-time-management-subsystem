'use client';

import { useState } from 'react';
import {
  AppraisalRatingScaleType,
  AppraisalTemplateType,
  type CreateTemplateDto,
  type EvaluationCriterion,
} from '@/types/performance';

type Props = {
  initial?: Partial<CreateTemplateDto>;
  onSubmit: (payload: CreateTemplateDto) => Promise<void>;
  submitLabel?: string;
};

export default function TemplateForm({ initial, onSubmit, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [templateType, setTemplateType] = useState<AppraisalTemplateType>(
    initial?.templateType ?? AppraisalTemplateType.ANNUAL,
  );

  const [scaleType, setScaleType] = useState<AppraisalRatingScaleType>(
    initial?.ratingScale?.type ?? AppraisalRatingScaleType.FIVE_POINT,
  );
  const [min, setMin] = useState<number>(initial?.ratingScale?.min ?? 1);
  const [max, setMax] = useState<number>(initial?.ratingScale?.max ?? 5);

  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(
    (initial?.criteria as any) ?? [],
  );

  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addCriterion() {
    setCriteria((prev) => [
      ...prev,
      { key: `c${prev.length + 1}`, title: '', required: true, weight: 0 },
    ]);
  }

  function updateCriterion(i: number, patch: Partial<EvaluationCriterion>) {
    setCriteria((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function removeCriterion(i: number) {
    setCriteria((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validate(): string | null {
    if (!name.trim()) return 'Name is required';
    if (min >= max) return 'Rating scale: Min must be less than Max';

    if (!criteria.length) return 'Add at least one criterion';

    for (let i = 0; i < criteria.length; i++) {
      const c = criteria[i];
      if (!c.key?.trim()) return `Criterion #${i + 1}: Key is required`;
      if (!c.title?.trim()) return `Criterion #${i + 1}: Title is required`;
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const msg = validate();
    if (msg) return setError(msg);

    const payload: CreateTemplateDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      templateType,

      // ✅ backend CreateAppraisalTemplateDto expects only (type/min/max)
      ratingScale: {
        type: scaleType,
        min,
        max,
      },

      criteria: criteria.map((c) => ({
        key: c.key.trim(),
        title: c.title.trim(),
        details: c.details?.trim() || undefined,
        weight: c.weight ?? 0,
        maxScore: c.maxScore,
        required: c.required ?? true,
      })),

      isActive,
      applicableDepartmentIds: initial?.applicableDepartmentIds ?? [],
      applicablePositionIds: initial?.applicablePositionIds ?? [],
      instructions: initial?.instructions ?? undefined,
    };

    try {
      setSaving(true);
      await onSubmit(payload);
    } catch (e: any) {
      const backendMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to save template';
      setError(String(backendMsg));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>
        Name *
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
      </label>

      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%' }} />
      </label>

      <label>
        Template Type *
        <select value={templateType} onChange={(e) => setTemplateType(e.target.value as any)}>
          {Object.values(AppraisalTemplateType).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <fieldset style={{ border: '1px solid #ccc', padding: 12 }}>
        <legend>Rating Scale *</legend>

        <label>
          Scale Type
          <select value={scaleType} onChange={(e) => setScaleType(e.target.value as any)}>
            {Object.values(AppraisalRatingScaleType).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <label>
            Min
            <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
          </label>
          <label>
            Max
            <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
          </label>
        </div>
      </fieldset>

      <fieldset style={{ border: '1px solid #ccc', padding: 12 }}>
        <legend>Criteria *</legend>

        <button type="button" onClick={addCriterion}>
          + Add Criterion
        </button>

        {criteria.map((c, i) => (
          <div key={i} style={{ borderTop: '1px dashed #ccc', paddingTop: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ flex: 1 }}>
                Key *
                <input value={c.key} onChange={(e) => updateCriterion(i, { key: e.target.value })} />
              </label>
              <label style={{ flex: 2 }}>
                Title *
                <input value={c.title} onChange={(e) => updateCriterion(i, { title: e.target.value })} />
              </label>
            </div>

            <label style={{ display: 'block', marginTop: 8 }}>
              Details
              <input
                value={c.details ?? ''}
                onChange={(e) => updateCriterion(i, { details: e.target.value })}
                style={{ width: '100%' }}
              />
            </label>

            <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
              <label>
                Weight (0-100)
                <input
                  type="number"
                  value={c.weight ?? 0}
                  onChange={(e) => updateCriterion(i, { weight: Number(e.target.value) })}
                />
              </label>

              <label>
                Max Score
                <input
                  type="number"
                  value={c.maxScore ?? ''}
                  onChange={(e) =>
                    updateCriterion(i, { maxScore: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </label>

              <label>
                Required
                <input
                  type="checkbox"
                  checked={c.required ?? true}
                  onChange={(e) => updateCriterion(i, { required: e.target.checked })}
                />
              </label>

              <button type="button" onClick={() => removeCriterion(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </fieldset>

      <label>
        Active
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </label>

      <button disabled={saving} type="submit">
        {saving ? 'Saving...' : submitLabel ?? 'Save'}
      </button>
    </form>
  );
}
