'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceApi } from '@/services/performance.service';
import { AppraisalTemplateType, type CreateCycleDto } from '@/types/performance';

type SeedRow = {
  employeeProfileId: string;
  managerProfileId: string;
  templateId: string;
  departmentId: string;
  positionId?: string;
  dueDate?: string;
};

export default function CreateCyclePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cycleType, setCycleType] = useState<AppraisalTemplateType>(
    AppraisalTemplateType.ANNUAL,
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [managerDueDate, setManagerDueDate] = useState('');
  const [ackDueDate, setAckDueDate] = useState('');

  // ✅ NEW: seedingAssignments (creates AppraisalAssignment records when cycle is created)
  const [seeds, setSeeds] = useState<SeedRow[]>([
    {
      employeeProfileId: '',
      managerProfileId: '',
      templateId: '',
      departmentId: '',
      positionId: '',
      dueDate: '',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSeedRow() {
    setSeeds((prev) => [
      ...prev,
      {
        employeeProfileId: '',
        managerProfileId: '',
        templateId: '',
        departmentId: '',
        positionId: '',
        dueDate: '',
      },
    ]);
  }

  function removeSeedRow(index: number) {
    setSeeds((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSeedRow(index: number, patch: Partial<SeedRow>) {
    setSeeds((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Name is required');
    if (!startDate || !endDate) return setError('Start and End dates are required');

    // ✅ Clean + validate seedingAssignments (optional)
    const cleanedSeeds = seeds
      .map((s) => ({
        employeeProfileId: s.employeeProfileId.trim(),
        managerProfileId: s.managerProfileId.trim(),
        templateId: s.templateId.trim(),
        departmentId: s.departmentId.trim(),
        positionId: s.positionId?.trim() || undefined,
        dueDate: s.dueDate?.trim() || undefined,
      }))
      // remove completely empty rows
      .filter(
        (s) =>
          s.employeeProfileId ||
          s.managerProfileId ||
          s.templateId ||
          s.departmentId ||
          s.positionId ||
          s.dueDate,
      );

    // If user started filling seeding rows, enforce required fields for each row
    for (const [i, s] of cleanedSeeds.entries()) {
      if (!s.employeeProfileId) return setError(`Seeding row ${i + 1}: employeeProfileId is required`);
      if (!s.managerProfileId) return setError(`Seeding row ${i + 1}: managerProfileId is required`);
      if (!s.templateId) return setError(`Seeding row ${i + 1}: templateId is required`);
      if (!s.departmentId) return setError(`Seeding row ${i + 1}: departmentId is required`);
    }

    const payload: CreateCycleDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      cycleType,
      startDate,
      endDate,
      managerDueDate: managerDueDate || undefined,
      employeeAcknowledgementDueDate: ackDueDate || undefined,

      // ✅ include only if provided
      ...(cleanedSeeds.length > 0 ? { seedingAssignments: cleanedSeeds } : {}),
    };

    try {
      setSaving(true);
      await performanceApi.createCycle(payload);
      router.push('/performance/cycles');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create cycle');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>Create Appraisal Cycle</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Name *
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label>
          Cycle Type *
          <select value={cycleType} onChange={(e) => setCycleType(e.target.value as any)}>
            {Object.values(AppraisalTemplateType).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label>
            Start Date *
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label>
            End Date *
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          <label>
            Manager Due Date
            <input type="date" value={managerDueDate} onChange={(e) => setManagerDueDate(e.target.value)} />
          </label>

          <label>
            Employee Acknowledgement Due Date
            <input type="date" value={ackDueDate} onChange={(e) => setAckDueDate(e.target.value)} />
          </label>
        </div>

        {/* ✅ NEW: Seeding assignments */}
        <fieldset style={{ border: '1px solid #ccc', padding: 12 }}>
          <legend>Seeding Assignments (optional but recommended)</legend>
          <p style={{ marginTop: 0 }}>
            If you add at least 1 seeding row, the backend will create <b>AppraisalAssignment</b> records
            automatically when the cycle is created.
          </p>

          <button type="button" onClick={addSeedRow} style={{ marginBottom: 12 }}>
            + Add Seeding Row
          </button>

          {seeds.map((row, i) => (
            <div
              key={i}
              style={{
                borderTop: i === 0 ? 'none' : '1px dashed #ccc',
                paddingTop: i === 0 ? 0 : 12,
                marginTop: i === 0 ? 0 : 12,
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ flex: 1, minWidth: 260 }}>
                  employeeProfileId *
                  <input
                    value={row.employeeProfileId}
                    onChange={(e) => updateSeedRow(i, { employeeProfileId: e.target.value })}
                    placeholder="Mongo ObjectId"
                  />
                </label>

                <label style={{ flex: 1, minWidth: 260 }}>
                  managerProfileId *
                  <input
                    value={row.managerProfileId}
                    onChange={(e) => updateSeedRow(i, { managerProfileId: e.target.value })}
                    placeholder="Mongo ObjectId"
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ flex: 1, minWidth: 260 }}>
                  templateId *
                  <input
                    value={row.templateId}
                    onChange={(e) => updateSeedRow(i, { templateId: e.target.value })}
                    placeholder="Mongo ObjectId (AppraisalTemplate)"
                  />
                </label>

                <label style={{ flex: 1, minWidth: 260 }}>
                  departmentId *
                  <input
                    value={row.departmentId}
                    onChange={(e) => updateSeedRow(i, { departmentId: e.target.value })}
                    placeholder="Mongo ObjectId (Department)"
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ flex: 1, minWidth: 260 }}>
                  positionId (optional)
                  <input
                    value={row.positionId ?? ''}
                    onChange={(e) => updateSeedRow(i, { positionId: e.target.value })}
                    placeholder="Mongo ObjectId (Position)"
                  />
                </label>

                <label style={{ flex: 1, minWidth: 260 }}>
                  dueDate (optional)
                  <input
                    type="date"
                    value={row.dueDate ?? ''}
                    onChange={(e) => updateSeedRow(i, { dueDate: e.target.value })}
                  />
                </label>
              </div>

              {seeds.length > 1 && (
                <button type="button" onClick={() => removeSeedRow(i)} style={{ width: 'fit-content' }}>
                  Remove row
                </button>
              )}
            </div>
          ))}
        </fieldset>

        <button disabled={saving} type="submit">
          {saving ? 'Creating...' : 'Create Cycle'}
        </button>
      </form>
    </div>
  );
}
