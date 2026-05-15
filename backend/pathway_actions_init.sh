#!/bin/bash
# ZERG ACTION API INITIALIZATION PROTOCOL
# PURPOSE: Materializing the BB Actions Framework and Contributor Spec

set -e

echo -e "\033[1;31m[ZERG] Initializing BB Actions Framework...\033[0m"

# 1. Create the Directory Matrix
mkdir -p src/actions/__tests__ src/bb

# 2. Forge the Base Action Types
cat << 'EOF' > src/actions/types.ts
export interface ActionInput {
  caseId: string;
  payload?: any;
}

export interface ActionOutput {
  success: boolean;
  data?: any;
  error?: string;
}

export type ActionFunction = (input: ActionInput) => Promise<ActionOutput>;
EOF

# 3. Implement the Deterministic Runner (Handled by runner.ts)
cat << 'EOF' > src/actions/runner.ts
import { Actions } from './index';
import { Validators } from './validators';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runAction(actionName: keyof typeof Actions, input: any) {
  const startTime = Date.now();
  console.log(`[ZERG] Invoking Action: ${actionName}`);

  try {
    // 1. Validation Logic
    if (Validators[actionName]) {
      Validators[actionName](input);
    }

    // 2. Execution logic
    const actionFn = Actions[actionName];
    const result = await actionFn(input);

    // 3. Automated Audit Logging
    await prisma.auditEntry.create({
      data: {
        actorType: 'CaseworkerBB',
        actorId: 'system-agent-01',
        operation: String(actionName),
        target: input.caseId || 'system',
        details: {
          input,
          output: result,
          duration: `${Date.now() - startTime}ms`
        }
      }
    });

    return result;
  } catch (error: any) {
    console.error(`[ZERG] ACTION FAILURE: ${actionName}`, error);
    return { success: false, error: error.message };
  }
}
EOF

# 4. Forge the Validators
cat << 'EOF' > src/actions/validators.ts
export const Validators: Record<string, (input: any) => void> = {
  GetCase: (input) => {
    if (!input.caseId) throw new Error("ActionDenied: Missing caseId");
  },
  SendMessageToUser: (input) => {
    if (!input.caseId) throw new Error("ActionDenied: Missing caseId");
    if (!input.payload?.templateId) throw new Error("ActionDenied: Missing templateId");
  }
};
EOF

# 5. Implement a Sample Action (Case Management)
cat << 'EOF' > src/actions/GetCase.ts
import { ActionInput, ActionOutput } from './types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function execute(input: ActionInput): Promise<ActionOutput> {
  // Mocking the complex metadata return for now
  return { 
    success: true, 
    data: { 
      id: input.caseId, 
      status: 'OPEN', 
      vaultMemory: 'User prefers weekend contact.' 
    } 
  };
}
EOF

# 6. Forge the Action Registry
cat << 'EOF' > src/actions/index.ts
import { execute as GetCase } from './GetCase';

export const Actions = {
  GetCase,
  // Future actions like StartWorkflow and FlagRisk will be registered here
};
EOF

# 7. Expose to BB (Agent Awareness)
cat << 'EOF' > src/bb/actionRegistry.ts
import { Actions } from '../actions';

export const BBAllowedActions: (keyof typeof Actions)[] = [
  "GetCase"
];
EOF

echo -e "\033[1;32m[ZERG] Action API Scaffolding Complete. BB is now functionally capable.\033[0m"