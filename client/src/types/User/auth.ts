import type { ForgotPasswordInput } from "@/schema/forgotPassword.schema";
import type { RegisterInput } from "@/schema/register.schema";
import type { ResetPasswordInput } from "@/schema/resetPassword.schema";
import type { User } from "@/types/User/user";

export type AuthPayload = {
  user: User;
};

export type AuthResponse = {
  status: string;
  token: string;
  data: AuthPayload;
  message?: string;
};

export type RegisterPayload = Omit<RegisterInput, "passwordConfirm">;

export type PasswordResetRequestPayload = ForgotPasswordInput;

export type ResetPasswordPayload = Omit<ResetPasswordInput, "passwordConfirm">;

export type StatusResponse = {
  status: string;
  message: string;
};

export type PasswordResetRequestResponse = StatusResponse & {
  resetUrl?: string;
};
