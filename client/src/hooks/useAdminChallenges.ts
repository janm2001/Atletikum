import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getChallengeTemplates,
    createChallengeTemplate,
    updateChallengeTemplate,
    publishChallengeTemplates,
} from "@/api/adminChallenges";
import type { UpdateTemplatePayload } from "@/types/Challenge/challenge";
import { keys } from "@/lib/query-keys";
import { invalidateQueryKeys } from "@/lib/query-invalidation";

export type {
    ChallengeTemplate,
    CreateTemplatePayload,
    UpdateTemplatePayload,
    PublishTemplatesData,
} from "@/types/Challenge/challenge";

export const useChallengeTemplates = (params?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: keys.adminChallenges.templates(params),
        queryFn: () => getChallengeTemplates(params),
    });
};

export const useCreateChallengeTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createChallengeTemplate,
        onSuccess: async () => {
            await invalidateQueryKeys(queryClient, [
                { queryKey: keys.adminChallenges.all },
            ]);
        },
    });
};

export const useUpdateChallengeTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            templateId,
            payload,
        }: {
            templateId: string;
            payload: UpdateTemplatePayload;
        }) => updateChallengeTemplate(templateId, payload),
        onSuccess: async () => {
            await invalidateQueryKeys(queryClient, [
                { queryKey: keys.adminChallenges.all },
            ]);
        },
    });
};

export const usePublishChallengeTemplates = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: publishChallengeTemplates,
        onSuccess: async () => {
            await invalidateQueryKeys(queryClient, [
                { queryKey: keys.adminChallenges.all },
                { queryKey: keys.challenges.all },
            ]);
        },
    });
};
