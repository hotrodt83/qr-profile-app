import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicProfilePageRedirect({ params }: Props) {
  const { slug } = await params;
  const username = decodeURIComponent(slug).toLowerCase().trim();
  redirect(`/u/${encodeURIComponent(username)}`);
}
