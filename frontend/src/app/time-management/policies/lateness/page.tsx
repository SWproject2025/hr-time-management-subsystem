'use client';
import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const LatenessSchema = z.object({
  name: z.string().min(1),
  gracePeriodMinutes: z.number().min(0),
  thresholdMinutes: z.number().min(0),
  deductionForEachMinute: z.number().min(0),
  escalationRule: z.string().optional(),
});

type LatenessForm = z.infer<typeof LatenessSchema>;

export default function LatenessPage() {
  const [loading, setLoading] = useState(true);
  const [latenessRules, setLatenessRules] = useState<any[]>([]);
  const [activePolicy, setActivePolicy] = useState<any | null>(null);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LatenessForm>({
    resolver: zodResolver(LatenessSchema),
    defaultValues: {
      name: 'Default Lateness Policy',
      gracePeriodMinutes: 5,
      thresholdMinutes: 15,
      deductionForEachMinute: 0,
      escalationRule: '',
    }
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const rules = await timeManagementService.getAllLatenessRules();
        if (!mounted) return;
        setLatenessRules(rules || []);
        const policy = rules && rules.length ? rules[0] : null;
        setActivePolicy(policy);
        if (policy) {
          reset({
            name: policy.name || 'Default Lateness Policy',
            gracePeriodMinutes: policy.gracePeriodMinutes || 0,
            thresholdMinutes: policy.thresholdMinutes || 0,
            deductionForEachMinute: policy.deductionForEachMinute || 0,
            escalationRule: policy.description || '',
          });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to load lateness policy', variant: 'destructive' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [reset, toast]);

  async function onSubmit(values: LatenessForm) {
    const ok = window.confirm('Save lateness policy changes?');
    if (!ok) return;
    try {
      if (activePolicy && activePolicy._id) {
        await timeManagementService.updateLatenessRule(activePolicy._id, {
          name: values.name,
          gracePeriodMinutes: values.gracePeriodMinutes,
          thresholdMinutes: values.thresholdMinutes,
          deductionForEachMinute: values.deductionForEachMinute,
          description: values.escalationRule,
        });
        toast({ title: 'Saved', description: 'Lateness policy updated' });
      } else {
        await timeManagementService.createLatenessRule({
          name: values.name,
          gracePeriodMinutes: values.gracePeriodMinutes,
          thresholdMinutes: values.thresholdMinutes,
          deductionForEachMinute: values.deductionForEachMinute,
          description: values.escalationRule,
        });
        toast({ title: 'Saved', description: 'Lateness policy created' });
      }
      // Reload rules after save
      const rules = await timeManagementService.getAllLatenessRules();
      setLatenessRules(rules || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to save', variant: 'destructive' });
    }
  }

  async function handleDeleteRule(ruleId: string) {
    const ok = window.confirm('Are you sure you want to delete this lateness rule?');
    if (!ok) return;
    try {
      await timeManagementService.deleteLatenessRule(ruleId);
      toast({ title: 'Deleted', description: 'Lateness rule deleted successfully' });
      // Reload rules after delete
      const rules = await timeManagementService.getAllLatenessRules();
      setLatenessRules(rules || []);
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
      name: rule.name || 'Default Lateness Policy',
      gracePeriodMinutes: rule.gracePeriodMinutes || 0,
      thresholdMinutes: rule.thresholdMinutes || 0,
      deductionForEachMinute: rule.deductionForEachMinute || 0,
      escalationRule: rule.description || '',
    });
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Lateness Policy</h1>
        {loading && <p>Loading...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded shadow-sm border">
            <div className="mb-3">
              <label className="block text-sm font-medium">Policy Name</label>
              <input className="input" {...register('name')} />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-sm block">Lateness threshold (minutes)</label>
                <input type="number" className="input" {...register('thresholdMinutes', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm block">Grace period (minutes)</label>
                <input type="number" className="input" {...register('gracePeriodMinutes', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm block">Penalty per minute</label>
                <input type="number" className="input" {...register('deductionForEachMinute', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Escalation Rule</label>
              <input className="input" {...register('escalationRule')} placeholder="e.g., after 3 times escalate to manager" />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button className="btn" type="submit" disabled={isSubmitting}>Save Policy</button>
            </div>
          </form>

          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="text-lg font-medium mb-3">All Lateness Rules</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {latenessRules.length > 0 ? (
                latenessRules.map((rule) => (
                  <div key={rule._id} className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-gray-600">
                        Grace: {rule.gracePeriodMinutes}min | Threshold: {rule.thresholdMinutes}min
                      </div>
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
                <div className="text-sm text-gray-600">No lateness rules configured</div>
              )}
            </div>

            {activePolicy && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium">Currently Editing</h4>
                <div className="text-sm">
                  <div>{activePolicy.name}</div>
                  <div>Grace: {activePolicy.gracePeriodMinutes} min</div>
                  <div>Threshold: {activePolicy.thresholdMinutes} min</div>
                  <div>Penalty/min: {activePolicy.deductionForEachMinute}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}


