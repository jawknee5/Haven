import clsx from 'clsx';
import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export interface ArticleData {
  id: string;
  title: string;
  category: string;
  summary: string;
  contentHtml: string;
  steps?: { id: string; label: string }[];
  offlineAvailable: boolean;
  readTime?: number;
}

interface ArticleReaderProps {
  article: ArticleData;
  onBack: () => void;
}

export function ArticleReader({ article, onBack }: ArticleReaderProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(stepId) ? next.delete(stepId) : next.add(stepId);
      return next;
    });
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-haven-canvas/95 backdrop-blur border-b border-white/[0.06] px-4 py-3">
        <Button size="sm" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </div>

      <article className="px-4 py-6">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[11px] text-haven-teal font-semibold uppercase tracking-wider">{article.category}</span>
          {article.offlineAvailable && <Badge variant="default">Offline</Badge>}
          {article.readTime && <span className="text-[11px] text-haven-textMuted">{article.readTime} min read</span>}
        </div>

        <h1 className="text-2xl font-bold text-haven-textPrimary mb-3">{article.title}</h1>
        <p className="text-sm text-haven-textSecondary mb-6 leading-relaxed">{article.summary}</p>

        {/* Steps */}
        {article.steps && article.steps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-haven-textPrimary mb-3">Steps</h2>
            <ol className="space-y-2">
              {article.steps.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                return (
                  <li
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={clsx(
                      'flex items-start gap-3 p-3 rounded-lg cursor-pointer touch-active transition-all',
                      isCompleted ? 'bg-haven-success/10' : 'bg-haven-navy/40'
                    )}
                  >
                    <span
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                        isCompleted ? 'bg-haven-success text-white' : 'bg-haven-slate text-haven-textMuted'
                      )}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <span className={clsx('text-sm', isCompleted && 'text-haven-success line-through')}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-sm max-w-none prose-p:text-haven-textSecondary prose-headings:text-haven-textPrimary"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </article>
    </div>
  );
}
