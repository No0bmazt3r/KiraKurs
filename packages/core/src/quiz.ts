// Quiz scoring shared by Pre-check and Check (docs/UX-FLOWS.md §2.0, §2.5). Pure and tested.
import { QUIZ, OBJECTIVES, QUIZ_MAX, type QuizItem } from "./content";

export type Form = "A" | "B";
export type Answer = string | string[] | null;
export type Answers = Record<number, { answer: Answer; confidence: number }>;

export function itemScore(q: QuizItem, answer: Answer | undefined) {
  if (answer == null) return 0;
  if (q.pick2) {
    const a = ([] as string[]).concat(answer);
    const good = a.filter((x) => q.correctSet!.includes(x)).length;
    return Math.max(0, Math.min(2, good - (a.length - good)));
  }
  return answer === q.correct ? 1 : 0;
}

// answers: { [id]: { answer, confidence } } → { total, perObj: {1..5: [got, max]} }
export function score(form: Form, answers: Answers | null | undefined) {
  const items = QUIZ[form];
  const perObj: Record<string, [number, number]> = {};
  let total = 0;
  for (const [obj, ids] of Object.entries(OBJECTIVES)) {
    let got = 0, max = 0;
    for (const id of ids) {
      const q = items.find((x) => x.id === id)!;
      got += itemScore(q, answers?.[id]?.answer); max += q.pick2 ? 2 : 1;
    }
    perObj[obj] = [got, max]; total += got;
  }
  return { total, max: QUIZ_MAX, perObj };
}

export const otherForm = (f: Form): Form => (f === "A" ? "B" : "A");
export const resultCode = (firstForm: Form, pre: number | null | undefined, post: number) => `KK-${firstForm}${pre == null ? "x" : pre}-${post}`;
