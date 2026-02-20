import { NextResponse } from "next/server";
import { createServerClient, createServerClientWithAuth } from "@/lib/supabase/server";

const AVATAR_BUCKET = "avatars";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAuth = createServerClient();
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("avatar") ?? formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided. Use form field 'avatar' or 'file'." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image (e.g. JPG, PNG)." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const supabase = createServerClientWithAuth(token);
  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    const msg = String(uploadError.message ?? "Upload failed");
    if (msg.includes("Bucket") || msg.includes("bucket") || msg.includes("not found")) {
      return NextResponse.json(
        { error: "Storage bucket missing. In Supabase Dashboard go to Storage → New bucket → name it 'avatars' → set to Public." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const url = urlData?.publicUrl ?? "";
  return NextResponse.json({ url });
}
