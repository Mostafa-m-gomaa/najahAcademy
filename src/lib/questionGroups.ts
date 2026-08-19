export const SPECIAL_QUESTION_GROUP_NAMES = ["الفصول"] as const;

export const isSpecialQuestionGroup = (name?: string | null) => {
  if (!name) return false;
  return (SPECIAL_QUESTION_GROUP_NAMES as readonly string[]).includes(name.trim());
};
