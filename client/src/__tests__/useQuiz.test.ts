import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubmitQuiz } from "../hooks/useQuiz";
import { keys } from "../lib/query-keys";
import type { QuizStatus, QuizSubmitResult } from "../types/Article/quiz";

const reactQueryMocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => reactQueryMocks);

type SubmitQuizVariables = {
  articleId: string;
  submittedAnswers: number[];
};

type SubmitQuizMutation = {
  onSuccess?: (
    result: QuizSubmitResult,
    variables: SubmitQuizVariables,
  ) => void;
};

const createSubmitResult = (passed: boolean): QuizSubmitResult => ({
  status: "success",
  data: {
    completion: {
      score: passed ? 4 : 2,
      totalQuestions: 5,
      xpGained: passed ? 100 : 0,
      completedAt: "2024-01-03T00:00:00.000Z",
      passed,
    },
    user: null,
    newAchievements: [],
    nextAvailableAt: "2024-01-10T00:00:00.000Z",
  },
});

describe("useSubmitQuiz", () => {
  const setQueryData = vi.fn();
  const invalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    reactQueryMocks.useQueryClient.mockReturnValue({
      setQueryData,
      invalidateQueries,
    });
    reactQueryMocks.useMutation.mockImplementation((options: object) => options);
  });

  it.each([
    { label: "passed", passed: true },
    { label: "failed", passed: false },
  ])(
    "syncs quiz completions cache after a $label submission",
    ({ passed }) => {
      const mutation = useSubmitQuiz() as unknown as SubmitQuizMutation;
      const result = createSubmitResult(passed);

      mutation.onSuccess?.(result, {
        articleId: "article-1",
        submittedAnswers: [0, 1, 2, 3, 4],
      });

      expect(setQueryData).toHaveBeenCalledTimes(2);
      expect(setQueryData).toHaveBeenNthCalledWith(
        1,
        keys.quiz.status("article-1"),
        expect.any(Function),
      );
      expect(setQueryData).toHaveBeenNthCalledWith(
        2,
        keys.quiz.completions(),
        expect.any(Function),
      );

      const statusUpdater = setQueryData.mock.calls[0]?.[1] as
        | ((status: QuizStatus | undefined) => QuizStatus)
        | undefined;
      expect(statusUpdater?.(undefined)).toEqual({
        canTakeQuiz: false,
        lastCompletion: result.data.completion,
        nextAvailableAt: result.data.nextAvailableAt,
      });

      const completionsUpdater = setQueryData.mock.calls[1]?.[1] as
        | ((completedArticleIds: string[] | undefined) => string[])
        | undefined;
      expect(completionsUpdater?.(undefined)).toEqual(["article-1"]);

      const existingCompletions = ["article-1"];
      expect(completionsUpdater?.(existingCompletions)).toBe(existingCompletions);

      expect(invalidateQueries).toHaveBeenCalledTimes(4);
      expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
        queryKey: keys.quiz.status("article-1"),
      });
      expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
        queryKey: keys.quiz.completions(),
      });
      expect(invalidateQueries).toHaveBeenNthCalledWith(3, {
        queryKey: keys.challenges.weekly(),
      });
      expect(invalidateQueries).toHaveBeenNthCalledWith(4, {
        queryKey: keys.gamification.status(),
      });
    },
  );
});
