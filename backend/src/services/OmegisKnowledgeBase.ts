// Omegis Protocol - Survival Knowledge Base
export class OmegisKnowledgeBase {
  private static knowledgeBase = [
    { category: 'hunting', topic: 'Basic Snare Construction', content: 'Spring snares use tension from bent branches. Find a sapling, bend it to create tension, attach cordage to trigger.', tags: ['snare', 'small-game'] },
    { category: 'hunting', topic: 'Fish Trap Construction', content: 'Weir traps (funnel-style): Build with rocks in shallow water. Fish enter through narrow opening but cannot escape.', tags: ['fish', 'water', 'trap'] },
    { category: 'hunting', topic: 'Deadfall Trap', content: 'Heavy flat object held by trigger mechanism. Figure-4 trigger: vertical stick with horizontal piece forming "4" shape.', tags: ['trap', 'deadfall'] },
    { category: 'tools', topic: 'Flint Knapping', content: 'Flake stone tools by striking flint with hammer stone at 30-45 degree angle. Creates sharp cutting tools.', tags: ['stone-tools', 'flint'] },
    { category: 'tools', topic: 'Spear Making', content: 'Shaft: straight sapling 6-8 feet. Hardpoint: fire-harden wooden tip or lash flint/bone point. Lashing: wrap cordage tightly.', tags: ['spear', 'weapon'] },
    { category: 'medicine', topic: 'Wound Care', content: 'Clean with boiled water. Remove debris gently. Apply pressure to stop bleeding. Wrap with clean cloth. Change dressing daily.', tags: ['wound', 'first-aid'] },
    { category: 'medicine', topic: 'Fever Management', content: 'Cool compress on forehead. Hydration is key. Rest to conserve energy. Willow bark tea contains salicin (like aspirin).', tags: ['fever', 'medicine'] },
    { category: 'knots', topic: 'Bowline', content: 'Creates fixed loop that wont slip. Form small loop, thread end through, around standing line, back through loop.', tags: ['knot', 'loop'] },
    { category: 'survival', topic: 'Water Purification', content: 'Boiling: 1 minute at rolling boil kills most pathogens. Filtering: sand, charcoal, cloth removes sediment.', tags: ['water', 'purification'] },
    { category: 'survival', topic: 'Shelter Building', content: 'Assess weather and location. Insulation: layer branches, leaves, moss. Roof: angled to shed water. Stay dry and warm.', tags: ['shelter', 'building'] }
  ];

  static getByCategory(category) { return this.knowledgeBase.filter(k => k.category === category); }
  static getByTopic(topic) { return this.knowledgeBase.find(k => k.topic === topic); }
  static search(keyword) { const lower = keyword.toLowerCase(); return this.knowledgeBase.filter(k => k.topic.toLowerCase().includes(lower) || k.content.toLowerCase().includes(lower)); }
  static getCategories() { return [...new Set(this.knowledgeBase.map(k => k.category))]; }
  static getAll() { return this.knowledgeBase; }
  static getStats() { return { totalTopics: this.knowledgeBase.length, categories: this.getCategories(), byCategory: this.getCategories().reduce((acc, cat) => { acc[cat] = this.getByCategory(cat).length; return acc; }, {}) }; }
}
export default OmegisKnowledgeBase;
