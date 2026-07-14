import { useState } from 'react';
import clsx from 'clsx';
import { StatusPill } from '../atoms/StatusPill';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

export interface NodeStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface NodeData {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'locked';
  steps: NodeStep[];
  actions?: {
    upload?: boolean;
    call?: boolean;
    map?: boolean;
    resource?: boolean;
  };
}

interface NodeCardProps {
  node: NodeData;
  onStepToggle?: (nodeId: string, stepId: string, completed: boolean) => void;
  onAction?: (nodeId: string, action: string) => void;
}

export function NodeCard({ node, onStepToggle, onAction }: NodeCardProps) {
  const [expanded, setExpanded] = useState(node.status === 'active');
  const isLocked = node.status === 'locked';

  return (
    <div
      className={clsx(
        'glass-card p-4 transition-all duration-200',
        node.status === 'active' && 'border-haven-teal/40 ring-1 ring-haven-teal/20',
        isLocked && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={clsx('font-semibold text-haven-textPrimary', isLocked && 'text-haven-textMuted')}>
              {node.title}
            </h3>
            {isLocked && <Icon name="lock" size={14} className="text-haven-textMuted shrink-0" />}
          </div>
          <p className="text-xs text-haven-textMuted">{node.description}</p>
        </div>
        <StatusPill
          status={node.status === 'active' ? 'in_progress' : node.status === 'completed' ? 'completed' : 'pending'}
        />
      </div>

      {expanded && !isLocked && node.steps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <ul className="space-y-2">
            {node.steps.map((step) => (
              <li key={step.id} className="flex items-start gap-3">
                <button
                  onClick={() => onStepToggle?.(node.id, step.id, !step.completed)}
                  className={clsx(
                    'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    step.completed ? 'bg-haven-success border-haven-success' : 'border-haven-textMuted hover:border-haven-teal'
                  )}
                >
                  {step.completed && <Icon name="check" size={12} className="text-white" />}
                </button>
                <span
                  className={clsx(
                    'text-sm',
                    step.completed ? 'text-haven-success line-through' : 'text-haven-textSecondary'
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ul>

          {node.actions && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {node.actions.upload && (
                <Button size="sm" variant="ghost" onClick={() => onAction?.(node.id, 'upload')}>
                  <Icon name="upload" size={14} />
                </Button>
              )}
              {node.actions.call && (
                <Button size="sm" variant="ghost" onClick={() => onAction?.(node.id, 'call')}>
                  <Icon name="phone" size={14} />
                </Button>
              )}
              {node.actions.map && (
                <Button size="sm" variant="ghost" onClick={() => onAction?.(node.id, 'map')}>
                  <Icon name="mapPin" size={14} />
                </Button>
              )}
              {node.actions.resource && (
                <Button size="sm" variant="ghost" onClick={() => onAction?.(node.id, 'resource')}>
                  <Icon name="book" size={14} />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {node.steps.length > 0 && !isLocked && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-haven-teal hover:text-haven-softTeal transition-colors"
        >
          {expanded ? 'Show less' : `Show ${node.steps.length} steps`}
        </button>
      )}
    </div>
  );
}
