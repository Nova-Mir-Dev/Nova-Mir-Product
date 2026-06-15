import {
  Html,
  Head,
  Preview,
  Body,
  Text,
  Heading,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the app, {name}!</Preview>
      <Body style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <Heading>Welcome, {name}!</Heading>
        <Text>Thanks for joining. We're excited to have you on board.</Text>
      </Body>
    </Html>
  )
}
