import { NodeData, NodeCard } from '../molecules/NodeCard';

interface PathwayRoadmapProps {
  nodes: NodeData[];
  onStepToggle: (nodeId: string, stepId: string, completed: boolean) => void;
  onAction: (nodeId: string, action: string) => void;
}

export function PathwayRoadmap({ nodes, onStepToggle, onAction }: PathwayRoadmapProps) {
  return (
    <div className="relative px-4 py-6">
      {/* Vertical connector line */}
      <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-pathway-teal via-pathway-softTeal to-pathway-slate/30" />

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
                    ? 'w-5 h-5 rounded-full bg-pathway-success flex items-center justify-center'
                    : node.status === 'active'
                    ? 'w-5 h-5 rounded-full bg-pathway-teal ring-4 ring-pathway-teal/20'
                    : 'w-5 h-5 rounded-full bg-pathway-slate border-2 border-pathway-slate'
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
