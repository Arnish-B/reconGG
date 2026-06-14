import { notFound } from "next/navigation";
import { MatchView } from "@/components/features/match/MatchView";
import { getMatchById } from "@/lib/data";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) notFound();
  return <MatchView m={match} />;
}
