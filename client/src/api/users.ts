import type { User } from "@/types/User/user";
import { apiClient } from "@/utils/apiService";

interface GetMeResponse {
    status: string;
    data: { user: User };
}

export async function getMe(): Promise<User> {
    const { data } = await apiClient.get<GetMeResponse>("/users/me");
    return data.data.user;
}
