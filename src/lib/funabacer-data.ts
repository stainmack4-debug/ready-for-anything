export type Question = {
  id: string;
  text: string;
  options: string[];
  answer: number;
  /** Why the correct answer is correct. */
  explanation: string;
  /** Dropped-a-level explanation with a simpler analogy. */
  simpler: string;
  /** Per-option diagnosis of the misconception ("" for the correct option). */
  wrong: string[];
};

export type Topic = {
  id: string;
  courseCode: string;
  courseTitle: string;
  name: string;
  minutes: number;
  learn: { heading: string; body: string }[];
  questions: Question[];
};

export const topics: Topic[] = [
  {
    id: "mole-concept",
    courseCode: "CHM 101",
    courseTitle: "General Chemistry I",
    name: "Mole Concept",
    minutes: 4,
    learn: [
      {
        heading: "The mole is just a counting unit",
        body: "A dozen means 12. A mole means 6.02 × 10²³. Chemists count atoms in moles because atoms are too tiny to count one by one. 1 mole of ANYTHING = 6.02 × 10²³ particles.",
      },
      {
        heading: "Molar mass: the bridge between grams and moles",
        body: "Every substance has a molar mass (g/mol) — the mass of one mole of it, taken straight from the periodic table. CO₂ = 12 + 16 + 16 = 44 g/mol. The golden formula: moles = mass ÷ molar mass.",
      },
      {
        heading: "Gases at s.t.p.",
        body: "At standard temperature and pressure, 1 mole of ANY gas occupies 22.4 dm³. So moles = volume ÷ 22.4. Half a mole = 11.2 dm³. Always.",
      },
      {
        heading: "Putting it together",
        body: "Mass ⇄ moles ⇄ particles ⇄ gas volume. Every mole concept question is just hopping between these four using: n = m/M, particles = n × 6.02×10²³, V = n × 22.4 dm³.",
      },
    ],
    questions: [
      {
        id: "mc1",
        text: "How many moles are contained in 11 g of CO₂? [C = 12, O = 16]",
        options: ["0.25 mol", "0.50 mol", "2.50 mol", "4.00 mol"],
        answer: 0,
        explanation:
          "Molar mass of CO₂ = 12 + 2(16) = 44 g/mol. Moles = mass ÷ molar mass = 11 ÷ 44 = 0.25 mol.",
        simpler:
          "Think of molar mass as the 'price per mole'. CO₂ costs 44 g per mole. You only have 11 g — a quarter of the price — so you can only buy a quarter of a mole: 0.25.",
        wrong: [
          "",
          "You divided 11 by 22 instead of by the molar mass 44. 22.4 dm³ is for gas VOLUME at s.t.p., not for mass-to-mole conversion.",
          "You multiplied instead of dividing. Moles = mass ÷ molar mass, never mass × molar mass.",
          "You flipped the formula upside down (44 ÷ 11). The small number of grams divided by the big molar mass gives a small mole value.",
        ],
      },
      {
        id: "mc2",
        text: "The number of particles in 0.5 mole of a gas is approximately",
        options: ["3.01 × 10²³", "6.02 × 10²³", "1.20 × 10²⁴", "3.01 × 10²⁴"],
        answer: 0,
        explanation:
          "Particles = moles × Avogadro's number = 0.5 × 6.02 × 10²³ = 3.01 × 10²³.",
        simpler:
          "If 1 box holds 6.02 × 10²³ particles, half a box (0.5 mol) holds exactly half: 3.01 × 10²³.",
        wrong: [
          "",
          "That's 1 full mole, not 0.5 mol. Multiply Avogadro's number by the number of moles given: 0.5 × 6.02 × 10²³.",
          "You doubled instead of halving. 0.5 mol means HALF of Avogadro's number.",
          "You halved the 6.02 but raised the power of ten. Halving keeps the exponent and halves the coefficient.",
        ],
      },
      {
        id: "mc3",
        text: "The molar mass of H₂SO₄ is [H = 1, S = 32, O = 16]",
        options: ["49 g/mol", "82 g/mol", "98 g/mol", "108 g/mol"],
        answer: 2,
        explanation:
          "H₂SO₄ = 2(1) + 32 + 4(16) = 2 + 32 + 64 = 98 g/mol.",
        simpler:
          "Add up every atom like items on a receipt: 2 hydrogens (₦1 each), 1 sulphur (₦32), 4 oxygens (₦16 each). Total = 98.",
        wrong: [
          "You divided by 2 somewhere. Molar mass is a pure SUM of all atoms — never divide.",
          "You probably used 3 oxygens (2 + 32 + 48 = 82). H₂SO₄ has FOUR oxygen atoms: the small 4 after O.",
          "",
          "You added an extra oxygen or used S = 42. Sulphur is 32, and there are exactly 4 oxygens.",
        ],
      },
      {
        id: "mc4",
        text: "What is the mass of 0.2 mole of NaOH? [Na = 23, O = 16, H = 1]",
        options: ["4 g", "8 g", "20 g", "40 g"],
        answer: 1,
        explanation:
          "Molar mass of NaOH = 23 + 16 + 1 = 40 g/mol. Mass = moles × molar mass = 0.2 × 40 = 8 g.",
        simpler:
          "One mole weighs 40 g. You only have 0.2 of a mole — one fifth — so one fifth of 40 g = 8 g.",
        wrong: [
          "That's 0.1 mol worth. 0.2 × 40 = 8, not 4.",
          "",
          "You halved the molar mass instead of multiplying by 0.2. Mass = moles × molar mass.",
          "That's the mass of a FULL mole. The question says 0.2 mole, so scale down: 0.2 × 40.",
        ],
      },
      {
        id: "mc5",
        text: "The volume occupied by 0.5 mole of an ideal gas at s.t.p. is",
        options: ["5.6 dm³", "11.2 dm³", "22.4 dm³", "44.8 dm³"],
        answer: 1,
        explanation:
          "At s.t.p., 1 mole of any gas = 22.4 dm³. So 0.5 mol = 0.5 × 22.4 = 11.2 dm³.",
        simpler:
          "Every mole of gas gets a 22.4 dm³ 'room' at s.t.p. Half a mole gets half the room: 11.2 dm³.",
        wrong: [
          "That's 0.25 mol (22.4 ÷ 4). For 0.5 mol, divide 22.4 by 2, not by 4.",
          "",
          "That's 1 full mole. The question gives 0.5 mole — scale 22.4 down by half.",
          "You doubled 22.4, which is 2 moles worth. Multiply 22.4 by the mole value: 0.5 × 22.4.",
        ],
      },
      {
        id: "mc6",
        text: "The percentage by mass of oxygen in H₂O is [H = 1, O = 16]",
        options: ["11.1%", "33.3%", "66.7%", "88.9%"],
        answer: 3,
        explanation:
          "Molar mass of H₂O = 18 g/mol. %O = (16 ÷ 18) × 100 = 88.9%.",
        simpler:
          "Water weighs 18 units in total, and oxygen alone contributes 16 of them. Oxygen is almost the whole thing: 16/18 ≈ 89%.",
        wrong: [
          "That's the percentage of HYDROGEN (2/18 = 11.1%), not oxygen. The question asks for oxygen.",
          "You treated the molecule as 3 equal atoms. Percentage is by MASS, and oxygen (16) outweighs the two hydrogens (2).",
          "You divided 16 by 24 or used wrong atomic masses. H₂O total = 2(1) + 16 = 18.",
          "",
        ],
      },
    ],
  },
  {
    id: "gas-laws",
    courseCode: "CHM 101",
    courseTitle: "General Chemistry I",
    name: "Gas Laws",
    minutes: 4,
    learn: [
      {
        heading: "Gases are squeezable",
        body: "Gas particles are far apart with empty space between them, so you can compress them, heat them, cool them. Gas laws are just rules for how pressure (P), volume (V) and temperature (T) trade off against each other.",
      },
      {
        heading: "Boyle's Law: squeeze the volume, raise the pressure",
        body: "At constant temperature, P × V is constant: P₁V₁ = P₂V₂. Halve the volume, double the pressure — like pressing a syringe with the tip blocked.",
      },
      {
        heading: "Charles' Law: heat it, it expands",
        body: "At constant pressure, V ÷ T is constant: V₁/T₁ = V₂/T₂. CRITICAL: T must be in Kelvin. K = °C + 273. 27°C = 300 K, and 127°C = 400 K — not double in Celsius, but a clean ratio in Kelvin.",
      },
      {
        heading: "Always convert to Kelvin first",
        body: "90% of gas law mistakes in JAMB are Celsius mistakes. Before ANY formula, convert T to Kelvin. Then plug into P₁V₁/T₁ = P₂V₂/T₂ (combined law) and solve for the unknown.",
      },
    ],
    questions: [
      {
        id: "gl1",
        text: "A gas occupies 300 cm³ at 2 atm pressure. What volume will it occupy at 3 atm, temperature remaining constant?",
        options: ["100 cm³", "200 cm³", "450 cm³", "600 cm³"],
        answer: 1,
        explanation:
          "Boyle's law: P₁V₁ = P₂V₂ → 2 × 300 = 3 × V₂ → V₂ = 600 ÷ 3 = 200 cm³. More pressure, less volume.",
        simpler:
          "Squeeze harder (2→3 atm) and the gas shrinks by the same ratio. Pressure went up by factor 3/2, so volume must come down by factor 2/3: 300 × 2/3 = 200.",
        wrong: [
          "You divided 300 by 3 directly. Pressure went from 2 to 3 atm — use the RATIO 2/3, not the raw number 3.",
          "",
          "You multiplied by the ratio the wrong way up (300 × 3/2). Higher pressure means SMALLER volume, not bigger.",
          "You added pressure effects instead of using inverse proportion. Boyle's law multiplies: P₁V₁ = P₂V₂.",
        ],
      },
      {
        id: "gl2",
        text: "A gas occupies 300 cm³ at 27°C. At what temperature (in °C) will its volume become 400 cm³ at constant pressure?",
        options: ["36°C", "100°C", "127°C", "400°C"],
        answer: 2,
        explanation:
          "Charles' law needs Kelvin: T₁ = 27 + 273 = 300 K. V₁/T₁ = V₂/T₂ → 300/300 = 400/T₂ → T₂ = 400 K = 400 − 273 = 127°C.",
        simpler:
          "Convert to Kelvin first: 27°C is really 300 K. Volume grew by 4/3, so Kelvin temperature grows by 4/3 → 400 K. Then subtract 273 to get back to Celsius: 127°C.",
        wrong: [
          "You scaled the Celsius value directly (27 × 4/3 = 36). Ratios ONLY work in Kelvin — always add 273 first.",
          "You just subtracted 27 from 127 or guessed near the answer. Show the Kelvin steps: 300 K → 400 K → 127°C.",
          "",
          "That's the Kelvin answer (400 K) written as Celsius. The question asks for °C — subtract 273 at the end.",
        ],
      },
      {
        id: "gl3",
        text: "The gas law which states that the volume of a fixed mass of gas is inversely proportional to its pressure at constant temperature is",
        options: ["Charles' law", "Boyle's law", "Graham's law", "Avogadro's law"],
        answer: 1,
        explanation:
          "Pressure up, volume down (inverse proportion) at constant temperature — that's Boyle's law.",
        simpler:
          "Match the keyword: PRESSURE and VOLUME trading off = Boyle. TEMPERATURE and VOLUME = Charles. DIFFUSION rates = Graham.",
        wrong: [
          "Charles' law links VOLUME and TEMPERATURE, not pressure. The question mentions pressure and volume.",
          "",
          "Graham's law is about DIFFUSION rates of gases, not pressure–volume changes.",
          "Avogadro's law links volume to the NUMBER OF MOLES of gas, not pressure.",
        ],
      },
      {
        id: "gl4",
        text: "An ideal gas behaves most nearly like a real gas at",
        options: [
          "high temperature and low pressure",
          "low temperature and high pressure",
          "high temperature and high pressure",
          "low temperature and low pressure",
        ],
        answer: 0,
        explanation:
          "Ideal behaviour needs particles far apart and moving fast: high temperature + low pressure. At low T / high P, real gases attract and condense.",
        simpler:
          "Ideality = particles ignoring each other. Spread them out (low pressure) and make them zoom (high temperature) so they never interact.",
        wrong: [
          "",
          "That's when gases are LEAST ideal — cold and squeezed particles attract each other and liquefy.",
          "High pressure forces particles close together, where attractions break ideal behaviour.",
          "Low temperature slows particles so attractions matter — behaviour stops being ideal.",
        ],
      },
      {
        id: "gl5",
        text: "A gas at 27°C and 2 atm occupies 500 cm³. Its volume at s.t.p. (0°C, 1 atm) is",
        options: ["250 cm³", "455 cm³", "909 cm³", "1000 cm³"],
        answer: 2,
        explanation:
          "Combined law: P₁V₁/T₁ = P₂V₂/T₂. (2 × 500)/300 = (1 × V₂)/273 → V₂ = 1000 × 273 ÷ 300 = 910 ≈ 909 cm³.",
        simpler:
          "Two changes at once: pressure halves (2→1, volume doubles → 1000) and temperature drops (300→273 K, volume shrinks ×273/300). 1000 × 0.91 = 910 ≈ 909.",
        wrong: [
          "You halved the volume, but dropping pressure from 2 to 1 atm should INCREASE volume. Inverse relationship.",
          "You used the temperature ratio the wrong way up (300/273 instead of 273/300). Cooling a gas SHRINKS it.",
          "",
          "You only applied the pressure change and forgot the temperature drop from 300 K to 273 K.",
        ],
      },
      {
        id: "gl6",
        text: "According to Graham's law of diffusion, the gas that diffuses fastest is",
        options: ["CO₂ (M = 44)", "O₂ (M = 32)", "SO₂ (M = 64)", "NH₃ (M = 17)"],
        answer: 3,
        explanation:
          "Graham's law: rate ∝ 1/√M. The lightest gas diffuses fastest. NH₃ (17) is the lightest here.",
        simpler:
          "Diffusion is a race — the lightest molecules win. Compare molar masses and pick the smallest: NH₃ at 17.",
        wrong: [
          "CO₂ is heavier than O₂ and NH₃. Heavier = slower.",
          "O₂ is light, but NH₃ (17) is lighter still. Lowest molar mass wins.",
          "SO₂ is the HEAVIEST here (64) — it diffuses slowest, not fastest.",
          "",
        ],
      },
    ],
  },
  {
    id: "stoichiometry",
    courseCode: "CHM 101",
    courseTitle: "General Chemistry I",
    name: "Stoichiometry",
    minutes: 4,
    learn: [
      {
        heading: "Equations are recipes",
        body: "2H₂ + O₂ → 2H₂O reads like a recipe: 2 parts hydrogen + 1 part oxygen gives 2 parts water. The coefficients are mole ratios — the conversion rates between everything in the reaction.",
      },
      {
        heading: "Balance first, always",
        body: "Atoms can't appear or vanish. Count each element on both sides and fix coefficients until they match. Never touch the subscripts (H₂O stays H₂O) — only the numbers in front.",
      },
      {
        heading: "The mole ratio is your exchange rate",
        body: "From N₂ + 3H₂ → 2NH₃: 3 mol H₂ always gives 2 mol NH₃. Given any amount of one substance, convert to moles, apply the ratio, convert back. Moles in → ratio → moles out.",
      },
      {
        heading: "Limiting reagent",
        body: "The reactant that runs out first decides how much product you get — like having 10 bread slices but only 2 eggs: eggs limit the sandwiches. Compute product from EACH reactant; the smaller answer wins.",
      },
    ],
    questions: [
      {
        id: "st1",
        text: "In the equation aH₂ + bO₂ → cH₂O, the values of a, b and c are respectively",
        options: ["1, 1, 1", "2, 1, 2", "2, 2, 1", "1, 2, 2"],
        answer: 1,
        explanation:
          "Balance: 2H₂ + O₂ → 2H₂O. Check: 4 H on each side, 2 O on each side.",
        simpler:
          "Count atoms like coins. Right side needs even hydrogens, so try 2H₂O — that gives 4H and 2O. Now match the left: 2H₂ (4H) and 1O₂ (2O).",
        wrong: [
          "That leaves oxygen unbalanced: O₂ on the left but only one O on the right. Count each element on both sides.",
          "",
          "That gives 4 H but 4 O on the left against 2 O on the right. Check oxygen again.",
          "That puts 2 H on the left against 4 H on the right. Balance hydrogen after fixing oxygen.",
        ],
      },
      {
        id: "st2",
        text: "Given: N₂ + 3H₂ → 2NH₃. How many moles of NH₃ are produced from 3 moles of H₂?",
        options: ["1", "2", "3", "6"],
        answer: 1,
        explanation:
          "The ratio H₂:NH₃ is 3:2. So 3 mol H₂ × (2/3) = 2 mol NH₃.",
        simpler:
          "The equation is an exchange rate: 3 hydrogen coins buy 2 ammonia coins. You have exactly 3 coins, so you get exactly 2.",
        wrong: [
          "You used a 3:1 ratio. The coefficient of NH₃ is 2, so 3 mol H₂ gives 2 mol NH₃, not 1.",
          "",
          "You just copied the 3. Apply the ratio: multiply by 2 (NH₃ coefficient) and divide by 3 (H₂ coefficient).",
          "You multiplied 3 × 2 without dividing by the H₂ coefficient. Ratio = 3:2, so ×2/3.",
        ],
      },
      {
        id: "st3",
        text: "In the reaction 2H₂ + O₂ → 2H₂O, the mass of water formed when 4 g of hydrogen burns completely is [H = 1, O = 16]",
        options: ["18 g", "36 g", "54 g", "72 g"],
        answer: 1,
        explanation:
          "4 g H₂ = 2 mol H₂. Ratio H₂:H₂O = 2:2 = 1:1, so 2 mol H₂O forms. Mass = 2 × 18 = 36 g.",
        simpler:
          "4 g of H₂ is 2 moles. Each mole of H₂ makes a mole of H₂O, so you get 2 moles of water. Each mole of water weighs 18 g → 36 g.",
        wrong: [
          "That's only 1 mole of water. 4 g H₂ is TWO moles (4 ÷ 2), so you get 2 × 18 = 36 g.",
          "",
          "You used 3 mol somewhere — recheck: 4 g ÷ 2 g/mol = 2 mol H₂, then 1:1 ratio to water.",
          "You multiplied 4 g × 18 directly. Convert grams to moles FIRST, then apply the ratio.",
        ],
      },
      {
        id: "st4",
        text: "The limiting reagent in a reaction is the reactant that",
        options: [
          "is present in the largest amount",
          "is completely used up first",
          "has the smallest molar mass",
          "reacts fastest",
        ],
        answer: 1,
        explanation:
          "The limiting reagent runs out first and stops the reaction. Whatever is left over is 'in excess'.",
        simpler:
          "Making sandwiches: 10 slices of bread but only 2 eggs. The eggs run out first and stop production — eggs are the limiting reagent. It's about running out, not about being small or fast.",
        wrong: [
          "The largest amount is usually the EXCESS reagent, not the limiting one. Limiting = runs out first.",
          "",
          "Molar mass has nothing to do with it. It's about how many MOLES you have versus what the equation demands.",
          "Reaction speed doesn't determine the limit — the mole ratio versus available moles does.",
        ],
      },
      {
        id: "st5",
        text: "CaCO₃ → CaO + CO₂. The moles of CO₂ produced from 0.5 mol of CaCO₃ is",
        options: ["0.25 mol", "0.5 mol", "1.0 mol", "2.0 mol"],
        answer: 1,
        explanation:
          "The ratio CaCO₃:CO₂ is 1:1. So 0.5 mol CaCO₃ gives 0.5 mol CO₂.",
        simpler:
          "One limestone unit breaks into exactly one CO₂. Half a unit of limestone gives half a unit of CO₂. 1:1 means the number just carries over.",
        wrong: [
          "You halved it again. The ratio is already 1:1 — 0.5 in, 0.5 out.",
          "",
          "You rounded up to the coefficient 1. Multiply by the ratio 1/1: it stays 0.5.",
          "You doubled. There is no 2 anywhere in this equation — the ratio is 1:1.",
        ],
      },
      {
        id: "st6",
        text: "Which of the following must be done FIRST when solving any stoichiometry problem?",
        options: [
          "Convert the answer to grams",
          "Balance the chemical equation",
          "Calculate the percentage yield",
          "Find the density of the products",
        ],
        answer: 1,
        explanation:
          "Every mole ratio comes from the balanced equation. If it's not balanced, every ratio after it is wrong.",
        simpler:
          "You can't use a recipe's exchange rates until the recipe itself is correct. Balance first — everything else depends on it.",
        wrong: [
          "Converting to grams is the LAST step, not the first.",
          "",
          "Percentage yield only matters at the very end, after theoretical yield.",
          "Density is irrelevant to mole-ratio stoichiometry.",
        ],
      },
    ],
  },
  {
    id: "atomic-structure",
    courseCode: "CHM 101",
    courseTitle: "General Chemistry I",
    name: "Atomic Structure",
    minutes: 4,
    learn: [
      {
        heading: "An atom in one line",
        body: "Protons (+) and neutrons sit in the nucleus; electrons (−) orbit in shells. Atomic number = protons. Mass number = protons + neutrons. In a neutral atom, electrons = protons.",
      },
      {
        heading: "The two numbers that define everything",
        body: "²³₁₁Na means: 11 protons (bottom) and 23 protons+neutrons (top). Neutrons = 23 − 11 = 12. Electrons = 11 if neutral. Three subtractions solve almost every question.",
      },
      {
        heading: "Isotopes: same protons, different neutrons",
        body: "Isotopes are the same element (same proton count) with different mass numbers because neutron counts differ. Example: ¹²C and ¹⁴C. Chemical behaviour is identical because electrons are identical.",
      },
      {
        heading: "Electron shells fill 2, 8, 8…",
        body: "Electrons fill shells from the inside out: shell 1 holds 2, shell 2 holds 8. Sodium (11 electrons) = 2, 8, 1. The outermost number decides chemistry — Na's single outer electron is why it's so reactive.",
      },
    ],
    questions: [
      {
        id: "as1",
        text: "The atomic number of an element is the number of",
        options: [
          "protons in its nucleus",
          "neutrons in its nucleus",
          "protons plus neutrons",
          "electron shells",
        ],
        answer: 0,
        explanation:
          "Atomic number Z = number of protons. This defines which element it is — change the protons and you change the element.",
        simpler:
          "The atomic number is the element's ID card, and that ID is the proton count. Carbon always has 6 protons; if it had 7 it would be nitrogen.",
        wrong: [
          "",
          "Neutrons can vary within the same element (isotopes) — they don't define the element.",
          "Protons + neutrons is the MASS number, not the atomic number.",
          "Shells are just where electrons live; they don't number the element.",
        ],
      },
      {
        id: "as2",
        text: "An atom of sodium ²³₁₁Na contains how many neutrons?",
        options: ["11", "12", "23", "34"],
        answer: 1,
        explanation:
          "Neutrons = mass number − atomic number = 23 − 11 = 12.",
        simpler:
          "The top number (23) counts protons + neutrons together. The bottom (11) is protons alone. Subtract to leave just neutrons: 23 − 11 = 12.",
        wrong: [
          "11 is the PROTON count (atomic number), not neutrons. Subtract: 23 − 11.",
          "",
          "23 is the mass number — protons AND neutrons combined. You must subtract the 11 protons.",
          "You added 23 + 11. Mass number already includes the protons — subtract, don't add.",
        ],
      },
      {
        id: "as3",
        text: "Isotopes of the same element differ in their number of",
        options: ["protons", "electrons", "neutrons", "shells"],
        answer: 2,
        explanation:
          "Isotopes have the same protons (same element) but different neutrons — hence different mass numbers.",
        simpler:
          "Isotopes are siblings: same family (same protons), different weights (different neutrons). ¹²C and ¹⁴C are both carbon — ¹⁴C just carries 2 extra neutrons.",
        wrong: [
          "Different proton counts = different ELEMENTS entirely, not isotopes.",
          "Neutral atoms of an element always have electrons = protons. Ions differ in electrons, not isotopes.",
          "",
          "Shells follow from electron count, which is the same for all isotopes.",
        ],
      },
      {
        id: "as4",
        text: "The electronic configuration of sodium (atomic number 11) is",
        options: ["2, 8, 1", "2, 9", "8, 2, 1", "2, 8, 2"],
        answer: 0,
        explanation:
          "Shells fill in order: 2 in the first, 8 in the second, and the 11th electron goes into the third: 2, 8, 1.",
        simpler:
          "Fill seats row by row: front row holds 2, second row holds 8. After 10 electrons, one seat is left in row three: 2, 8, 1.",
        wrong: [
          "",
          "The second shell can hold at most 8 — never 9. The extra electron starts a new shell.",
          "The FIRST shell fills first and holds only 2 — you can't put 8 in it.",
          "2, 8, 2 totals 12 electrons — that's magnesium, not sodium (11).",
        ],
      },
      {
        id: "as5",
        text: "Which subatomic particle carries a negative charge?",
        options: ["Proton", "Neutron", "Electron", "Nucleus"],
        answer: 2,
        explanation:
          "Electrons carry −1 charge. Protons are +1, neutrons are neutral (the name is the clue).",
        simpler:
          "Proton = Positive. Neutron = Neutral. Electron = the negative one, orbiting outside.",
        wrong: [
          "Protons are POSITIVE — think 'pro = positive'.",
          "Neutrons are neutral — zero charge, it's in the name.",
          "",
          "The nucleus contains protons + neutrons, so it's positive overall.",
        ],
      },
      {
        id: "as6",
        text: "The maximum number of electrons that can occupy the second shell (n = 2) is",
        options: ["2", "8", "18", "32"],
        answer: 1,
        explanation:
          "Maximum per shell = 2n². For n = 2: 2 × 4 = 8.",
        simpler:
          "Use the 2n² rule: square the shell number and double it. Shell 2 → 2² × 2 = 8.",
        wrong: [
          "2 is the capacity of the FIRST shell (n = 1). Use 2n² with n = 2.",
          "",
          "18 is the third shell (n = 3): 2 × 9 = 18. The question asks about n = 2.",
          "32 is the fourth shell. For n = 2 the answer is 8.",
        ],
      },
    ],
  },
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
