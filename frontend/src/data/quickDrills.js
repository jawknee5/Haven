// Curated daily drills. Rotated deterministically by day-of-year so every
// resident gets the same drill on the same day (great for sharing/discussion).
export const QUICK_DRILLS = [
  { id: "bowline", title: "Tie a bowline in 60 seconds", ask: "Give me step-by-step instructions to tie a bowline knot, with the memory trick." },
  { id: "water-3ways", title: "3 ways to purify water without a filter", ask: "What are 3 ways to purify water in the wild without a commercial filter? Give exact times and ratios." },
  { id: "shadow-stick", title: "Find true north with a stick and the sun", ask: "How do I use the shadow-stick method to find true north? Give numbered steps." },
  { id: "lean-to", title: "Build a lean-to shelter in under an hour", ask: "Walk me through building a wilderness lean-to shelter in under an hour. List materials and steps." },
  { id: "bleeding", title: "Stop severe bleeding (first aid)", ask: "What are the exact steps to stop severe bleeding from a wound? Include when to use a tourniquet." },
  { id: "fire-bow", title: "Bow-drill fire from scratch", ask: "How do I make a fire with a bow drill from natural materials? Give numbered steps and common mistakes." },
  { id: "hypothermia", title: "Recognize and treat hypothermia", ask: "How do I recognize hypothermia and what's the step-by-step rewarming procedure?" },
  { id: "clove-hitch", title: "Tie a clove hitch (securing rope to a post)", ask: "Step-by-step: tie a clove hitch to secure a rope to a post or tree." },
  { id: "tinder", title: "Find dry tinder when everything is wet", ask: "How do I find or make dry tinder for a fire when everything outside is wet?" },
  { id: "snake-bite", title: "What to do if bitten by a snake", ask: "Step-by-step first aid if someone is bitten by a snake — what to do and what NOT to do." },
];

export function getTodaysDrill() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  return QUICK_DRILLS[day % QUICK_DRILLS.length];
}
