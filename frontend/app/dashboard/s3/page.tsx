import { createClient } from "@/libs/supabase/server";
import { S3Integration } from "@/components/s3/S3Integration";

export const dynamic = "force-dynamic";

export default async function S3Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return <S3Integration />;
}
