import type {
    ChallengeTemplate,
    ChallengeTemplateListResponse,
    ChallengeTemplateResponse,
    CreateTemplatePayload,
    UpdateTemplatePayload,
    PublishTemplatesPayload,
    PublishTemplatesData,
    PublishTemplatesResponse,
} from "@/types/Challenge/challenge";
import { apiClient } from "@/utils/apiService";

export async function getChallengeTemplates(params?: {
    enabled?: boolean;
}): Promise<ChallengeTemplate[]> {
    const { data } = await apiClient.get<ChallengeTemplateListResponse>(
        "/admin/challenges/templates",
        { params },
    );
    return data.data.templates;
}

export async function createChallengeTemplate(
    payload: CreateTemplatePayload,
): Promise<ChallengeTemplate> {
    const { data } = await apiClient.post<ChallengeTemplateResponse>(
        "/admin/challenges/templates",
        payload,
    );
    return data.data.template;
}

export async function updateChallengeTemplate(
    templateId: string,
    payload: UpdateTemplatePayload,
): Promise<ChallengeTemplate> {
    const { data } = await apiClient.patch<ChallengeTemplateResponse>(
        `/admin/challenges/templates/${templateId}`,
        payload,
    );
    return data.data.template;
}

export async function publishChallengeTemplates(
    payload: PublishTemplatesPayload,
): Promise<PublishTemplatesData> {
    const { data } = await apiClient.post<PublishTemplatesResponse>(
        "/admin/challenges/templates/publish",
        payload,
    );
    return data.data;
}
