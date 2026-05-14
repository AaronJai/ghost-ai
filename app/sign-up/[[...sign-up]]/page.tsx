import { SignUp } from "@clerk/nextjs";

import { AuthGateLayout } from "@/components/auth/auth-gate-layout";

export default function SignUpPage() {
  return (
    <AuthGateLayout>
      <SignUp />
    </AuthGateLayout>
  );
}
