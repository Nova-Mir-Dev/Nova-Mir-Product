import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

function renderInternalToolLayout(): string {
  return `import { redirect } from "next/navigation";
import Link from "next/link";
import { Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Data", path: "/dashboard/data" },
    { label: "Audit", path: "/dashboard/audit" },
    { label: "Users", path: "/dashboard/users" },
    { label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, borderRight: "1px solid var(--azimuth-color-border)" }}>
        <Stack spacing="sm" style={{ padding: "var(--azimuth-spacing-md)" }}>
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Internal Tool
          </Text>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              style={{ textDecoration: "none", display: "block" }}
            >
              <Text>{item.label}</Text>
            </Link>
          ))}
        </Stack>
      </nav>
      <main style={{ flex: 1, padding: "var(--azimuth-spacing-lg)" }}>
        {children}
      </main>
    </div>
  );
}
`
}

function renderInternalToolDataPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface Record {
  id: number;
  title: string;
  description: string | null;
  data: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string; page?: string; create?: string; edit?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: records } = await supabase
    .from("records")
    .select("*")
    .order(params.sort || "created_at", { ascending: (params.dir || "desc") === "asc" });

  let raw = (records ?? []) as Record[];

  const search = params.q?.toLowerCase() || "";
  if (search) {
    raw = raw.filter(
      (r) =>
        r.title?.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search),
    );
  }

  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 10;
  const totalPages = Math.ceil(raw.length / pageSize);
  const paged = raw.slice((page - 1) * pageSize, page * pageSize);

  async function createRecord(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title?.trim()) throw new Error("Title is required");

    const { error } = await supabase.from("records").insert({
      title: title.trim(),
      description: description?.trim() || null,
      created_by: user.id,
    });

    if (error) throw new Error("Failed to create record");
    revalidatePath("/dashboard/data");
  }

  async function updateRecord(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!id || !title?.trim()) throw new Error("Title is required");

    const { error } = await supabase
      .from("records")
      .update({ title: title.trim(), description: description?.trim() || null })
      .eq("id", parseInt(id, 10));

    if (error) throw new Error("Failed to update record");
    revalidatePath("/dashboard/data");
  }

  async function deleteRecord(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    if (!id) throw new Error("Record ID is required");

    const { error } = await supabase.from("records").delete().eq("id", parseInt(id, 10));

    if (error) throw new Error("Failed to delete record");
    revalidatePath("/dashboard/data");
  }

  const editId = params.edit ? parseInt(params.edit, 10) : null;
  const editRecord = editId ? raw.find((r) => r.id === editId) : null;

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Data Browser
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
        <Input
          label={{ text: "Search" }}
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search records..."
        />
        <Button variant="primary" type="submit">Search</Button>
        {params.q && (
          <a href="/dashboard/data">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
        <a href="/dashboard/data?create=true">
          <Button variant="primary" type="button">Add Record</Button>
        </a>
      </form>

      {params.create === "true" && !editRecord && (
        <Card>
          <form action={createRecord}>
            <Stack spacing="sm">
              <Input label={{ text: "Title" }} name="title" required />
              <Input label={{ text: "Description" }} name="description" />
              <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                <Button variant="primary" type="submit">Create</Button>
                <a href="/dashboard/data">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      {editRecord && (
        <Card>
          <form action={updateRecord}>
            <Stack spacing="sm">
              <input type="hidden" name="id" value={editRecord.id} />
              <Input label={{ text: "Title" }} name="title" defaultValue={editRecord.title} required />
              <Input label={{ text: "Description" }} name="description" defaultValue={editRecord.description || ""} />
              <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                <Button variant="primary" type="submit">Update</Button>
                <a href="/dashboard/data">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", alignItems: "center" }}>
        <Text element={{ size: "sm" }}>Sort by:</Text>
        <a href={"/dashboard/data?sort=title&dir=asc" + (params.q ? "&q=" + params.q : "")}>
          <Button variant="ghost" type="button">Title</Button>
        </a>
        <a href={"/dashboard/data?sort=created_at&dir=desc" + (params.q ? "&q=" + params.q : "")}>
          <Button variant="ghost" type="button">Newest</Button>
        </a>
        <a href={"/dashboard/data?sort=updated_at&dir=desc" + (params.q ? "&q=" + params.q : "")}>
          <Button variant="ghost" type="button">Updated</Button>
        </a>
      </div>

      {paged.length === 0 ? (
        <Text>No records found.</Text>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((record) => (
                <tr key={record.id}>
                  <td>{record.title}</td>
                  <td>{record.description || "—"}</td>
                  <td>{new Date(record.created_at).toLocaleDateString()}</td>
                  <td>{new Date(record.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "var(--azimuth-spacing-xs)" }}>
                      <a href={"/dashboard/data?edit=" + record.id}>
                        <Button variant="ghost" type="button">Edit</Button>
                      </a>
                      <form action={deleteRecord} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={record.id} />
                        <Button variant="ghost" type="submit">Delete</Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", alignItems: "center" }}>
              <Text element={{ size: "sm" }}>Page {page} of {totalPages}</Text>
              {page > 1 && (
                <a href={"/dashboard/data?page=" + (page - 1) + (params.q ? "&q=" + params.q : "") + (params.sort ? "&sort=" + params.sort : "")}>
                  <Button variant="ghost" type="button">Previous</Button>
                </a>
              )}
              {page < totalPages && (
                <a href={"/dashboard/data?page=" + (page + 1) + (params.q ? "&q=" + params.q : "") + (params.sort ? "&sort=" + params.sort : "")}>
                  <Button variant="ghost" type="button">Next</Button>
                </a>
              )}
            </div>
          )}
        </>
      )}
    </Stack>
  );
}
`
}

function renderInternalToolAuditPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  entity_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; user?: string; from?: string; to?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase.from("audit_logs").select("*").order("timestamp", { ascending: false });

  if (params.from) query = query.gte("timestamp", params.from);
  if (params.to) query = query.lte("timestamp", params.to);

  const { data: entries } = await query;

  let filtered = (entries ?? []) as AuditEntry[];

  const actionFilter = params.action?.toLowerCase();
  if (actionFilter) {
    filtered = filtered.filter((e) => e.action?.toLowerCase().includes(actionFilter));
  }

  const userFilter = params.user?.toLowerCase();
  if (userFilter) {
    filtered = filtered.filter((e) => e.user_id?.toLowerCase().includes(userFilter));
  }

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Audit Log
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", flexWrap: "wrap" }}>
        <Input
          label={{ text: "Action" }}
          name="action"
          defaultValue={params.action || ""}
          placeholder="Filter by action..."
        />
        <Input
          label={{ text: "User" }}
          name="user"
          defaultValue={params.user || ""}
          placeholder="Filter by user ID..."
        />
        <Input
          label={{ text: "From" }}
          name="from"
          defaultValue={params.from || ""}
          type="date"
        />
        <Input
          label={{ text: "To" }}
          name="to"
          defaultValue={params.to || ""}
          type="date"
        />
        <Button variant="primary" type="submit">Filter</Button>
        {(params.action || params.user || params.from || params.to) && (
          <a href="/dashboard/audit">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
      </form>

      {filtered.length === 0 ? (
        <Text>No audit entries found.</Text>
      ) : (
        <Stack spacing="sm">
          {filtered.map((entry) => (
            <Card key={entry.id}>
              <Stack spacing="xs">
                <Text element={{ size: "sm" }} weight="semibold">
                  {entry.action}
                </Text>
                <Text element={{ size: "sm" }}>
                  Entity: {entry.entity}{entry.entity_id ? " (#" + entry.entity_id + ")" : ""}
                </Text>
                <Text element={{ size: "sm" }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                {entry.ip_address && (
                  <Text element={{ size: "sm" }}>IP: {entry.ip_address}</Text>
                )}
                {entry.metadata && (
                  <Text element={{ size: "sm" }}>
                    Details: {JSON.stringify(entry.metadata)}
                  </Text>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

function renderInternalToolFilesPage(): string {
  return `import { Button, Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface FileRecord {
  id: string;
  name: string;
  file_url: string;
  uploaded_at: string;
  file_type: string;
  file_size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  async function uploadFile(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file selected");

    const fileName = user.id + "/" + Date.now() + "_" + file.name;
    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("files").insert({
      name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
    });

    if (dbError) throw new Error(dbError.message);
    revalidatePath("/dashboard/files");
  }

  async function deleteFile(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const fileUrl = formData.get("file_url") as string;
    if (!id) throw new Error("File ID is required");

    const storagePath = fileUrl ? decodeURIComponent(fileUrl.split("/").pop() || "") : "";
    if (storagePath) {
      await supabase.storage.from("files").remove([storagePath]);
    }

    const { error } = await supabase.from("files").delete().eq("id", id);
    if (error) throw new Error("Failed to delete file");
    revalidatePath("/dashboard/files");
  }

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .order("uploaded_at", { ascending: false });

  const raw = (files ?? []) as FileRecord[];
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <Stack spacing="md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text element={{ as: "h1", size: "h3" }} weight="semibold">
          File Storage
        </Text>
        <form action={uploadFile} style={{ display: "flex", gap: "var(--azimuth-spacing-sm)", alignItems: "center" }}>
          <input type="file" name="file" required />
          <Button variant="primary" type="submit">Upload</Button>
        </form>
      </div>

      {error && (
        <Card>
          <Text element={{ size: "sm" }} color="error">{error}</Text>
        </Card>
      )}

      {raw.length === 0 ? (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-spacing-lg)" }}>
            <Text color="secondary">No files uploaded yet.</Text>
            <Text element={{ size: "sm" }} color="secondary">
              Use the upload button above to add files.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack spacing="sm">
          {raw.map((file) => (
            <Card key={file.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Stack spacing="xs">
                  <Text weight="semibold">{file.name}</Text>
                  <Text element={{ size: "sm" }} color="secondary">
                    {formatFileSize(file.file_size)} — {new Date(file.uploaded_at).toLocaleDateString()}
                  </Text>
                </Stack>
                <div style={{ display: "flex", gap: "var(--azimuth-spacing-sm)" }}>
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" type="button">Download</Button>
                  </a>
                  <form action={deleteFile} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={file.id} />
                    <input type="hidden" name="file_url" value={file.file_url} />
                    <Button variant="ghost" type="submit">Delete</Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
`
}

function renderInternalToolDataApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");

  if (!table) return NextResponse.json({ error: "Table name is required" }, { status: 400 });

  const allowedTables = ["records", "audit_logs", "files", "users"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  if (id) {
    const { data: row, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  const sortField = searchParams.get("sort") || "created_at";
  const sortDir = searchParams.get("dir") === "asc" ? "asc" : "desc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10) || 50));

  const { data: rows, error: fetchError } = await supabase
    .from(table)
    .select("*")
    .order(sortField, { ascending: sortDir === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (fetchError) return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });

  return NextResponse.json(rows ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  if (!table) return NextResponse.json({ error: "Table name is required" }, { status: 400 });

  const allowedTables = ["records", "files"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Table does not support create" }, { status: 400 });
  }

  const body = await request.json();

  const { data: row, error: createError } = await supabase
    .from(table)
    .insert(body)
    .select()
    .single();

  if (createError) return NextResponse.json({ error: "Failed to create record" }, { status: 500 });

  return NextResponse.json(row, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");

  if (!table || !id) {
    return NextResponse.json({ error: "Table name and id are required" }, { status: 400 });
  }

  const allowedTables = ["records", "files"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Table does not support update" }, { status: 400 });
  }

  const body = await request.json();

  const { data: row, error: updateError } = await supabase
    .from(table)
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: "Failed to update record" }, { status: 500 });

  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");

  if (!table || !id) {
    return NextResponse.json({ error: "Table name and id are required" }, { status: 400 });
  }

  const allowedTables = ["records", "files"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Table does not support delete" }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from(table).delete().eq("id", id);

  if (deleteError) return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });

  return NextResponse.json({ success: true });
}
`
}

export function generateInternalToolFiles(config: BootConfig): GeneratedFile[] {
  if (config.preset !== 'internal-tool') return []

  return [
    {
      path: 'src/app/dashboard/layout.tsx',
      content: renderInternalToolLayout(),
    },
    {
      path: 'src/app/dashboard/data/page.tsx',
      content: renderInternalToolDataPage(),
    },
    {
      path: 'src/app/dashboard/audit/page.tsx',
      content: renderInternalToolAuditPage(),
    },
    {
      path: 'src/app/dashboard/files/page.tsx',
      content: renderInternalToolFilesPage(),
    },
    {
      path: 'src/app/api/data/route.ts',
      content: renderInternalToolDataApi(),
    },
  ]
}
