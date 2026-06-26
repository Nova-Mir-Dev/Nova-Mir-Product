import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

function renderStorefrontDashboardLayout(): string {
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
    { label: "Products", path: "/dashboard/products" },
    { label: "Orders", path: "/dashboard/orders" },
    { label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, borderRight: "1px solid var(--azimuth-color-border)" }}>
        <Stack spacing="sm" style={{ padding: "var(--azimuth-space-md)" }}>
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">
            Storefront
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
      <main style={{ flex: 1, padding: "var(--azimuth-space-lg)" }}>
        {children}
      </main>
    </div>
  );
}
`
}

function renderStorefrontProductsPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  category: string | null;
  image_url: string | null;
  inventory_count: number;
  is_active: boolean;
  created_at: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; create?: string; edit?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  let raw = (products ?? []) as Product[];

  const search = params.q?.toLowerCase() || "";
  if (search) {
    raw = raw.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search),
    );
  }

  const categoryFilter = params.category?.toLowerCase() || "";
  if (categoryFilter) {
    raw = raw.filter((p) => p.category?.toLowerCase() === categoryFilter);
  }

  const categories = [...new Set((products ?? []).map((p: Product) => p.category).filter(Boolean))] as string[];

  async function createProduct(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const imageUrl = formData.get("image_url") as string;
    const inventory = formData.get("inventory") as string;

    if (!name?.trim() || !price) throw new Error("Name and price are required");
    const priceCents = Math.round(parseFloat(price) * 100);
    if (priceCents <= 0) throw new Error("Price must be greater than 0");

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      description: description?.trim() || null,
      price_cents: priceCents,
      category: category?.trim() || null,
      image_url: imageUrl?.trim() || null,
      inventory_count: parseInt(inventory || "0", 10) || 0,
    });

    if (error) throw new Error("Failed to create product");
    revalidatePath("/dashboard/products");
  }

  async function updateProduct(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const imageUrl = formData.get("image_url") as string;
    const inventory = formData.get("inventory") as string;

    if (!id || !name?.trim() || !price) throw new Error("Name and price are required");
    const priceCents = Math.round(parseFloat(price) * 100);
    if (priceCents <= 0) throw new Error("Price must be greater than 0");

    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        price_cents: priceCents,
        category: category?.trim() || null,
        image_url: imageUrl?.trim() || null,
        inventory_count: parseInt(inventory || "0", 10) || 0,
      })
      .eq("id", parseInt(id, 10));

    if (error) throw new Error("Failed to update product");
    revalidatePath("/dashboard/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    if (!id) throw new Error("Product ID is required");

    const { error } = await supabase.from("products").delete().eq("id", parseInt(id, 10));
    if (error) throw new Error("Failed to delete product");
    revalidatePath("/dashboard/products");
  }

  async function toggleActive(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const active = formData.get("active") === "true";
    if (!id) throw new Error("Product ID is required");

    const { error } = await supabase
      .from("products")
      .update({ is_active: active })
      .eq("id", parseInt(id, 10));

    if (error) throw new Error("Failed to update product status");
    revalidatePath("/dashboard/products");
  }

  const editId = params.edit ? parseInt(params.edit, 10) : null;
  const editProduct = editId ? raw.find((p) => p.id === editId) : null;

  return (
    <Stack spacing="md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text element={{ as: "h1", size: "h3" }} weight="semibold">
          Products
        </Text>
        <a href="/dashboard/products?create=true">
          <Button variant="primary" type="button">Add Product</Button>
        </a>
      </div>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-space-sm)", flexWrap: "wrap" }}>
        <Input
          label={{ text: "Search" }}
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search products..."
        />
        <select
          name="category"
          defaultValue={params.category || ""}
          style={{
            padding: "var(--azimuth-space-sm)",
            border: "1px solid var(--azimuth-color-border)",
            borderRadius: "var(--azimuth-radius-md)",
            fontFamily: "inherit",
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <Button variant="primary" type="submit">Filter</Button>
        {(params.q || params.category) && (
          <a href="/dashboard/products">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
      </form>

      {(params.create === "true" || editProduct) && (
        <Card>
          <form action={editProduct ? updateProduct : createProduct}>
            <Stack spacing="sm">
              <Text weight="semibold">{editProduct ? "Edit Product" : "Add Product"}</Text>
              {editProduct && <input type="hidden" name="id" value={editProduct.id} />}
              <Input label={{ text: "Name" }} name="name" defaultValue={editProduct?.name || ""} required />
              <Input label={{ text: "Description" }} name="description" defaultValue={editProduct?.description || ""} />
              <Input label={{ text: "Price ($)" }} name="price" type="number" step="0.01" defaultValue={editProduct ? (editProduct.price_cents / 100).toFixed(2) : ""} required />
              <Input label={{ text: "Category" }} name="category" defaultValue={editProduct?.category || ""} />
              <Input label={{ text: "Image URL" }} name="image_url" defaultValue={editProduct?.image_url || ""} />
              <Input label={{ text: "Inventory Count" }} name="inventory" type="number" defaultValue={editProduct?.inventory_count.toString() || "0"} />
              <div style={{ display: "flex", gap: "var(--azimuth-space-sm)" }}>
                <Button variant="primary" type="submit">{editProduct ? "Update" : "Create"}</Button>
                <a href="/dashboard/products">
                  <Button variant="ghost" type="button">Cancel</Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      {raw.length === 0 ? (
        <Text>No products found.</Text>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Inventory</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {raw.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>\${(product.price_cents / 100).toFixed(2)}</td>
                <td>{product.category || "—"}</td>
                <td>{product.inventory_count}</td>
                <td>{product.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <div style={{ display: "flex", gap: "var(--azimuth-space-xs)" }}>
                    <a href={"/dashboard/products?edit=" + product.id}>
                      <Button variant="ghost" type="button">Edit</Button>
                    </a>
                    <form action={toggleActive} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="active" value={String(!product.is_active)} />
                      <Button variant="ghost" type="submit">
                        {product.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                    <form action={deleteProduct} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button variant="ghost" type="submit">Delete</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Stack>
  );
}
`
}

function renderStorefrontOrdersPage(): string {
  return `import { Button, Card, Input, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface Order {
  id: number;
  user_id: string | null;
  status: string;
  total_cents: number;
  stripe_payment_intent_id: string | null;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_cents: number;
  products: { name: string } | null;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string; q?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  async function updateStatus(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    if (!id || !status) throw new Error("Order ID and status are required");

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", parseInt(id, 10));

    if (error) throw new Error("Failed to update order status");
    redirect("/dashboard/orders");
  }

  const detailId = params.id ? parseInt(params.id, 10) : null;

  if (detailId) {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", detailId)
      .single();

    const { data: items } = await supabase
      .from("order_items")
      .select("*, products(name)")
      .eq("order_id", detailId);

    const orderData = order as Order | null;
    const orderItems = (items ?? []) as OrderItem[];

    if (!orderData) {
      return (
        <Stack spacing="md">
          <Text>Order not found.</Text>
          <a href="/dashboard/orders"><Button variant="ghost" type="button">Back to Orders</Button></a>
        </Stack>
      );
    }

    return (
      <Stack spacing="md">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text element={{ as: "h1", size: "h3" }} weight="semibold">
            Order #{orderData.id}
          </Text>
          <a href="/dashboard/orders"><Button variant="ghost" type="button">Back to Orders</Button></a>
        </div>

        <Card>
          <Stack spacing="xs">
            <Text weight="semibold">Order Details</Text>
            <Text element={{ size: "sm" }}>Status: {orderData.status}</Text>
            <Text element={{ size: "sm" }}>Total: \${(orderData.total_cents / 100).toFixed(2)}</Text>
            <Text element={{ size: "sm" }}>Date: {new Date(orderData.created_at).toLocaleString()}</Text>
            {orderData.stripe_payment_intent_id && (
              <Text element={{ size: "sm" }}>Stripe Payment: {orderData.stripe_payment_intent_id}</Text>
            )}
            {orderData.shipping_address && (
              <Text element={{ size: "sm" }}>Shipping: {JSON.stringify(orderData.shipping_address)}</Text>
            )}
          </Stack>
        </Card>

        <form action={updateStatus} style={{ display: "flex", gap: "var(--azimuth-space-sm)", alignItems: "flex-end" }}>
          <input type="hidden" name="id" value={orderData.id} />
          <div>
            <Text element={{ size: "sm" }} weight="semibold">Update Status</Text>
            <select
              name="status"
              defaultValue={orderData.status}
              style={{
                padding: "var(--azimuth-space-sm)",
                border: "1px solid var(--azimuth-color-border)",
                borderRadius: "var(--azimuth-radius-md)",
                fontFamily: "inherit",
              }}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <Button variant="primary" type="submit">Update</Button>
        </form>

        <Stack spacing="sm">
          <Text element={{ as: "h2", size: "h5" }} weight="semibold">Items</Text>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.products?.name || "Product #" + item.product_id}</td>
                  <td>{item.quantity}</td>
                  <td>\${(item.price_cents / 100).toFixed(2)}</td>
                  <td>\${((item.price_cents * item.quantity) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Stack>
      </Stack>
    );
  }

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  const statusFilter = params.status?.toLowerCase() || "";
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const searchQ = params.q?.toLowerCase() || "";
  const { data: orders } = await query;
  let raw = (orders ?? []) as Order[];

  if (searchQ) {
    raw = raw.filter(
      (o) =>
        o.id.toString().includes(searchQ) ||
        o.stripe_payment_intent_id?.toLowerCase().includes(searchQ),
    );
  }

  const statuses = ["pending", "paid", "shipped", "delivered"];

  return (
    <Stack spacing="md">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Orders
      </Text>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-space-sm)", flexWrap: "wrap" }}>
        <Input
          label={{ text: "Search" }}
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search by ID or payment ref..."
        />
        <select
          name="status"
          defaultValue={params.status || ""}
          style={{
            padding: "var(--azimuth-space-sm)",
            border: "1px solid var(--azimuth-color-border)",
            borderRadius: "var(--azimuth-radius-md)",
            fontFamily: "inherit",
          }}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <Button variant="primary" type="submit">Filter</Button>
        {(params.q || params.status) && (
          <a href="/dashboard/orders">
            <Button variant="ghost" type="button">Clear</Button>
          </a>
        )}
      </form>

      {raw.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {raw.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>\${(order.total_cents / 100).toFixed(2)}</td>
                <td>{order.status}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <a href={"/dashboard/orders?id=" + order.id}>
                    <Button variant="ghost" type="button">View</Button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Stack>
  );
}
`
}

function renderStorefrontDashboardPage(): string {
  return `import { Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [productsRes, ordersRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("orders").select("*"),
  ]);

  const products = productsRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const activeProducts = products.filter((p: Record<string, unknown>) => p.is_active).length;
  const totalRevenue = orders
    .filter((o: Record<string, unknown>) => o.status === "delivered" || o.status === "paid")
    .reduce((sum: number, o: Record<string, unknown>) => sum + (o.total_cents as number), 0);
  const pendingOrders = orders.filter((o: Record<string, unknown>) => o.status === "pending").length;

  return (
    <Stack spacing="lg">
      <Text element={{ as: "h1", size: "h3" }} weight="semibold">
        Dashboard
      </Text>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--azimuth-space-md)" }}>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: "sm" }} color="secondary">Active Products</Text>
            <Text element={{ as: "p", size: "h2" }} weight="bold">{activeProducts}</Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: "sm" }} color="secondary">Total Orders</Text>
            <Text element={{ as: "p", size: "h2" }} weight="bold">{orders.length}</Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: "sm" }} color="secondary">Pending Orders</Text>
            <Text element={{ as: "p", size: "h2" }} weight="bold">{pendingOrders}</Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: "sm" }} color="secondary">Revenue</Text>
            <Text element={{ as: "p", size: "h2" }} weight="bold">\${(totalRevenue / 100).toFixed(2)}</Text>
          </Stack>
        </Card>
      </div>
    </Stack>
  );
}
`
}

function renderStorefrontShopPage(): string {
  return `import Link from "next/link";
import { Button, Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  category: string | null;
  image_url: string | null;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data: products } = await query;
  let raw = (products ?? []) as Product[];

  const search = params.q?.toLowerCase() || "";
  if (search) {
    raw = raw.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search),
    );
  }

  const categories = [...new Set((products ?? []).map((p: Product) => p.category).filter(Boolean))] as string[];

  return (
    <Stack spacing="lg" style={{ padding: "var(--azimuth-space-lg)" }}>
      <Stack spacing="xs">
        <Text element={{ as: "h1", size: "h2" }} weight="bold">
          Shop
        </Text>
        <Text color="secondary">Browse our products</Text>
      </Stack>

      <form method="GET" style={{ display: "flex", gap: "var(--azimuth-space-sm)" }}>
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search products..."
          style={{
            flex: 1,
            padding: "var(--azimuth-space-sm)",
            border: "1px solid var(--azimuth-color-border)",
            borderRadius: "var(--azimuth-radius-md)",
            fontFamily: "inherit",
          }}
        />
        <Button variant="primary" type="submit">Search</Button>
      </form>

      <div style={{ display: "flex", gap: "var(--azimuth-space-sm)", flexWrap: "wrap" }}>
        <Link href="/shop" style={{ textDecoration: "none" }}>
          <Button variant={params.category ? "ghost" : "primary"} type="button">All</Button>
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={"/shop?category=" + encodeURIComponent(cat)} style={{ textDecoration: "none" }}>
            <Button variant={params.category === cat ? "primary" : "ghost"} type="button">{cat}</Button>
          </Link>
        ))}
      </div>

      {raw.length === 0 ? (
        <Card>
          <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-space-lg)" }}>
            <Text color="secondary">No products found.</Text>
          </Stack>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "var(--azimuth-space-md)" }}>
          {raw.map((product) => (
            <Card key={product.id}>
              <Stack spacing="sm">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: "var(--azimuth-radius-md)" }}
                  />
                )}
                <Text weight="semibold">{product.name}</Text>
                {product.description && (
                  <Text element={{ size: "sm" }} color="secondary">{product.description}</Text>
                )}
                {product.category && (
                  <Text element={{ size: "sm" }} color="secondary">{product.category}</Text>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text weight="bold">\${(product.price_cents / 100).toFixed(2)}</Text>
                  <Link href={"/products/" + product.id}>
                    <Button variant="primary" type="button">View Details</Button>
                  </Link>
                </div>
              </Stack>
            </Card>
          ))}
        </div>
      )}
    </Stack>
  );
}
`
}

function renderStorefrontProductDetailPage(): string {
  return `import Link from "next/link";
import { Button, Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  category: string | null;
  image_url: string | null;
  inventory_count: number;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", parseInt(id, 10))
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;

  async function addToCartAction(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in to add items to your cart");

    const productId = formData.get("product_id") as string;
    const quantity = parseInt(formData.get("quantity") as string || "1", 10);

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", parseInt(productId, 10))
      .single();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
      if (error) throw new Error("Failed to update cart");
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: parseInt(productId, 10),
        quantity,
      });
      if (error) throw new Error("Failed to add to cart");
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--azimuth-space-lg)" }}>
      <Link href="/shop" style={{ textDecoration: "none" }}>
        <Button variant="ghost" type="button">&larr; Back to Shop</Button>
      </Link>
      <Card>
        <Stack spacing="md">
          {p.image_url && (
            <img
              src={p.image_url}
              alt={p.name}
              style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: "var(--azimuth-radius-md)" }}
            />
          )}
          <Text element={{ as: "h1", size: "h3" }} weight="bold">{p.name}</Text>
          {p.category && <Text color="secondary">{p.category}</Text>}
          {p.description && <Text>{p.description}</Text>}
          <Text element={{ as: "p", size: "h2" }} weight="bold" color="primary">
            \${(p.price_cents / 100).toFixed(2)}
          </Text>
          <Text element={{ size: "sm" }} color="secondary">
            {p.inventory_count > 0 ? p.inventory_count + " in stock" : "Out of stock"}
          </Text>
          {p.inventory_count > 0 && (
            <form action={addToCartAction}>
              <input type="hidden" name="product_id" value={p.id} />
              <div style={{ display: "flex", gap: "var(--azimuth-space-sm)", alignItems: "center" }}>
                <input
                  type="number"
                  name="quantity"
                  defaultValue="1"
                  min="1"
                  max={p.inventory_count}
                  style={{
                    width: 60,
                    padding: "var(--azimuth-space-sm)",
                    border: "1px solid var(--azimuth-color-border)",
                    borderRadius: "var(--azimuth-radius-md)",
                    fontFamily: "inherit",
                  }}
                />
                <Button variant="primary" type="submit">Add to Cart</Button>
              </div>
            </form>
          )}
        </Stack>
      </Card>
    </div>
  );
}
`
}

function renderStorefrontCartPage(): string {
  return `import { Button, Card, Stack, Text } from "azimuth-ui";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  products: {
    name: string;
    price_cents: number;
    image_url: string | null;
  } | null;
}

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/cart");

  const { data: items } = await supabase
    .from("cart_items")
    .select("*, products(name, price_cents, image_url)")
    .eq("user_id", user.id);

  const cartItems = (items ?? []) as CartItem[];

  async function removeItem(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    if (!id) throw new Error("Item ID is required");

    const { error } = await supabase.from("cart_items").delete().eq("id", parseInt(id, 10)).eq("user_id", user.id);
    if (error) throw new Error("Failed to remove item");
    redirect("/cart");
  }

  async function updateQuantity(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const quantity = parseInt(formData.get("quantity") as string || "1", 10);
    if (!id || quantity < 1) throw new Error("Invalid request");

    const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", parseInt(id, 10)).eq("user_id", user.id);
    if (error) throw new Error("Failed to update quantity");
    redirect("/cart");
  }

  async function checkout(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in to checkout");

    const { data: items } = await supabase
      .from("cart_items")
      .select("*, products(name, price_cents)")
      .eq("user_id", user.id);

    const cartItems = (items ?? []) as CartItem[];
    if (cartItems.length === 0) throw new Error("Cart is empty");

    const totalCents = cartItems.reduce(
      (sum, item) => sum + (item.products?.price_cents ?? 0) * item.quantity,
      0,
    );

    const response = await fetch(new URL("/api/orders", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems, total_cents: totalCents }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Checkout failed");
    }

    const { url } = await response.json();
    if (url) redirect(url);
  }

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price_cents ?? 0) * item.quantity,
    0,
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--azimuth-space-lg)" }}>
      <Stack spacing="md">
        <Text element={{ as: "h1", size: "h3" }} weight="bold">
          Shopping Cart
        </Text>

        {cartItems.length === 0 ? (
          <Card>
            <Stack spacing="sm" style={{ textAlign: "center", padding: "var(--azimuth-space-lg)" }}>
              <Text color="secondary">Your cart is empty.</Text>
              <a href="/shop">
                <Button variant="primary" type="button">Continue Shopping</Button>
              </a>
            </Stack>
          </Card>
        ) : (
          <>
            <Stack spacing="sm">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Stack spacing="xs">
                      <Text weight="semibold">{item.products?.name || "Product #" + item.product_id}</Text>
                      <Text element={{ size: "sm" }} color="secondary">
                        \${((item.products?.price_cents ?? 0) / 100).toFixed(2)} each
                      </Text>
                    </Stack>
                    <div style={{ display: "flex", gap: "var(--azimuth-space-sm)", alignItems: "center" }}>
                      <form action={updateQuantity} style={{ display: "flex", gap: "var(--azimuth-space-xs)", alignItems: "center" }}>
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          type="number"
                          name="quantity"
                          defaultValue={item.quantity}
                          min="1"
                          style={{
                            width: 60,
                            padding: "var(--azimuth-space-xs)",
                            border: "1px solid var(--azimuth-color-border)",
                            borderRadius: "var(--azimuth-radius-md)",
                            fontFamily: "inherit",
                          }}
                        />
                        <Button variant="ghost" type="submit">Update</Button>
                      </form>
                      <form action={removeItem} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button variant="ghost" type="submit">Remove</Button>
                      </form>
                    </div>
                  </div>
                </Card>
              ))}
            </Stack>

            <Card>
              <Stack spacing="sm">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text weight="semibold">Total</Text>
                  <Text weight="bold" element={{ as: "p", size: "h3" }}>
                    \${(total / 100).toFixed(2)}
                  </Text>
                </div>
                <form action={checkout}>
                  <Button variant="primary" fullWidth type="submit">
                    Proceed to Checkout
                  </Button>
                </form>
              </Stack>
            </Card>
          </>
        )}
      </Stack>
    </div>
  );
}
`
}

function renderStorefrontProductsApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const category = searchParams.get("category");
  if (category) query = query.eq("category", category);

  const q = searchParams.get("q");
  const { data: products } = await query;
  let raw = products ?? [];

  if (q) {
    const lower = q.toLowerCase();
    raw = raw.filter(
      (p: Record<string, unknown>) =>
        (p.name as string)?.toLowerCase().includes(lower) ||
        (p.description as string)?.toLowerCase().includes(lower),
    );
  }

  return NextResponse.json(raw);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, description, price_cents, category, image_url, inventory_count } = body;

  if (!name || typeof price_cents !== "number" || price_cents <= 0) {
    return NextResponse.json({ error: "Name and valid price_cents are required" }, { status: 400 });
  }

  const { data: product, error: createError } = await supabase
    .from("products")
    .insert({
      name,
      description: description || null,
      price_cents,
      category: category || null,
      image_url: image_url || null,
      inventory_count: typeof inventory_count === "number" ? inventory_count : 0,
    })
    .select()
    .single();

  if (createError) return NextResponse.json({ error: "Failed to create product" }, { status: 500 });

  return NextResponse.json(product, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product id is required" }, { status: 400 });

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.price_cents !== undefined) {
    if (typeof body.price_cents !== "number" || body.price_cents <= 0) {
      return NextResponse.json({ error: "Invalid price_cents" }, { status: 400 });
    }
    updateData.price_cents = body.price_cents;
  }
  if (body.category !== undefined) updateData.category = body.category;
  if (body.image_url !== undefined) updateData.image_url = body.image_url;
  if (body.inventory_count !== undefined) updateData.inventory_count = body.inventory_count;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;

  const { data: product, error: updateError } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", parseInt(id, 10))
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: "Failed to update product" }, { status: 500 });

  return NextResponse.json(product);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product id is required" }, { status: 400 });

  const { error: deleteError } = await supabase.from("products").delete().eq("id", parseInt(id, 10));

  if (deleteError) return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });

  return NextResponse.json({ success: true });
}
`
}

function renderStorefrontOrdersApi(): string {
  return `import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .order("created_at", { ascending: false });

  if (ordersError) return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });

  return NextResponse.json(orders ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { items, total_cents } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (typeof total_cents !== "number" || total_cents <= 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  const Stripe = await import("stripe");
  const stripe = new Stripe.default(getEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-03-31-basil",
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total_cents,
    currency: "usd",
    metadata: { user_id: user.id },
    automatic_payment_methods: { enabled: true },
  });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total_cents,
      stripe_payment_intent_id: paymentIntent.id,
    })
    .select()
    .single();

  if (orderError) {
    await stripe.paymentIntents.cancel(paymentIntent.id);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const orderItems = items.map((item: { product_id: number; quantity: number; products: { price_cents: number } | null }) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_cents: item.products?.price_cents ?? 0,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    await stripe.paymentIntents.cancel(paymentIntent.id);
    return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
  }

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({
    url: paymentIntent.next_action?.redirect_to_url?.url || null,
    client_secret: paymentIntent.client_secret,
    order_id: order.id,
  });
}
`
}

export function generateStorefrontFiles(config: BootConfig): GeneratedFile[] {
  if (config.preset !== 'storefront') return []

  return [
    {
      path: 'src/app/dashboard/layout.tsx',
      content: renderStorefrontDashboardLayout(),
    },
    {
      path: 'src/app/dashboard/page.tsx',
      content: renderStorefrontDashboardPage(),
    },
    {
      path: 'src/app/dashboard/products/page.tsx',
      content: renderStorefrontProductsPage(),
    },
    {
      path: 'src/app/dashboard/orders/page.tsx',
      content: renderStorefrontOrdersPage(),
    },
    {
      path: 'src/app/shop/page.tsx',
      content: renderStorefrontShopPage(),
    },
    {
      path: 'src/app/products/[id]/page.tsx',
      content: renderStorefrontProductDetailPage(),
    },
    {
      path: 'src/app/cart/page.tsx',
      content: renderStorefrontCartPage(),
    },
    {
      path: 'src/app/api/products/route.ts',
      content: renderStorefrontProductsApi(),
    },
    {
      path: 'src/app/api/orders/route.ts',
      content: renderStorefrontOrdersApi(),
    },
  ]
}
