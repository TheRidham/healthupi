import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function WaitingScreen({ title }: { title: string }) {
  return (
    <div className="h-screen flex items-center justify-center bg-muted">
      <Card className="p-10 text-center space-y-4">
        <Loader2 className="animate-spin mx-auto" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Please stay on this page.
        </p>
      </Card>
    </div>
  );
}