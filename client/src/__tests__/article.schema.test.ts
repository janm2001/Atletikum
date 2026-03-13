import { describe, it, expect } from "vitest";
import { articleSchema } from "../schema/article.schema";
import { ArticleTag } from "../types/Article/article";

describe("articleSchema", () => {
    const validArticle = {
        title: "Test Article",
        summary: "A summary",
        content: "<p>Long enough content here</p>",
        tag: ArticleTag.TRAINING,
    };

    it("accepts a valid article", () => {
        const result = articleSchema.safeParse(validArticle);
        expect(result.success).toBe(true);
    });

    it("rejects title shorter than 3 characters", () => {
        const result = articleSchema.safeParse({ ...validArticle, title: "Hi" });
        expect(result.success).toBe(false);
    });

    it("rejects content shorter than 10 characters", () => {
        const result = articleSchema.safeParse({ ...validArticle, content: "short" });
        expect(result.success).toBe(false);
    });

    it("rejects invalid tag", () => {
        const result = articleSchema.safeParse({ ...validArticle, tag: "INVALID" });
        expect(result.success).toBe(false);
    });

    it("accepts all valid ArticleTag values", () => {
        for (const tag of Object.values(ArticleTag)) {
            const result = articleSchema.safeParse({ ...validArticle, tag });
            expect(result.success).toBe(true);
        }
    });

    it("accepts valid sourceUrl", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            sourceUrl: "https://example.com",
        });
        expect(result.success).toBe(true);
    });

    it("accepts empty string sourceUrl", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            sourceUrl: "",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid sourceUrl", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            sourceUrl: "not-a-url",
        });
        expect(result.success).toBe(false);
    });

    it("accepts coverImage as /uploads/articles path", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            coverImage: "/uploads/articles/example.png",
        });
        expect(result.success).toBe(true);
    });

    it("accepts coverImage as uploads/articles path without leading slash", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            coverImage: "uploads/articles/example.png",
        });
        expect(result.success).toBe(true);
    });

    it("accepts filesystem-like path containing uploads/articles", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            coverImage: "C:\\app\\server\\uploads\\articles\\example.png",
        });
        expect(result.success).toBe(true);
    });

    it("accepts coverImage as file-name only", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            coverImage: "example.png",
        });
        expect(result.success).toBe(true);
    });

    it("rejects non-uploads relative coverImage path", () => {
        const result = articleSchema.safeParse({
            ...validArticle,
            coverImage: "images/example.png",
        });
        expect(result.success).toBe(false);
    });

    describe("quiz validation", () => {
        it("accepts article with valid quiz", () => {
            const result = articleSchema.safeParse({
                ...validArticle,
                quiz: [
                    {
                        question: "What is 2+2?",
                        options: ["3", "4", "5"],
                        correctIndex: 1,
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it("accepts article without quiz", () => {
            const result = articleSchema.safeParse(validArticle);
            expect(result.success).toBe(true);
        });

        it("rejects quiz question shorter than 3 characters", () => {
            const result = articleSchema.safeParse({
                ...validArticle,
                quiz: [{ question: "Q?", options: ["A", "B"], correctIndex: 0 }],
            });
            expect(result.success).toBe(false);
        });

        it("rejects quiz with fewer than 2 options", () => {
            const result = articleSchema.safeParse({
                ...validArticle,
                quiz: [{ question: "Valid question?", options: ["A"], correctIndex: 0 }],
            });
            expect(result.success).toBe(false);
        });

        it("rejects empty option strings", () => {
            const result = articleSchema.safeParse({
                ...validArticle,
                quiz: [
                    { question: "Q here?", options: ["", "B"], correctIndex: 0 },
                ],
            });
            expect(result.success).toBe(false);
        });

        it("rejects negative correctIndex", () => {
            const result = articleSchema.safeParse({
                ...validArticle,
                quiz: [
                    { question: "Question?", options: ["A", "B"], correctIndex: -1 },
                ],
            });
            expect(result.success).toBe(false);
        });

        it("rejects out-of-range correctIndex", () => {
            const result = articleSchema.safeParse({
                ...validArticle,
                quiz: [
                    { question: "Question?", options: ["A", "B"], correctIndex: 99 },
                ],
            });
            expect(result.success).toBe(false);
        });
    });
});
