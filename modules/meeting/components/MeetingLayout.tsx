import VideoSection from "./VideoSection";
import ControlsBar from "./ControlsBar";
import AdmitPanel from "./AdmitPanel";

export default function MeetingLayout({
  role,
}: {
  role: "doctor" | "patient";
}) {
  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 relative overflow-hidden">
        <VideoSection />
        {role === "doctor" && <AdmitPanel />}
      </div>
      <ControlsBar role={role} />
    </div>
  );
}