'use client'

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button, Card, Input, Text, Stack } from "azimuth-ui"

type Tab = "admin" | "client"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || ""
  const [tab, setTab] = useState<Tab>("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(redirect || "/admin")
  }

  async function handleClientLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const origin = typeof window !== "undefined" ? window.location.origin : ""

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push("/login/check-email?email=" + encodeURIComponent(email))
  }

  return (
    <div style={{ maxWidth: 400, margin: "4rem auto" }}>
      <Card>
        <Stack spacing="md">
          <Text element={{ as: "h1", size: "h3" }} weight="bold" style={{ textAlign: "center" }}>
            Sign In
          </Text>

          <div style={{ display: "flex", borderBottom: "1px solid var(--azimuth-color-border)" }}>
            <button
              onClick={() => { setTab("admin"); setError("") }}
              style={{
                flex: 1,
                padding: "var(--azimuth-spacing-sm)",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontWeight: tab === "admin" ? 600 : 400,
                borderBottom: tab === "admin" ? "2px solid var(--azimuth-color-primary)" : "2px solid transparent",
                color: tab === "admin" ? "var(--azimuth-color-primary)" : "var(--azimuth-color-text-secondary)",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Admin
            </button>
            <button
              onClick={() => { setTab("client"); setError("") }}
              style={{
                flex: 1,
                padding: "var(--azimuth-spacing-sm)",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontWeight: tab === "client" ? 600 : 400,
                borderBottom: tab === "client" ? "2px solid var(--azimuth-color-primary)" : "2px solid transparent",
                color: tab === "client" ? "var(--azimuth-color-primary)" : "var(--azimuth-color-text-secondary)",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Client
            </button>
          </div>

          {error && <Text color="accent">{error}</Text>}

          <form onSubmit={tab === "admin" ? handleAdminLogin : handleClientLogin}>
            <Stack spacing="md">
              <Input
                label={{ text: "Email" }}
                type="email"
                value={{ value: email, onChange: (e) => setEmail(e.target.value) }}
                required
                placeholder="you@example.com"
              />

              {tab === "admin" && (
                <Input
                  label={{ text: "Password" }}
                  type="password"
                  value={{ value: password, onChange: (e) => setPassword(e.target.value) }}
                  required
                  placeholder="Enter your password"
                />
              )}

              {tab === "client" && (
                <Text element={{ size: "sm" }} color="secondary">
                  We&apos;ll send a magic link to your email. No password needed.
                </Text>
              )}

              <Button type="submit" variant="primary" fullWidth>
                {loading
                  ? "Please wait..."
                  : tab === "admin"
                  ? "Sign In"
                  : "Send Magic Link"
                }
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 400, margin: "4rem auto" }}><Card><Text>Loading...</Text></Card></div>}>
      <LoginContent />
    </Suspense>
  )
}
