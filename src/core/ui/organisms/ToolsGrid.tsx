import { ToolTile } from '../molecules/ToolTile';

export interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface ToolsGridProps {
  tools: ToolItem[];
}

export function ToolsGrid({ tools }: ToolsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {tools.map((tool) => (
        <ToolTile key={tool.id} icon={tool.icon} label={tool.label} onClick={tool.onClick} />
      ))}
    </div>
  );
}
