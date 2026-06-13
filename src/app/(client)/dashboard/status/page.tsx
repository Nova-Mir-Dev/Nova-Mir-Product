import { Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
  resolved_at: string | null;
}

const SERVICES = [
  { name: "Website", status: "operational" as const },
  { name: "Client Portal", status: "operational" as const },
  { name: "API", status: "operational" as const },
  { name: "File Uploads", status: "operational" as const },
  { name: "Email", status: "operational" as const },
  { name: "Billing", status: "operational" as const },
];

export default async function StatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: incidents } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity", "incident")
    .order("timestamp", { ascending: false })
    .limit(20);

  const rawIncidents = (incidents ?? []) as unknown as Incident[];

  return (
    <Stack spacing="lg">
      <Stack spacing="xs">
        <Text element={{ as: "h1", size: "h3" }} weight="semibold">Site Status</Text>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: "var(--azimuth-color-success, #166534)",
            display: "inline-block",
          }} />
          <Text element={{ size: "sm" }} color="secondary">
            All systems operational — Last checked: {new Date().toLocaleString()}
          </Text>
        </div>
      </Stack>

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">Services</Text>
          {SERVICES.map((service) => (
            <div key={service.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--azimuth-color-border)" }}>
              <Text>{service.name}</Text>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 600,
                color: service.status === "operational" ? "var(--azimuth-color-success, #166534)" : "var(--azimuth-color-danger, #991b1b)",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  backgroundColor: service.status === "operational" ? "var(--azimuth-color-success, #166534)" : "var(--azimuth-color-danger, #991b1b)",
                  display: "inline-block",
                }} />
                {service.status}
              </span>
            </div>
          ))}
        </Stack>
      </Card>

      <Stack spacing="sm">
        <Text element={{ as: "h2", size: "h5" }} weight="semibold">Planned Maintenance</Text>
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-md)" }}>
            <Text color="secondary">No maintenance scheduled</Text>
            <Text element={{ size: "sm" }} color="secondary">We'll notify you of any upcoming maintenance windows.</Text>
          </Stack>
        </Card>
      </Stack>

      <Stack spacing="sm">
        <Text element={{ as: "h2", size: "h5" }} weight="semibold">Incident History</Text>
        {rawIncidents.length === 0 ? (
          <Card>
            <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
              <Text color="secondary">No recent incidents</Text>
              <Text element={{ size: "sm" }} color="secondary">All services have been running smoothly.</Text>
            </Stack>
          </Card>
        ) : (
          <Stack spacing="xs">
            {rawIncidents.map((incident) => (
              <Card key={incident.id}>
                <Stack spacing="xs">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text weight="semibold">{incident.title}</Text>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: incident.severity === "critical" ? "var(--azimuth-color-danger-bg, #fde8e8)" : "var(--azimuth-color-warning-bg, #fff4e5)",
                      color: incident.severity === "critical" ? "var(--azimuth-color-danger, #991b1b)" : "var(--azimuth-color-warning, #9a5b00)",
                    }}>
                      {incident.severity}
                    </span>
                  </div>
                  <Text element={{ size: "sm" }} color="secondary">
                    {new Date(incident.created_at).toLocaleDateString()} {incident.resolved_at ? `— Resolved ${new Date(incident.resolved_at).toLocaleDateString()}` : ""}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
