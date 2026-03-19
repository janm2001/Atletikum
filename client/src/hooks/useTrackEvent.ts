import { useCallback } from "react";
import { API_BASE_URL, apiClient } from "@/utils/apiService";

type TrackEventPayload = Record<string, unknown>;

export const useTrackEvent = () => {
  const trackEvent = useCallback(
    (event: string, payload?: TrackEventPayload) => {
      apiClient
        .post("/analytics-events", { event, payload: payload ?? null })
        .catch(() => {});
    },
    [],
  );

  return trackEvent;
};

export const sendAbandonedEvent = (payload: TrackEventPayload): void => {
  try {
    navigator.sendBeacon(
      `${API_BASE_URL}/analytics-events/abandoned`,
      new Blob(
        [JSON.stringify({ event: "workout_abandoned", payload })],
        { type: "application/json" },
      ),
    );
  } catch {
    // Best-effort — ignore failures
  }
};
