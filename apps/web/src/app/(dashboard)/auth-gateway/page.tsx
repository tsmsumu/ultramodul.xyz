import { useTranslations } from "next-intl";
import AuthGatewayClient from "./client";

export const metadata = {
  title: "Auth & MFA Gateway Matrix | PUM Enterprise",
  description: "Global configuration for SSO, Electronic Signature, and Messaging Channels.",
};

export default function AuthGatewayPage() {
  return (
    <div className="space-y-6">
      <AuthGatewayClient />
    </div>
  );
}
