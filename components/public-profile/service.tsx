import { Video, RotateCcw } from "lucide-react";
import type { ServiceOption, ApiService } from "@/types/doctor-profile";
import { FALLBACK_SERVICE_LIST } from "@/constants/doctor-profile";

/**
 * Converts raw API services into the `ServiceOption` shape used by the UI.
 * If the API returns nothing, the hard-coded fallback list is returned instead.
 */
export function buildServiceList(apiServices: ApiService[]): ServiceOption[] {
  if (!apiServices || apiServices.length === 0) {
    return FALLBACK_SERVICE_LIST.map((s) => ({
      ...s,
      icon:
        s.type === "followup" ? (
          <RotateCcw className="size-5" />
        ) : (
          <Video className="size-5" />
        ),
    }));
  }

  return apiServices
    .filter((s) => s.enabled)
    .map((s) => ({
      id: s.id,
      type: s.type,
      name: s.name,
      icon:
        s.type === "followup" ? (
          <RotateCcw className="size-5" />
        ) : (
          <Video className="size-5" />
        ),
      price: s.price ?? s.fee ?? 0,
      enabled: s.enabled,
      description: s.description ?? "",
    }));
}
