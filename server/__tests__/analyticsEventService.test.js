jest.mock("../models/AnalyticsEvent", () => ({
  AnalyticsEvent: {
    create: jest.fn(),
  },
}));

const { AnalyticsEvent } = require("../models/AnalyticsEvent");
const { createEvent } = require("../services/analyticsEventService");

describe("analyticsEventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an event with userId, event name, and payload", async () => {
    const mockEvent = {
      _id: "event-1",
      userId: "user-1",
      event: "workout_started",
      payload: { workoutId: "w1", source: "fresh" },
      createdAt: new Date("2026-03-19T10:00:00Z"),
    };

    AnalyticsEvent.create.mockResolvedValue(mockEvent);

    const result = await createEvent({
      userId: "user-1",
      event: "workout_started",
      payload: { workoutId: "w1", source: "fresh" },
    });

    expect(result.event).toBe("workout_started");
    expect(result.payload).toEqual({ workoutId: "w1", source: "fresh" });
    expect(result.createdAt).toBeDefined();
    expect(AnalyticsEvent.create).toHaveBeenCalledWith({
      userId: "user-1",
      event: "workout_started",
      payload: { workoutId: "w1", source: "fresh" },
    });
  });

  it("creates an event without payload", async () => {
    const mockEvent = {
      _id: "event-2",
      userId: "user-1",
      event: "workout_completed",
      payload: null,
      createdAt: new Date("2026-03-19T10:00:00Z"),
    };

    AnalyticsEvent.create.mockResolvedValue(mockEvent);

    const result = await createEvent({
      userId: "user-1",
      event: "workout_completed",
    });

    expect(result.event).toBe("workout_completed");
    expect(result.payload).toBeNull();
    expect(AnalyticsEvent.create).toHaveBeenCalledWith({
      userId: "user-1",
      event: "workout_completed",
      payload: null,
    });
  });
});
