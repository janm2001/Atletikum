import type { QueryClient, QueryKey } from "@tanstack/react-query";

type InvalidationTarget = {
    queryKey: QueryKey;
    exact?: boolean;
};

export const invalidateQueryKeys = async (
    queryClient: QueryClient,
    targets: InvalidationTarget[],
) => {
    await Promise.all(
        targets.map((target) =>
            queryClient.invalidateQueries({
                queryKey: target.queryKey,
                ...(target.exact !== undefined ? { exact: target.exact } : {}),
            }),
        ),
    );
};
