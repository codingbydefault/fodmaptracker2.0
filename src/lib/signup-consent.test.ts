import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock("@/lib/image-processing", () => ({ optimizeUploadedImage: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/data", () => ({ requireUser: vi.fn() }));

import { createClient } from "@/lib/supabase/server";
import { signUp } from "@/lib/actions";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";

function signupForm(consent: boolean) {
  const form = new FormData();
  form.set("email", "sam@example.com");
  form.set("password", "lang-wachtwoord");
  form.set("preferred_language", "nl");
  if (consent) form.set("health_consent", "yes");
  return form;
}

async function redirectsTo(run: () => Promise<unknown>, url: string) {
  await expect(run()).rejects.toThrow(`REDIRECT:${url}`);
}

describe("signUp health-data consent", () => {
  const signUpAuth = vi.fn(async () => ({ error: null }));
  const registrationCapacity = vi.fn(async () => ({ data: true, error: null }));

  beforeEach(() => {
    signUpAuth.mockClear();
    registrationCapacity.mockClear();
    vi.mocked(createClient).mockReset();
    vi.mocked(createClient).mockResolvedValue({ auth: { signUp: signUpAuth }, rpc: registrationCapacity } as never);
  });

  it("does not create an account when the consent box is unticked", async () => {
    await redirectsTo(() => signUp(signupForm(false)), "/registreren?error=toestemming");
    expect(createClient).not.toHaveBeenCalled();
    expect(signUpAuth).not.toHaveBeenCalled();
  });

  it("sends an explicit consent flag and the notice version with the new account", async () => {
    await redirectsTo(() => signUp(signupForm(true)), "/login?message=controleer-email");
    expect(signUpAuth).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({
        data: expect.objectContaining({
          health_data_consent: "true",
          privacy_notice_version: PRIVACY_NOTICE_VERSION,
          preferred_language: "nl",
        }),
      }),
    }));
  });

  it("does not create an account when the test phase is full", async () => {
    registrationCapacity.mockResolvedValueOnce({ data: false, error: null });
    await redirectsTo(() => signUp(signupForm(true)), "/registreren?error=vol");
    expect(signUpAuth).not.toHaveBeenCalled();
  });
});
