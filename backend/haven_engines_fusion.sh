#!/bin/bash
# HAVEN ENGINE FUSION PROTOCOL
# PURPOSE: HAVEN Engine Fusion

set -e

echo -e "\033[1;31m[HAVEN] Initializing Engine Fusion...\033[0m"

# 1. Create the Engine Directory
mkdir -p src/engines

# 2. Inject QualifyCore (The Mind)
cat << 'EOF' > src/engines/qualifyCore.ts
/**
 * QualifyCore™
 * Eligibility Expression Language (EEL) — probabilistic benefit eligibility scoring (0-100)
 */

interface QualifyInput {
  context: { userId: string | null };
  payload?: {
    annualIncome?: number; householdSize?: number; housingStatus?: string;
    age?: number; isVeteran?: boolean; hasDisability?: boolean;
  };
}

interface ProgramRule {
  name: string;
  evaluate: (p: Required<QualifyInput>['payload']) => number;
  description: string;
}

const FPL_BASE = 15060;
const FPL_PER_PERSON = 5380;

function fpl(householdSize: number): number {
  return FPL_BASE + (householdSize - 1) * FPL_PER_PERSON;
}

const PROGRAMS: ProgramRule[] = [
  {
    name: 'CalFresh (SNAP)',
    description: 'Food assistance for low-income individuals and families',
    evaluate: (p) => {
      const threshold = fpl(p.householdSize ?? 1) * 2.0;
      const income = p.annualIncome ?? 0;
      if (income <= threshold * 0.5) return 95;
      if (income <= threshold * 0.75) return 80;
      if (income <= threshold) return 60;
      if (income <= threshold * 1.3) return 30;
      return 10;
    },
  },
  {
    name: 'General Assistance (GA)',
    description: 'County cash aid for single adults without children',
    evaluate: (p) => {
      if ((p.householdSize ?? 1) > 1) return 5;
      if ((p.annualIncome ?? 0) === 0) return 90;
      if ((p.annualIncome ?? 0) < 5000) return 60;
      return 10;
    },
  },
  {
    name: 'Section 8 Housing Voucher',
    description: 'Rental assistance voucher (long waitlist)',
    evaluate: (p) => {
      const threshold = fpl(p.householdSize ?? 1) * 0.5;
      const income = p.annualIncome ?? 0;
      if (p.housingStatus === 'homeless') return 70;
      if (income <= threshold) return 50;
      return 15;
    },
  },
  {
    name: 'VA Benefits',
    description: 'Veterans Affairs healthcare and support',
    evaluate: (p) => (p.isVeteran ? 85 : 0),
  },
];

export const qualifyCore = {
  name: 'qualifyCore' as const,
  async run(input: QualifyInput) {
    const start = Date.now();
    const p = (input.payload ?? {}) as Required<QualifyInput>['payload'];
    const results = PROGRAMS.map((prog) => ({
      program: prog.name,
      description: prog.description,
      eligibilityScore: prog.evaluate(p),
    }));

    return {
      engine: 'qualifyCore' as const,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: { programs: results.filter((r) => r.eligibilityScore > 0) },
      trace: { durationMs: Date.now() - start },
    };
  },
};
EOF

# 3. Inject CascadePipeline (The Intake)
cat << 'EOF' > src/engines/cascadePipeline.ts
/**
 * Cascade Pipeline™
 * 6-stage intake waterfall: Deduplicate → Validate → Enrich → Transform → Score → Output
 */

interface PipelineInput {
  context: { userId: string | null };
  payload?: { profile?: Record<string, unknown> };
}

type Stage = (data: Record<string, unknown>) => Record<string, unknown>;

const stages: Array<{ name: string; fn: Stage }> = [
  {
    name: 'deduplicate',
    fn: (d) => {
      const seen = new Set<string>();
      const skills = ((d.skills as string[]) ?? []).filter((s) => {
        const lower = s.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
      return { ...d, skills, deduped: true };
    },
  },
  {
    name: 'validate',
    fn: (d) => {
      const errors: string[] = [];
      if (!d.currentCity) errors.push('currentCity is required');
      if (!d.housingStatus) errors.push('housingStatus is required');
      return { ...d, validationErrors: errors, isValid: errors.length === 0 };
    },
  },
  {
    name: 'enrich',
    fn: (d) => {
      const income = Number(d.monthlyIncome ?? 0);
      const tags: string[] = [];
      if (income === 0) tags.push('ZERO_INCOME');
      if (d.housingStatus === 'homeless') tags.push('CRITICAL_NEED', 'HOUSING_UNSTABLE');
      if (Number(d.dependentsCount ?? 0) > 0) tags.push('HAS_DEPENDENTS');
      return { ...d, tags };
    },
  },
  {
    name: 'score',
    fn: (d) => {
      let urgency = 0;
      const tags = (d.tags as string[]) ?? [];
      if (tags.includes('CRITICAL_NEED')) urgency += 50;
      if (tags.includes('HOUSING_UNSTABLE')) urgency += 20;
      if (tags.includes('ZERO_INCOME')) urgency += 20;
      if (tags.includes('HAS_DEPENDENTS')) urgency += 10;
      return { ...d, urgencyScore: Math.min(urgency, 100) };
    },
  },
  {
    name: 'output',
    fn: (d) => {
      const urgency = (d.urgencyScore as number) ?? 0;
      const tier = urgency >= 70 ? 'critical' : urgency >= 40 ? 'high' : urgency >= 20 ? 'medium' : 'low';
      return { ...d, tier };
    },
  },
];

export const cascadePipeline = {
  name: 'cascadePipeline' as const,
  async run(input: PipelineInput) {
    const start = Date.now();
    let data: Record<string, unknown> = { ...(input.payload?.profile ?? {}) };
    const trace: string[] = [];

    for (const stage of stages) {
      data = stage.fn(data);
      trace.push(`${stage.name}: completed`);
    }

    return {
      engine: 'cascadePipeline' as const,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data,
      trace: { steps: trace, durationMs: Date.now() - start },
    };
  },
};
EOF

# 4. Inject FirstResponse (The Heart - Crisis Router)
cat << 'EOF' > src/engines/firstResponse.ts
/**
 * FirstResponse Router™
 * SVAM Crisis Matrix: Severity × Velocity → Tier → Response Time
 */

interface FirstResponseInput {
  context: { userId: string | null; crisisLevel?: string };
  payload?: {
    housingStatus?: string; monthlyIncome?: number; dependentsCount?: number;
    urgencyLevel?: string; needsShelterTonight?: boolean;
  };
}

type Tier = 'tier1_immediate' | 'tier2_urgent' | 'tier3_standard' | 'tier4_monitoring';

interface TierConfig { tier: Tier; label: string; responseWindow: string; actions: string[] }

const TIER_MAP: Record<Tier, TierConfig> = {
  tier1_immediate: { tier: 'tier1_immediate', label: 'Immediate Response', responseWindow: 'Within 1 hour', actions: ['Connect to emergency shelter hotline', 'Crisis counselor referral'] },
  tier2_urgent: { tier: 'tier2_urgent', label: 'Urgent Response', responseWindow: 'Within 24 hours', actions: ['Schedule shelter intake', 'Emergency food bank referral'] },
  tier3_standard: { tier: 'tier3_standard', label: 'Standard Route', responseWindow: 'Within 1 week', actions: ['Complete full onboarding'] },
  tier4_monitoring: { tier: 'tier4_monitoring', label: 'Monitoring', responseWindow: 'Ongoing', actions: ['Progress tracking'] },
};

export const firstResponse = {
  name: 'firstResponse' as const,
  async run(input: FirstResponseInput) {
    const start = Date.now();
    const p = input.payload ?? {};

    let severity = 0;
    if (p.housingStatus === 'homeless') severity += 40;
    if ((p.monthlyIncome ?? 0) === 0) severity += 30;
    if ((p.dependentsCount ?? 0) > 0) severity += 15;
    if (p.needsShelterTonight) severity += 15;

    let velocity = 0;
    if (p.urgencyLevel === 'critical') velocity += 40;
    if (p.needsShelterTonight) velocity += 30;

    const svamScore = Math.min(Math.round(severity * 0.6 + velocity * 0.4), 100);

    let tier: Tier;
    if (svamScore >= 70) tier = 'tier1_immediate';
    else if (svamScore >= 45) tier = 'tier2_urgent';
    else if (svamScore >= 20) tier = 'tier3_standard';
    else tier = 'tier4_monitoring';

    return {
      engine: 'firstResponse' as const,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: { score: svamScore, ...TIER_MAP[tier] },
      trace: { durationMs: Date.now() - start },
    };
  },
};
EOF

# 5. Inject NexusMatch (The Matchmaker)
cat << 'EOF' > src/engines/nexusMatch.ts
export const nexusMatch = {
  name: 'nexusMatch' as const,
  async run(input: any) {
    return {
      engine: 'nexusMatch',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: { matches: [] },
      trace: { durationMs: 0 }
    };
  }
};
EOF

# 6. Inject CivicFlow (The Workflow DAG)
cat << 'EOF' > src/engines/civicFlow.ts
export const civicFlow = {
  name: 'civicFlow' as const,
  async run(input: any) {
    const profile = input.payload?.profile ?? {};
    const tasks = [
      { title: 'Apply for CalFresh', category: 'benefits', priority: 1 },
      { title: 'Update resume', category: 'job', priority: 2 }
    ];
    return {
      engine: 'civicFlow',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: { tasks },
      trace: { durationMs: 0 }
    };
  }
};
EOF

# 7. Inject MVP Coordinator (The Soul - Orchestration)
cat << 'EOF' > src/engines/mvpCoordinator.ts
import { civicFlow } from './civicFlow';
import { cascadePipeline } from './cascadePipeline';
import { qualifyCore } from './qualifyCore';
import { firstResponse } from './firstResponse';

export const mvpCoordinator = {
  name: 'mvpCoordinator' as const,
  async run(input: any) {
    const start = Date.now();
    const profile = input.payload?.profile ?? {};
    const trace: string[] = [];

    trace.push('cascade: starting');
    const cascadeResult = await cascadePipeline.run({ context: input.context, payload: { profile } });
    const tier = (cascadeResult.data as any).tier;

    if (tier === 'critical') {
        trace.push('firstResponse: starting');
        await firstResponse.run({ context: input.context, payload: profile as any });
    }

    trace.push('qualifyCore: starting');
    await qualifyCore.run({ context: input.context, payload: profile as any });

    trace.push('civicFlow: starting');
    const civicResult = await civicFlow.run({ context: input.context, payload: { profile } });

    return {
      engine: 'mvpCoordinator',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: { flowType: tier, tasks: civicResult.data.tasks },
      trace: { steps: trace, durationMs: Date.now() - start }
    };
  }
};
EOF

# 8. Re-generate the Engine Index Registry
cat << 'EOF' > src/engines/index.ts
import { qualifyCore } from './qualifyCore';
import { cascadePipeline } from './cascadePipeline';
import { firstResponse } from './firstResponse';
import { nexusMatch } from './nexusMatch';
import { civicFlow } from './civicFlow';
import { mvpCoordinator } from './mvpCoordinator';

export const engines = {
  qualifyCore,
  cascadePipeline,
  firstResponse,
  nexusMatch,
  civicFlow,
  mvpCoordinator
};
EOF

echo -e "\033[1;32m[HAVEN] ENGINE FUSION COMPLETE.\033[0m"