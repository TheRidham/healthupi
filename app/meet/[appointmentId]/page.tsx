import { redirect } from "next/navigation";
import MeetingLoader from "./meeting-loader";

export default async function Page({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  return <MeetingLoader appointmentId={appointmentId} />;
}