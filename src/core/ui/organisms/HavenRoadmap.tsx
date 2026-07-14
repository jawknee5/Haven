import { NodeData, NodeCard } from '../molecules/NodeCard';

interface HAVENRoadmapProps {
  nodes: NodeData[];
  onStepToggle: (nodeId: string, stepId: string, completed: boolean) => void;
  onAction: (nodeId: string, action: string) => void;
}

export function HAVENRoadmap({ nodes, onStepToggle, onAction }: HAVENRoadmapProps) {
  return (
    <div className="relative px-4 py-6">
      {/* Vertical connector line */}
      <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-haven-teal via-haven-softTeal to-haven-slate/30" />

      <div className="space-y-6 relative">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="flex items-start gap-4 animate-card-enter"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {/* Node dot */}
            <div className="relative z-10 shrink-0 mt-1">
              <div
                className={
                  node.status === 'completed'
                    ? 'w-5 h-5 rounded-full bg-haven-success flex items-center justify-center'
                    : node.status === 'active'
                    ? 'w-5 h-5 rounded-full bg-haven-teal ring-4 ring-haven-teal/20'
                    : 'w-5 h-5 rounded-full bg-haven-slate border-2 border-haven-slate'
                }
              >
                {node.status === 'completed' && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <NodeCard node={node} onStepToggle={onStepToggle} onAction={onAction} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
