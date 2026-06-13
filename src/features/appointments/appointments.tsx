"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Input, Stack, Text } from "azimuth-ui";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => setAppointments(data as Appointment[]))
      .catch(console.error);
  }, []);

  const createAppointment = useCallback(async () => {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, startTime, endTime }),
    });
    if (res.ok) {
      const created = (await res.json()) as Appointment;
      setAppointments((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    }
  }, [title, description, startTime, endTime]);

  return (
    <Card>
      <Stack spacing="md">
        <Text element={{ as: "h2", size: "h4" }} weight="semibold">
          Appointments
        </Text>

        <Stack spacing="sm">
          <Input
            label={{ text: "Title" }}
            value={{ value: title, onChange: (e) => setTitle(e.target.value) }}
          />
          <Input
            label={{ text: "Description" }}
            value={{ value: description, onChange: (e) => setDescription(e.target.value) }}
          />
          <Input
            label={{ text: "Start Time" }}
            value={{ value: startTime, onChange: (e) => setStartTime(e.target.value) }}
          />
          <Input
            label={{ text: "End Time" }}
            value={{ value: endTime, onChange: (e) => setEndTime(e.target.value) }}
          />
          <Button variant="primary" onClick={createAppointment}>
            Schedule
          </Button>
        </Stack>

        {appointments.length > 0 && (
          <Stack spacing="sm">
            <Text element={{ as: "h3", size: "sm" }} weight="medium">
              Scheduled
            </Text>
            {appointments.map((a) => (
              <div key={a.id}>
              <Text element={{ size: "sm" }}>
                {a.title} — {new Date(a.startTime).toLocaleString()} ({a.status})
              </Text>
              </div>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
