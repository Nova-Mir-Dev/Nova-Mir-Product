"use client";

import { useState } from "react";
import { Button, Card, Text, Stack, Alert } from "azimuth-ui";

type RequestType = "access" | "deletion" | "correction";

export function ComplianceRequestForm() {
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [result, setResult] = useState<{ success?: boolean; error?: string }>({});

  async function submitAccess() {
    const res = await fetch("/api/compliance/data-access");
    const data = await res.json();
    if (data.error) { setResult({ error: data.error }); return; }
    // Download the data as a JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setResult({ success: true });
  }

  async function submitDeletion() {
    if (!confirm("This will permanently delete your account and all associated data. Are you sure?")) return;
    const res = await fetch("/api/compliance/data-deletion", { method: "POST" });
    const data = await res.json();
    if (data.error) { setResult({ error: data.error }); return; }
    setResult({ success: true });
  }

  if (result.success) {
    return (
      <Card>
        <Stack spacing="md">
          <Text weight="semibold">Request Submitted</Text>
          <Text element={{ size: "sm" }} color="secondary">
            {requestType === "access" ? "Your data export has been downloaded." :
             requestType === "deletion" ? "Your data deletion request has been processed. You will be logged out shortly." :
             "Your correction request has been submitted."}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <Stack spacing="md">
        <Text weight="semibold">Privacy Rights Request</Text>
        <Text element={{ size: "sm" }} color="secondary">
          Depending on your jurisdiction, you may have the right to access, delete, or correct your personal data.
          All requests are verified against your authenticated account.
        </Text>

        {result.error && <Alert variant="alert">{result.error}</Alert>}

        <Button variant="primary" fullWidth onClick={() => { setRequestType("access"); submitAccess(); }}>
          Download My Data
        </Button>
        <Button variant="secondary" fullWidth onClick={() => { setRequestType("deletion"); submitDeletion(); }}>
          Delete My Data
        </Button>
      </Stack>
    </Card>
  );
}
