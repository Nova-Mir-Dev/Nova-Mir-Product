"use client";

import { useState, useEffect } from "react";
import { Card, Text, Button } from "azimuth-ui";

export function PrivacyNotice() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("privacy-notice-dismissed");
    if (stored) setDismissed(true);
  }, []);

  function dismiss() {
    localStorage.setItem("privacy-notice-dismissed", "true");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, padding: "1rem" }}>
      <Card style={{ maxWidth: 640, margin: "0 auto" }}>
        <Text element={{ size: "sm" }}>
          We use privacy-first analytics (Plausible) that do not use cookies or collect personal data. No consent is required under GDPR for these privacy-preserving measurements.
        </Text>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="primary" size="sm" onClick={dismiss}>Got it</Button>
        </div>
      </Card>
    </div>
  );
}
