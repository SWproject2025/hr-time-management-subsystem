'use client';
import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const OvertimeSchema = z.object({
  name: z.string().min(1),
  multiplier: z.number().min(1),
  approvalRequired: z.boolean(),
  maxDailyMinutes: z.number().min(0).optional(),
  maxWeeklyMinutes: z.number().min(0).optional(),
  maxMonthlyMinutes: z.number().min(0).optional(),
  weekendRule: z.string().optional(),
});

type OvertimeForm = z.infer<typeof OvertimeSchema>;

export default function OvertimePage() {
  const [loading, setLoading] = useState(true);
  const [overtimeRules, setOvertimeRules] = useState<any[]>([]);
  const [activePolicy, setActivePolicy] = useState<any | null>(null);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<OvertimeForm>({
    resolver: zodResolver(OvertimeSchema),
    defaultValues: {
      name: 'Default Overtime Policy',
      multiplier: 1.5,
      approvalRequired: true,
      maxDailyMinutes: 0,
      maxWeeklyMinutes: 0,
      maxMonthlyMinutes: 0,
      weekendRule: 'Standard',
    }
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const rules = await timeManagementService.getAllOvertimeRules();
        if (!mounted) return;
        setOvertimeRules(rules || []);
        const policy = rules && rules.length ? rules[0] : null;
        setActivePolicy(policy);
        if (policy) {
          reset({
            name: policy.name || 'Default Overtime Policy',
            multiplier: policy.multiplier || 1.5,
            approvalRequired: !!policy.requiresApproval,
            maxDailyMinutes: policy.minMinutesForOvertime || 0,
            maxWeeklyMinutes: 0,
            maxMonthlyMinutes: 0,
            weekendRule: policy.description || '',
          });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to load overtime policy', variant: 'destructive' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [reset, toast]);

  async function onSubmit(values: OvertimeForm) {
    const ok = window.confirm('Save overtime policy changes?');
    if (!ok) return;
    try {
      if (activePolicy && activePolicy._id) {
        await timeManagementService.updateOvertimeRule(activePolicy._id, {
          name: values.name,
          multiplier: values.multiplier,
          requiresApproval: values.approvalRequired,
          description: values.weekendRule,
        });
        toast({ title: 'Saved', description: 'Overtime policy updated' });
      } else {
        await timeManagementService.createOvertimeRule({
          name: values.name,
          multiplier: values.multiplier,
          requiresApproval: values.approvalRequired,
          description: values.weekendRule,
        });
        toast({ title: 'Saved', description: 'Overtime policy created' });
      }
      // Reload rules after save
      const rules = await timeManagementService.getAllOvertimeRules();
      setOvertimeRules(rules || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to save', variant: 'destructive' });
    }
  }

  async function handleDeleteRule(ruleId: string) {
    const ok = window.confirm('Are you sure you want to delete this overtime rule?');
    if (!ok) return;
    try {
      await timeManagementService.deleteOvertimeRule(ruleId);
      toast({ title: 'Deleted', description: 'Overtime rule deleted successfully' });
      // Reload rules after delete
      const rules = await timeManagementService.getAllOvertimeRules();
      setOvertimeRules(rules || []);
      if (activePolicy && activePolicy._id === ruleId) {
        setActivePolicy(null);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete rule', variant: 'destructive' });
    }
  }

  function handleEditRule(rule: any) {
    setActivePolicy(rule);
    reset({
      name: rule.name || 'Default Overtime Policy',
      multiplier: rule.multiplier || 1.5,
      approvalRequired: !!rule.requiresApproval,
      maxDailyMinutes: rule.minMinutesForOvertime || 0,
      maxWeeklyMinutes: 0,
      maxMonthlyMinutes: 0,
      weekendRule: rule.description || '',
    });
  }

  const multiplier = watch('multiplier') || 1.5;

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Overtime Policy</h1>
        {loading && <p>Loading...</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded shadow-sm border col-span-2">
            <div className="mb-3">
              <label className="block text-sm font-medium">Policy Name</label>
              <input className="input" {...register('name')} />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Multiplier</label>
              <input type="number" step="0.1" className="input" {...register('multiplier', { valueAsNumber: true })} />
              {errors.multiplier && <p className="text-red-600 text-sm">{errors.multiplier.message}</p>}
            </div>

            <div className="mb-3 flex items-center gap-3">
              <input type="checkbox" {...register('approvalRequired')} id="approvalRequired" />
              <label htmlFor="approvalRequired" className="text-sm">Approval required</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-sm block">Max overtime per day (minutes)</label>
                <input type="number" className="input" {...register('maxDailyMinutes', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm block">Max overtime per week (minutes)</label>
                <input type="number" className="input" {...register('maxWeeklyMinutes', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm block">Max overtime per month (minutes)</label>
                <input type="number" className="input" {...register('maxMonthlyMinutes', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Weekend rule</label>
              <input className="input" {...register('weekendRule')} placeholder="e.g., double pay" />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button className="btn" type="submit" disabled={isSubmitting}>Save Policy</button>
            </div>
          </form>

          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="text-lg font-medium mb-3">Preview</h3>
            <p className="text-sm">Example: 2 hours overtime × multiplier {multiplier} = <strong>{(2 * multiplier).toFixed(2)} hours-equivalent</strong></p>

            <div className="mt-4">
              <h4 className="font-medium mb-2">All Overtime Rules</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {overtimeRules.length > 0 ? (
                  overtimeRules.map((rule) => (
                    <div key={rule._id} className="flex items-center justify-between p-2 border rounded">
                      <div className="text-sm">
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-gray-600">Multiplier: {rule.multiplier}x</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule._id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">No overtime rules configured</div>
                )}
              </div>
            </div>

            {activePolicy && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium">Currently Editing</h4>
                <div className="text-sm">
                  <div>{activePolicy.name}</div>
                  <div>Multiplier: {activePolicy.multiplier}</div>
                  <div>Requires approval: {activePolicy.requiresApproval ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}


