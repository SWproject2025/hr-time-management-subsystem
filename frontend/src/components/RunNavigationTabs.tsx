"use client"
import { useRouter, usePathname } from 'next/navigation';
import { FileText, CheckSquare, Send, Settings } from 'lucide-react';

interface RunNavigationTabsProps {
  runId: string;
  currentStatus?: string;
}

const RunNavigationTabs = ({ runId, currentStatus }: RunNavigationTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: 'pre-runs',
      label: 'Pre-Run Approvals',
      icon: CheckSquare,
      path: `/runs/${runId}/pre-runs`,
      enabled: true
    },
    {
      id: 'draft',
      label: 'Draft Review',
      icon: FileText,
      path: `/runs/${runId}/draft`,
      enabled: true
    },
    {
      id: 'approvals',
      label: 'Approvals & Execution',
      icon: Send,
      path: `/runs/${runId}/approvals`,
      enabled: currentStatus !== 'DRAFT'
    }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => tab.enabled && router.push(tab.path)}
                disabled={!tab.enabled}
                className={`
                  flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition
                  ${active 
                    ? 'border-blue-500 text-blue-600' 
                    : tab.enabled
                      ? 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      : 'border-transparent text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RunNavigationTabs;