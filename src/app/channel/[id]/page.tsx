import { redirect } from "next/navigation";

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/?channel=${encodeURIComponent(id)}`);
}
