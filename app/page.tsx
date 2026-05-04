import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthPage from "@/components/auth/AuthPage";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) redirect("/feed");

  return <AuthPage />;
}
