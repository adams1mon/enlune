"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function Booker() {
  useEffect(() => {
    (async function initializeCal() {
      const cal = await getCalApi({ "namespace": "30min" });
      cal("ui", {
        "cssVarsPerTheme": {
          "light": {
            "cal-brand": "#6357e8",
            "cal-brand-emphasis": "#5548dc",
            "cal-brand-text": "#ffffff",
          },
          "dark": {
            "cal-brand": "#6357e8",
            "cal-brand-emphasis": "#7c72ef",
            "cal-brand-text": "#ffffff",
          },
        },
        "hideEventTypeDetails": true,
        "layout": "month_view",
      });
    })();
  }, []);

  return (
    <Cal
      namespace="30min"
      calLink="adam-simon-dmvxgy/30min"
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      config={{ "layout": "month_view", "useSlotsViewOnSmallScreen": "true" }}
    />
  );
}
