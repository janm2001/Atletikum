jest.mock("../models/ChallengeTemplate", () => {
  const ChallengeTemplate = {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };
  return { ChallengeTemplate };
});

jest.mock("../models/WeeklyChallenge", () => {
  const WeeklyChallenge = {
    find: jest.fn(),
    insertMany: jest.fn(),
  };
  return { WeeklyChallenge };
});

jest.mock("../services/weeklyChallengeService", () => ({
  startOfIsoWeek: jest.fn((d) => {
    const date = new Date(d);
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + diff);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }),
  endOfIsoWeek: jest.fn((ws) => {
    const d = new Date(ws);
    d.setUTCDate(d.getUTCDate() + 6);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  }),
}));

const { ChallengeTemplate } = require("../models/ChallengeTemplate");
const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  publishTemplates,
} = require("../services/challengeTemplateService");

const makeLean = (value) => ({ lean: jest.fn().mockResolvedValue(value) });
const makeSortLean = (value) => ({
  sort: jest.fn().mockReturnValue(makeLean(value)),
});

const makeTemplate = (overrides = {}) => ({
  _id: "tmpl-1",
  type: "quiz",
  targetCount: 3,
  xpReward: 100,
  description: "Complete 3 quizzes",
  enabled: true,
  version: 1,
  effectiveFromWeekStart: null,
  effectiveToWeekStart: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("getTemplates", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all templates sorted by type", async () => {
    const templates = [makeTemplate(), makeTemplate({ _id: "tmpl-2", type: "workout" })];
    ChallengeTemplate.find.mockReturnValue(makeSortLean(templates));

    const result = await getTemplates();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("tmpl-1");
    expect(ChallengeTemplate.find).toHaveBeenCalledWith({});
  });

  it("filters by enabled status", async () => {
    ChallengeTemplate.find.mockReturnValue(makeSortLean([]));

    await getTemplates({ enabled: true });

    expect(ChallengeTemplate.find).toHaveBeenCalledWith({ enabled: true });
  });
});

describe("createTemplate", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a template with valid data", async () => {
    const tmpl = makeTemplate();
    ChallengeTemplate.create.mockResolvedValue({ toObject: () => tmpl });

    const result = await createTemplate({
      type: "quiz",
      targetCount: 3,
      xpReward: 100,
      description: "Complete 3 quizzes",
    });

    expect(result.id).toBe("tmpl-1");
    expect(result.type).toBe("quiz");
    expect(ChallengeTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "quiz", targetCount: 3 }),
    );
  });

  it("throws 400 when required fields are missing", async () => {
    await expect(
      createTemplate({ type: "quiz" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Podaci predloška nisu ispravni.",
    });
  });

  it("throws 400 when targetCount is invalid", async () => {
    await expect(
      createTemplate({
        type: "quiz",
        targetCount: 0,
        xpReward: 100,
        description: "test",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("updateTemplate", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates a template with valid data", async () => {
    const updated = makeTemplate({ xpReward: 200 });
    ChallengeTemplate.findByIdAndUpdate.mockReturnValue(makeLean(updated));

    const result = await updateTemplate({
      templateId: "507f1f77bcf86cd799439011",
      updates: { xpReward: 200 },
    });

    expect(result.xpReward).toBe(200);
  });

  it("throws 400 for invalid templateId", async () => {
    await expect(
      updateTemplate({ templateId: "bad-id", updates: { xpReward: 200 } }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Neispravan identifikator predloška.",
    });
  });

  it("throws 404 when template not found", async () => {
    ChallengeTemplate.findByIdAndUpdate.mockReturnValue(makeLean(null));

    await expect(
      updateTemplate({
        templateId: "507f1f77bcf86cd799439011",
        updates: { xpReward: 200 },
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Predložak izazova nije pronađen.",
    });
  });

  it("throws 400 when no valid fields provided", async () => {
    await expect(
      updateTemplate({
        templateId: "507f1f77bcf86cd799439011",
        updates: { invalidField: "nope" },
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("publishTemplates", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws 400 when effectiveFromWeekStart is missing", async () => {
    await expect(
      publishTemplates({}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 when target week is current or past", async () => {
    const now = new Date();
    await expect(
      publishTemplates({ effectiveFromWeekStart: now.toISOString() }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 when no enabled templates exist", async () => {
    const futureWeek = new Date();
    futureWeek.setUTCDate(futureWeek.getUTCDate() + 14);

    ChallengeTemplate.find.mockReturnValue(makeLean([]));

    await expect(
      publishTemplates({ effectiveFromWeekStart: futureWeek.toISOString() }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("publishes enabled templates for a future week", async () => {
    const futureWeek = new Date();
    futureWeek.setUTCDate(futureWeek.getUTCDate() + 14);

    const templates = [
      makeTemplate({ _id: "t1", type: "quiz" }),
      makeTemplate({ _id: "t2", type: "workout", targetCount: 2, xpReward: 150 }),
    ];

    ChallengeTemplate.find
      .mockReturnValueOnce(makeLean(templates))
      .mockReturnValueOnce(makeLean(templates.map((t) => ({ ...t, version: 2 }))));

    WeeklyChallenge.find.mockReturnValue(makeLean([]));
    WeeklyChallenge.insertMany.mockResolvedValue([]);
    ChallengeTemplate.updateMany.mockResolvedValue({});

    const result = await publishTemplates({
      effectiveFromWeekStart: futureWeek.toISOString(),
    });

    expect(result.published).toHaveLength(2);
    expect(result.weekStart).toBeDefined();
    expect(WeeklyChallenge.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "quiz" }),
        expect.objectContaining({ type: "workout" }),
      ]),
      { ordered: false },
    );
  });

  it("throws 409 when all template types already exist for the week", async () => {
    const futureWeek = new Date();
    futureWeek.setUTCDate(futureWeek.getUTCDate() + 14);

    const templates = [makeTemplate({ _id: "t1", type: "quiz" })];
    ChallengeTemplate.find.mockReturnValueOnce(makeLean(templates));

    WeeklyChallenge.find.mockReturnValue(
      makeLean([{ _id: "existing", type: "quiz", weekStart: futureWeek }]),
    );

    await expect(
      publishTemplates({ effectiveFromWeekStart: futureWeek.toISOString() }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Postoji preklapanje vremenskog raspona za isti tip predloška.",
    });
  });
});
