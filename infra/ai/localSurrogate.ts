export function runLocalSurrogate(description: string) {
  console.log("[PGE-SURROGATE] Initiating Deterministic Triage...");
  const keywords: Record<string, string[]> = {
    'HOUSING': ['eviction', 'shelter', 'homeless', 'rent', 'house'],
    'FOOD': ['hungry', 'starving', 'meals', 'groceries', 'bank'],
    'MEDICAL': ['sick', 'pain', 'doctor', 'hospital', 'emergency'],
  };

  let category = 'GENERAL';
  let score = 50;

  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(w => description.toLowerCase().includes(w))) {
      category = cat;
      score = 85; // High urgency for keyword matches
      break;
    }
  }

  return { categoryTag: category, urgencyScore: score, method: 'LOCAL_SURROGATE' };
}