import { SignIn } from "@clerk/nextjs";

import { AuthGateLayout } from "@/components/auth/auth-gate-layout";

export default function SignInPage() {
  return (
    <AuthGateLayout>
      <SignIn />
    </AuthGateLayout>
  );
}
