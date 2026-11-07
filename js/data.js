/**
 * Exercise catalog. To add a category, append one object to CATEGORIES with
 * seven routines; the 3, 5 and 7 day plans are built from them automatically.
 */

const routine = (title, focus, exercises) => ({
  title,
  focus,
  exercises: exercises.map(([name, amount]) => ({ name, amount })),
});

export const CATEGORIES = [
  {
    id: "flexibility",
    name: "Flexibility",
    icon: "stretch",
    tone: "#5eead4",
    description: "Stretch and loosen your muscles to move freely and prevent stiffness.",
    routines: [
      routine("Neck & Shoulders", "Release upper-body tension", [
        ["Neck side tilt", "30 sec / side"],
        ["Shoulder rolls", "1 min"],
        ["Cross-body shoulder stretch", "30 sec / side"],
        ["Doorway chest opener", "45 sec"],
      ]),
      routine("Hips & Glutes", "Open tight hips", [
        ["Pigeon pose", "45 sec / side"],
        ["Figure-four stretch", "30 sec / side"],
        ["Butterfly stretch", "1 min"],
        ["Deep lunge hold", "30 sec / side"],
      ]),
      routine("Hamstrings & Calves", "Lengthen the back of the legs", [
        ["Seated forward fold", "1 min"],
        ["Standing hamstring stretch", "30 sec / side"],
        ["Downward dog", "45 sec"],
        ["Wall calf stretch", "30 sec / side"],
      ]),
      routine("Back & Spine", "Mobilize and decompress the spine", [
        ["Cat-cow", "10 slow reps"],
        ["Child's pose", "1 min"],
        ["Seated spinal twist", "30 sec / side"],
        ["Thread the needle", "30 sec / side"],
      ]),
      routine("Chest & Arms", "Open the front of the body", [
        ["Wall chest stretch", "30 sec / side"],
        ["Overhead triceps stretch", "30 sec / side"],
        ["Wrist flexor stretch", "30 sec / side"],
        ["Eagle arms", "30 sec / side"],
      ]),
      routine("Quads & Hip Flexors", "Counter the effects of sitting", [
        ["Standing quad stretch", "30 sec / side"],
        ["Low lunge", "45 sec / side"],
        ["Frog stretch", "1 min"],
        ["Couch stretch", "30 sec / side"],
      ]),
      routine("Full Body Flow", "Move through every major muscle group", [
        ["Sun salutation", "5 rounds"],
        ["Standing side bend", "30 sec / side"],
        ["Deep squat hold", "1 min"],
        ["Supine knee hug", "30 sec / side"],
      ]),
    ],
  },
  {
    id: "strength",
    name: "Strength",
    icon: "dumbbell",
    tone: "#fdba74",
    description: "Build muscle and power with simple bodyweight training. No equipment needed.",
    routines: [
      routine("Push Day", "Chest, shoulders and triceps", [
        ["Push-ups", "3 × 10"],
        ["Pike push-ups", "3 × 8"],
        ["Bench dips", "3 × 12"],
        ["Diamond push-ups", "3 × 8"],
      ]),
      routine("Legs & Glutes", "Lower-body strength", [
        ["Bodyweight squats", "3 × 15"],
        ["Reverse lunges", "3 × 10 / leg"],
        ["Glute bridges", "3 × 15"],
        ["Calf raises", "3 × 20"],
      ]),
      routine("Pull Day", "Back and biceps", [
        ["Inverted rows", "3 × 10"],
        ["Superman hold", "3 × 30 sec"],
        ["Towel curls", "3 × 12"],
        ["Reverse snow angels", "3 × 12"],
      ]),
      routine("Core & Stability", "A strong, steady midsection", [
        ["Plank", "3 × 45 sec"],
        ["Dead bug", "3 × 10 / side"],
        ["Bird dog", "3 × 10 / side"],
        ["Side plank", "3 × 30 sec / side"],
      ]),
      routine("Shoulders & Arms", "Upper-body definition", [
        ["Pike push-ups", "3 × 10"],
        ["Lateral raises", "3 × 12"],
        ["Triceps dips", "3 × 12"],
        ["Arm circles", "2 × 30 sec"],
      ]),
      routine("Lower Body Power", "Explosive legs", [
        ["Jump squats", "3 × 10"],
        ["Walking lunges", "3 × 12 / leg"],
        ["Step-ups", "3 × 10 / leg"],
        ["Wall sit", "3 × 40 sec"],
      ]),
      routine("Full Body Circuit", "Total-body strength and stamina", [
        ["Burpees", "3 × 8"],
        ["Mountain climbers", "3 × 20"],
        ["Squat to press", "3 × 12"],
        ["Push-ups", "3 × 10"],
      ]),
    ],
  },
  {
    id: "cardio",
    name: "Cardio",
    icon: "activity",
    tone: "#f9a8d4",
    description: "Raise your heart rate, build endurance and burn energy.",
    routines: [
      routine("Brisk Walk", "Easy steady-state cardio", [
        ["Warm-up march", "5 min"],
        ["Brisk walk or light jog", "20 min"],
        ["Cool-down walk", "5 min"],
        ["Calf & quad stretch", "2 min"],
      ]),
      routine("Interval Run", "Alternate fast and easy running", [
        ["Warm-up jog", "5 min"],
        ["1 min fast / 2 min easy", "6 rounds"],
        ["Cool-down walk", "5 min"],
        ["Hamstring stretch", "1 min / side"],
      ]),
      routine("Low-Impact Cardio", "Gentle on the joints", [
        ["High-knee march", "3 min"],
        ["Step jacks", "3 min"],
        ["Shadow boxing", "5 min"],
        ["Slow squats with arm swings", "3 min"],
      ]),
      routine("Jump Rope", "Coordination and calorie burn", [
        ["Jump rope (30 sec rest)", "5 × 1 min"],
        ["Skater hops", "2 min"],
        ["Jumping jacks", "3 min"],
        ["Cool-down walk", "3 min"],
      ]),
      routine("Endurance Jog", "Build your aerobic base", [
        ["Easy jog", "30 min"],
        ["Strides", "4 × 20 sec"],
        ["Cool-down walk", "5 min"],
        ["Calf stretch", "1 min / side"],
      ]),
      routine("HIIT Blast", "Short, intense intervals", [
        ["Jumping jacks (40 on / 20 off)", "4 rounds"],
        ["High knees (40 on / 20 off)", "4 rounds"],
        ["Burpees (30 on / 30 off)", "4 rounds"],
        ["Mountain climbers (40 on / 20 off)", "4 rounds"],
      ]),
      routine("Fun Cardio", "Move however feels good", [
        ["Dance workout", "20 min"],
        ["Stair climbing", "10 min"],
        ["Cool-down walk", "5 min"],
        ["Full-body shake-out", "2 min"],
      ]),
    ],
  },
  {
    id: "core",
    name: "Core",
    icon: "target",
    tone: "#c4b5fd",
    description: "Target your abs, obliques and lower back for balance and posture.",
    routines: [
      routine("Abs Basics", "Foundational ab work", [
        ["Crunches", "3 × 15"],
        ["Leg raises", "3 × 12"],
        ["Bicycle crunches", "3 × 20"],
        ["Plank", "3 × 40 sec"],
      ]),
      routine("Obliques", "Side-body strength", [
        ["Side plank", "3 × 30 sec / side"],
        ["Russian twists", "3 × 20"],
        ["Heel touches", "3 × 20"],
        ["Windshield wipers", "3 × 10"],
      ]),
      routine("Lower Abs", "Control and endurance", [
        ["Reverse crunches", "3 × 12"],
        ["Flutter kicks", "3 × 30 sec"],
        ["Scissor kicks", "3 × 30 sec"],
        ["Lying leg hold", "3 × 20 sec"],
      ]),
      routine("Stability", "Anti-rotation and balance", [
        ["Dead bug", "3 × 10 / side"],
        ["Bird dog", "3 × 10 / side"],
        ["Plank shoulder taps", "3 × 20"],
        ["Hollow hold", "3 × 20 sec"],
      ]),
      routine("Back & Core", "Strengthen the whole trunk", [
        ["Superman", "3 × 12"],
        ["Glute bridge", "3 × 15"],
        ["Bear crawl hold", "3 × 20 sec"],
        ["Plank", "3 × 45 sec"],
      ]),
      routine("Dynamic Core", "Fast, active movements", [
        ["Mountain climbers", "3 × 30 sec"],
        ["Plank jacks", "3 × 15"],
        ["V-ups", "3 × 10"],
        ["Toe touches", "3 × 15"],
      ]),
      routine("Core Finisher", "Short and effective", [
        ["Plank", "1 × 60 sec"],
        ["Bicycle crunches", "1 × 40 sec"],
        ["Side plank", "1 × 30 sec / side"],
        ["Child's pose stretch", "1 min"],
      ]),
    ],
  },
];

export const PLAN_OPTIONS = [
  { days: 3, label: "Light", blurb: "3 days a week. Ideal for beginners or busy schedules." },
  { days: 5, label: "Balanced", blurb: "5 days a week. Steady progress with 2 rest days." },
  { days: 7, label: "Intensive", blurb: "Every day of the week. For a full-commitment routine." },
];

// Which of the seven routines each plan length uses (indexes into `routines`).
const PLAN_LAYOUTS = {
  3: [1, 3, 6],
  5: [0, 1, 3, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);

/** Returns the routines of a plan as [{ day: 1, title, focus, exercises }, ...]. */
export function buildPlanDays(category, daysPerWeek) {
  const layout = PLAN_LAYOUTS[daysPerWeek];
  if (!layout) throw new Error(`Unsupported plan length: ${daysPerWeek}`);
  return layout.map((routineIndex, i) => ({ day: i + 1, ...category.routines[routineIndex] }));
}
