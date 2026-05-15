export const ENHANCED_SURVIVAL_GUIDE = {
  sections: [
    {
      id: 'wilderness-knots',
      title: '🪢 15 Essential Wilderness Knots',
      icon: '🪢',
      content: `MASTER 15 CRITICAL WILDERNESS KNOTS

These 15 knots are essential for survival, rescue, and wilderness navigation. Each knot has specific uses and can save your life.`,
      knots: [
        {
          id: 1,
          name: 'Bowline (King of Knots)',
          icon: '⛓️',
          uses: 'Creates fixed loop that won\'t slip. Used for rescue, securing loads, attaching ropes to objects.',
          difficulty: 'Intermediate',
          steps: [
            'Form a small loop (rabbit hole) in the standing line',
            'Pass working end up through the loop',
            'Wrap working end around the standing line (rabbit goes around the tree)',
            'Pass working end back down through the loop',
            'Tighten by pulling standing line'
          ],
          memory: 'Rabbit comes out of hole, around tree, back down the hole',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bowline.jpg',
          strength: 'Very strong - rated 1600+ lbs when tied correctly',
          warnings: 'Must have 6+ inches of working end for safety. Practice until automatic.'
        },
        {
          id: 2,
          name: 'Square Knot (Reef Knot)',
          icon: '⬜',
          uses: 'Joins two ropes of equal diameter. Medical/first aid bandaging, bundling items.',
          difficulty: 'Beginner',
          steps: [
            'Cross left rope over right rope',
            'Pull tight',
            'Cross right rope (now on left) over left rope (now on right)',
            'Pull tight',
            'Left over right, then right over left = Square Knot'
          ],
          memory: 'Right over left, left over right. Or: "Reef" on your home',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Square-knot.svg',
          strength: 'Moderate - rated 600-800 lbs',
          warnings: 'NOT for critical loads. Can slip under tension. Always use for practice.'
        },
        {
          id: 3,
          name: 'Clove Hitch',
          icon: '🔗',
          uses: 'Secures rope to post/tree/pole. Campsite rigging, securing boat lines.',
          difficulty: 'Beginner',
          steps: [
            'Pass rope around post from front',
            'Cross working end over standing line',
            'Pass working end around post again (behind it)',
            'Cross working end under itself as it comes around',
            'Pull tight'
          ],
          memory: 'Two wraps around post with crossing pattern',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Clove_hitch.svg',
          strength: 'Moderate - good for temporary holds',
          warnings: 'Not suitable for critical loads when used alone. Add half-hitches for security.'
        },
        {
          id: 4,
          name: 'Taut-Line Hitch (Adjustable Loop)',
          icon: '📍',
          uses: 'Creates adjustable loop that holds under load. Tent guy lines, rescue work.',
          difficulty: 'Intermediate',
          steps: [
            'Create first turn of working end around standing line',
            'Make second turn beside the first',
            'Complete third turn outside both',
            'Pull tight on standing line to lock',
            'Loop can slide when loose, locks when pulled'
          ],
          memory: 'Three turns, two tight, one loose, creates adjustable point',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Taut-line-hitch.svg',
          strength: 'Strong enough for tent guy lines and emergency rescue',
          warnings: 'Practice on different rope diameters - works best on similar-sized rope.'
        },
        {
          id: 5,
          name: 'Figure-Eight Knot (Stopper Knot)',
          icon: '8️⃣',
          uses: 'Prevents rope end from slipping through fittings. Safety backup knot.',
          difficulty: 'Beginner',
          steps: [
            'Make loop with working end',
            'Pass working end around standing line',
            'Thread working end back through loop',
            'Pull tight to form figure-8 shape'
          ],
          memory: 'Loop, around, back through, tighten = Figure-8',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Figure-eight-knot.svg',
          strength: 'Very strong and reliable stopper',
          warnings: 'Essential backup for all rope systems. Always use on dynamic ropes.'
        },
        {
          id: 6,
          name: 'Double Figure-Eight (Joining Knot)',
          icon: '88️⃣',
          uses: 'Joins two ropes securely. Better than square knot for critical loads.',
          difficulty: 'Intermediate',
          steps: [
            'Tie figure-eight with both ropes together',
            'Thread one rope through, then the other',
            'Pull tight carefully',
            'Creates very strong connection'
          ],
          memory: 'Two ropes, one figure-eight pattern',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Double-figure-eight.svg',
          strength: 'Extremely strong - rated 1400+ lbs',
          warnings: 'Best for emergency rescue. Takes practice to tie efficiently.'
        },
        {
          id: 7,
          name: 'Sheet Bend (Fisherman\'s Knot)',
          icon: '🎣',
          uses: 'Joins ropes of different diameters. Secure and reliable.',
          difficulty: 'Intermediate',
          steps: [
            'Make loop with thicker rope',
            'Pass thinner rope up through loop',
            'Wrap thinner rope around both parts of thick rope',
            'Pass thinner rope back under itself',
            'Tighten both ropes'
          ],
          memory: 'Loop, through, around, under itself',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sheet-bend.svg',
          strength: 'Strong for joining different rope sizes',
          warnings: 'Needs stopper knots on both working ends for safety.'
        },
        {
          id: 8,
          name: 'Half Hitch (Security Knot)',
          icon: '🔀',
          uses: 'Adds security to other knots. Backup for critical applications.',
          difficulty: 'Beginner',
          steps: [
            'Pass working end around object',
            'Cross working end over standing line',
            'Thread working end through created loop',
            'Pull tight'
          ],
          memory: 'One loop around, thread through itself',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Half-hitch.svg',
          strength: 'Adds security when doubled',
          warnings: 'Always use two half-hitches (double half-hitch) for critical applications.'
        },
        {
          id: 9,
          name: 'Trucker\'s Hitch (Mechanical Advantage)',
          icon: '🚚',
          uses: 'Creates 3:1 mechanical advantage for tensioning loads. Tightening rope systems.',
          difficulty: 'Advanced',
          steps: [
            'Tie a loop in standing line (use bowline)',
            'Pass working end under the load/anchor point',
            'Pass working end back up and over the loop',
            'Pull down on working end for mechanical advantage',
            'Secure with half-hitches when tight'
          ],
          memory: 'Loop, under anchor, over loop, pull down',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Truckers-hitch.svg',
          strength: 'Multiplies your pulling force by 3x',
          warnings: 'Practice without load first. Can cause serious injury if rope breaks under tension.'
        },
        {
          id: 10,
          name: 'Larks Head Knot (Cow Hitch)',
          icon: '🐄',
          uses: 'Attaches rope to objects or joins ropes. Quick and reliable.',
          difficulty: 'Beginner',
          steps: [
            'Loop rope over attachment point',
            'Cross left side over right side',
            'Pass both ends through the created loop',
            'Tighten both sides equally'
          ],
          memory: 'Loop over, cross, pull through',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Larks-head-knot.svg',
          strength: 'Reliable for most wilderness applications',
          warnings: 'Add half-hitches on ends for added security in critical situations.'
        },
        {
          id: 11,
          name: 'Alpine Butterfly Loop (Bombproof Loop)',
          icon: '🦋',
          uses: 'Creates fixed loop in middle of rope. Rescue, mechanical advantage systems.',
          difficulty: 'Intermediate',
          steps: [
            'Make two loops with working end',
            'Cross loops over standing line',
            'Pass working end over/under in figure-8 pattern',
            'Thread through base of original loop',
            'Tighten carefully'
          ],
          memory: 'Figure-8 with loop in middle',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Butterfly-loop.svg',
          strength: 'Extremely strong - rated 1400+ lbs',
          warnings: 'Called "bombproof" because it won\'t fail even under extreme tension.'
        },
        {
          id: 12,
          name: 'Constrictor Knot (Friction Hitch)',
          icon: '🔪',
          uses: 'Binds objects tightly. Stopping rope slippage, securing bundled items.',
          difficulty: 'Intermediate',
          steps: [
            'Cross working end over standing line',
            'Wrap working end around standing line',
            'Cross working end over itself',
            'Wrap working end back under standing line',
            'Pass working end through center loop',
            'Pull tight to constrict'
          ],
          memory: 'Cross, wrap, cross over, wrap under, thread through',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Constrictor-knot.svg',
          strength: 'Grips with incredible force - hard to untie once tight',
          warnings: 'WARNING: Use only when you need tight constriction. Very difficult to untie.'
        },
        {
          id: 13,
          name: 'Timber Hitch (Dragging Knot)',
          icon: '🪵',
          uses: 'Secures rope to logs or branches for dragging. Holding heavy objects.',
          difficulty: 'Intermediate',
          steps: [
            'Wrap working end around object (log)',
            'Make two full turns around the object',
            'Thread working end under itself to create locking effect',
            'For dragging: add half-hitch higher up on the log',
            'Pull to tighten and test'
          ],
          memory: 'Two wraps, thread under, creates gripping lock',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Timber-hitch.svg',
          strength: 'Excellent grip on round objects',
          warnings: 'Add half-hitch when dragging to prevent log rotation.'
        },
        {
          id: 14,
          name: 'Mooring Hitch (Round Turn with Two Half-Hitches)',
          icon: '⚓',
          uses: 'Secure mooring knot. Boat lines, camping guy lines, emergency anchoring.',
          difficulty: 'Beginner',
          steps: [
            'Make two complete wraps around post (round turn)',
            'Tie first half-hitch',
            'Tie second half-hitch beside the first',
            'Pull tight on both half-hitches'
          ],
          memory: 'Two wraps plus two half-hitches',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mooring-hitch.svg',
          strength: 'Very strong and reliable for holding loads',
          warnings: 'Industry standard for critical applications. Always use both half-hitches.'
        },
        {
          id: 15,
          name: 'Slip Knot (Quick Release)',
          icon: '🎀',
          uses: 'Quick-release knot for emergency situations. Horses, temporary lines, traps.',
          difficulty: 'Beginner',
          steps: [
            'Create loop with working end',
            'Pass loop through attachment point or knot',
            'Keep working end loose enough to pull quickly',
            'PULL WORKING END TO RELEASE IMMEDIATELY',
            'Test before relying on it'
          ],
          memory: 'Loop through, working end loose, pull to release',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Slip-knot.svg',
          strength: 'Moderate - designed for quick release, not holding extreme loads',
          warnings: 'CRITICAL: Test multiple times. Practice emergency release under pressure.'
        }
      ]
    },
    {
      id: 'bow-drill',
      title: '🔥 Bow Drill Fire Crafting',
      icon: '🔥',
      content: `BOW DRILL METHOD - FRICTION FIRE MASTERY

Creating fire using friction is an essential wilderness survival skill. The bow drill method is one of the most reliable primitive fire-starting techniques. With proper materials and technique, you can create an ember in 1-3 minutes.`,
      sections: [
        {
          name: 'Materials Selection',
          content: `WOOD SELECTION IS CRITICAL

Spindle (vertical wood):
- Softwood preferred (cedar, willow, aspen, cottonwood)
- Straight grain, no knots
- Dry but not completely dead
- Diameter: pencil-thin to finger-thin
- Length: 8-12 inches

Fireboard (horizontal wood):
- Same wood species as spindle (this is critical!)
- Flat piece, ½-1 inch thick
- 3-4 inches wide, 12-18 inches long
- Dry wood with good friction properties

Bow:
- Curved branch or stick
- Slightly bowed or can be bent
- 3-4 feet long
- Diameter: thumb-thick

String/Cord:
- Paracord, vine, leather strip, or twisted plant fiber
- Must hold tension
- Should be slightly longer than the bow

Bearing block (hand piece):
- Hard wood (oak, ash preferred)
- Palm-sized
- Has depression to hold spindle top
- Lubricant: animal fat, plant oil, or even saliva helps

Tinder bundle:
- Very dry material (critical!)
- Shredded bark, dry grass, thistle down, cotton fluff
- Palm-sized bundle
- Must catch ember immediately`,
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bow-drill-fire-materials.jpg'
        },
        {
          name: 'Step-by-Step Execution',
          content: `CRITICAL STEPS FOR SUCCESS

STEP 1: CREATE THE NOTCH
- Place fireboard on flat ground
- Make starter hole in spindle 1-2 inches from end
- Create V-notch from hole to edge of fireboard
- Notch should be at 45-degree angle
- Width: about ⅓ the spindle diameter

STEP 2: SET UP THE BOW
- Place string on bow at moderate tension
- String should be tight enough to hold spindle upright
- Not so tight it's hard to push
- Wrap string around spindle once

STEP 3: POSITION YOURSELF
- Sit on one knee, other knee raised
- Fireboard wedged under thigh
- Place bearing block (hand piece) on spindle top
- Use your palm to apply pressure without pinching

STEP 4: BEGIN MOTION
- Start with slow, smooth strokes
- Full-length bow strokes (all the way back and forth)
- Maintain steady pressure on top
- Speed increases gradually
- Listen for change in sound (friction increases)

STEP 5: BUILD FRICTION
- Increase speed gradually over 30-45 seconds
- Increase downward pressure slightly
- Smoke should begin appearing after 10-15 seconds
- Black powder accumulates on fireboard below notch
- Consistency and patience are everything

STEP 6: RECOGNIZE THE EMBER
- Smell changes to burnt wood smell
- Smoke changes color (gets whiter/thicker)
- Feel vibration changes through your whole body
- Spindle becomes harder to push
- Black powder becomes charred and compacted

STEP 7: CREATE THE EMBER
- When smoke is thick and consistent, accelerate speed
- Maintain pressure for 5-10 more seconds
- Ember is ready when:
  - Smoke pours continuously
  - Black powder is fully compressed
  - Slight glow visible in low light

STEP 8: TRANSFER THE EMBER
- Quickly remove spindle
- Lift fireboard carefully
- Tap black powder into tinder bundle
- Ember should be in the powder
- Gently wrap tinder bundle around ember
- Blow gently to ignite`,
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bow-drill-fire-technique.jpg'
        },
        {
          name: 'Troubleshooting',
          content: `COMMON PROBLEMS AND SOLUTIONS

PROBLEM: No smoke after 1 minute
SOLUTION:
- Increase downward pressure significantly
- Increase speed of bow strokes
- Check wood is truly dry
- Ensure spindle and board are same wood species
- Verify notch is correct size

PROBLEM: Smoke but no ember (white powder, not black)
SOLUTION:
- Wood may be too hard or too wet
- Need to increase speed and pressure
- Continue for longer (2-3 minutes may be needed)
- Black powder must be compressed tightly
- Listen for sound changes

PROBLEM: Spindle splits or breaks
SOLUTION:
- Wood was too dry or dead
- Too much pressure applied
- Spindle may be wrong diameter
- Select fresher, more flexible wood

PROBLEM: String keeps slipping
SOLUTION:
- Tighten string tension on bow
- Wrap string around spindle twice instead of once
- Ensure spindle is gripped firmly by bearing block
- Check string isn't frayed

PROBLEM: Ember dies when transferring
SOLUTION:
- Tinder bundle not dry enough
- Too much delay between ember creation and transfer
- Blowing too hard or too soft - gentle steady breaths
- Wrap tinder more completely around ember
- Practice the transfer motion before attempting`,
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bow-drill-troubleshooting.jpg'
        }
      ]
    },
    {
      id: 'shelter-designs',
      title: '🏠 Wilderness Shelter Designs',
      icon: '🏠',
      content: `BUILD 5 CRITICAL WILDERNESS SHELTERS

Each shelter design serves specific environments and situations. Choose based on available materials, weather conditions, and time available.`,
      shelters: [
        {
          name: 'Lean-To (Universal Design)',
          icon: '📐',
          environment: 'Works in any environment. Fastest to build.',
          difficulty: 'Beginner',
          timeToComplete: '20-30 minutes',
          materials: ['One long branch (ridge pole)', 'Multiple branches for frame', 'Leaves/bark for insulation', 'No nails required'],
          steps: [
            'Find or create two support points (trees or forked branches)',
            'Lay ridge pole horizontally between supports at shoulder height',
            'Lean branches at 45-degree angle against ridge pole',
            'Layer leaves, bark, and debris over branches',
            'Build insulation layer 1-2 feet thick',
            'Leave open side facing away from wind and fire',
            'Create insulated floor with leaves/pine needles',
            'Build fire reflector wall behind your shelter'
          ],
          advantages: [
            'Fastest to build',
            'Minimal materials needed',
            'Provides direct fire warmth',
            'Good ventilation prevents smoke buildup',
            'Can be expanded as needed'
          ],
          disadvantages: [
            'Open to wind and weather on one side',
            'Limited insulation value',
            'Not suitable for extreme cold without modifications',
            'Requires fire management'
          ],
          modifications: 'Build two lean-tos back-to-back for complete protection. Add bark shingles for rain resistance.',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lean-to-shelter.jpg'
        },
        {
          name: 'Debris Hut (Maximum Insulation)',
          icon: '🛏️',
          environment: 'Extreme cold conditions. Best insulation-to-effort ratio.',
          difficulty: 'Intermediate',
          timeToComplete: '45-90 minutes',
          materials: ['Ridge pole', 'Frame branches', 'Large pile of leaves/debris', 'Entrance framing'],
          steps: [
            'Select location on slightly elevated ground',
            'Prop ridge pole between two trees or forked sticks at waist height',
            'Create an A-frame over ridge pole with branches',
            'Frame entrance (should be just large enough to squeeze through)',
            'Pile leaves and debris over frame - build thick layer (2-3 feet minimum)',
            'Create insulated floor inside with leaves/pine needles',
            'Line inside with bark or additional leaves',
            'Test: structure should feel warm when you\'re inside',
            'Small entrance reduces heat loss'
          ],
          advantages: [
            'Exceptional insulation properties',
            'Stays warm without fire',
            'Waterproof when built correctly',
            'Small entrance reduces wind penetration',
            'Built-in sleeping platform'
          ],
          disadvantages: [
            'Takes longer to build',
            'Uses massive amounts of debris',
            'Low ceiling can feel claustrophobic',
            'Difficult to ventilate if too sealed',
            'Hard to have fire inside safely'
          ],
          modifications: 'Add vent holes if interior gets too humid. Create two chambers for heat retention.',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Debris-hut-shelter.jpg'
        },
        {
          name: 'Teepee/Conical Frame (Traditional Design)',
          icon: '🎪',
          environment: 'Versatile. Works in many environments. Allows fire inside.',
          difficulty: 'Intermediate',
          timeToComplete: '30-60 minutes',
          materials: ['Tall straight branches (8-12 branches)', 'Bark or woven material for covering', 'Rope or paracord', 'Entrance frame'],
          steps: [
            'Gather 8-12 tall branches (15-20 feet minimum)',
            'Lash top ends together with rope/cord',
            'Spread base in circular pattern (10-15 feet diameter)',
            'Tie branches at base securely',
            'Lean branches inward to create cone',
            'Cover with bark panels, starting at bottom',
            'Overlap like shingles for water runoff',
            'Leave opening at top for smoke (fire inside)',
            'Create wind-blocking panel across entrance',
            'Insulate interior floor'
          ],
          advantages: [
            'Allows interior fire',
            'Smoke hole provides ventilation',
            'Stands on own (no trees required)',
            'Good in rain',
            'Proven traditional design',
            'Comfortable interior space'
          ],
          disadvantages: [
            'Requires many tall branches',
            'Complex lashing needed',
            'Takes significant time to build',
            'Needs precise angle for stability',
            'Smoke hole allows heat loss'
          ],
          modifications: 'Use large bark panels from fallen trees. Create entrance vestibule for wind blocking.',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Teepee-shelter.jpg'
        },
        {
          name: 'Snow Cave (Cold Weather)',
          icon: '❄️',
          environment: 'Deep snow environments only. Zero-wind environment.',
          difficulty: 'Advanced',
          timeToComplete: '90-120 minutes',
          materials: ['Shovel or digging tool', 'Packed snow', 'Insulation materials inside'],
          steps: [
            'Find deep snow pack (minimum 6-8 feet)',
            'Dig entrance tunnel into snow at slight upward angle',
            'Tunnel should be narrow (just body-width)',
            'Upward angle prevents cold air from entering living chamber',
            'Dig main chamber above entrance level',
            'Chamber should be larger inside than entrance',
            'Create sleeping platform elevated above entrance',
            'Smooth ceiling to prevent drips',
            'Create ventilation hole in roof',
            'Line floor with insulating material (pine boughs, blankets)',
            'Use sleeping platform as cold air trap'
          ],
          advantages: [
            'Exceptional insulation (snow provides R-30+ value)',
            'Wind protected',
            'Stable temperature inside',
            'Invisible to wind',
            'Can stay warm without fire'
          ],
          disadvantages: [
            'Only possible with deep snow',
            'Risk of suffocation without ventilation',
            'Ceiling can drip from internal heat',
            'Very difficult to build',
            'Requires proper understanding of snow conditions'
          ],
          modifications: 'Create roof vent with bamboo stick or branch. Use snow blocks to seal entrance.',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Snow-cave-shelter.jpg'
        },
        {
          name: 'A-Frame Tarp Shelter (Lightweight)',
          icon: '⛺',
          environment: 'Moderate weather. Minimal pack weight.',
          difficulty: 'Beginner',
          timeToComplete: '15-20 minutes',
          materials: ['Tarp or large plastic sheet', 'Ridge pole', 'Rope or paracord', 'Ground stakes'],
          steps: [
            'Select location with natural wind break',
            'Set up ridge pole between two points (trees or stake)',
            'Drape tarp over ridge pole',
            'Pull corners down and stake to ground',
            'Front corner should face away from wind',
            'Angle roof for water runoff',
            'Leave sides partially open for ventilation',
            'Create waterproofed seams using grease or pine tar',
            'Stake all corners for stability',
            'Insulate floor separately'
          ],
          advantages: [
            'Fastest to deploy',
            'Minimal weight',
            'Flexible shape',
            'Good rain protection',
            'Easy to modify'
          ],
          disadvantages: [
            'Requires tarp (not natural materials)',
            'Limited insulation',
            'Wind can cause flapping noise',
            'Not suitable for extreme cold',
            'Open sides expose to wind'
          ],
          modifications: 'Create bathtub floor by raising edges. Add second tarp for insulation layer.',
          imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tarp-shelter.jpg'
        }
      ]
    }
  ]
};

export type EnhancedSurvivalGuide = typeof ENHANCED_SURVIVAL_GUIDE;
