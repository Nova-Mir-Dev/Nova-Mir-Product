"use client";

import { Container, Text, Stack } from "azimuth-ui";
import { APP_CONFIG, NAV_PAGES } from "@/lib/navigation";

export default function Home() {
  return (
    <Container style={{ padding: "3rem 2rem", maxWidth: 640, margin: "0 auto" }}>
      <Stack spacing="lg">
        <div style={{ textAlign: "center", paddingTop: "3rem" }}>
          <Text element={{ as: "h1", size: "h1" }} weight="bold">
            {APP_CONFIG.title}
          </Text>
        </div>

        {NAV_PAGES.length > 0 && (
          <Stack spacing="sm">
            <Text weight="semibold">Application Pages</Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NAV_PAGES.map((page) => (
                <a key={page.path} href={page.path} style={{
                  display: "block", padding: "0.75rem 1rem",
                  borderRadius: "var(--azimuth-radius)",
                  border: "1px solid var(--azimuth-color-border)",
                  background: "var(--azimuth-color-surface)",
                  textDecoration: "none", color: "var(--azimuth-color-text)",
                  transition: "border-color 150ms ease",
                }}>
                  <Text weight="semibold">{page.label}</Text>
                  <Text element={{ size: "xs" }} color="muted" style={{ fontFamily: "monospace" }}>{page.path}</Text>
                </a>
              ))}
            </div>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}