import { Client } from "@axiomhq/axiom-node";

function getEnvOrUndefined(name: string): string | undefined {
  return process.env[name];
}

let _axiom: Client | null = null

function getAxiom(): Client {
  if (!_axiom) {
    _axiom = new Client({
      token: getEnvOrUndefined("AXIOM_API_TOKEN") || "",
    });
  }
  return _axiom;
}

export const axiomLogger = {
  info: (message: string, fields?: Record<string, unknown>) => {
    getAxiom().ingestEvents(process.env.NEXT_PUBLIC_AXIOM_DATASET || "default", [{ level: "info", message, ...fields }]);
  },
  warn: (message: string, fields?: Record<string, unknown>) => {
    getAxiom().ingestEvents(process.env.NEXT_PUBLIC_AXIOM_DATASET || "default", [{ level: "warn", message, ...fields }]);
  },
  error: (message: string, fields?: Record<string, unknown>) => {
    getAxiom().ingestEvents(process.env.NEXT_PUBLIC_AXIOM_DATASET || "default", [{ level: "error", message, ...fields }]);
  },
};
