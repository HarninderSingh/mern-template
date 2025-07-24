import { ResetPasswordForm } from "@/components/auth-forms"

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string }
}) {
  return <ResetPasswordForm token={params.token} />
}
