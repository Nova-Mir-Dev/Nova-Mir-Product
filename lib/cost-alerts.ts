const MONTHLY_BUDGET = 20
const ALERT_CHANNELS = ['email', 'slack']

export async function checkSpending(currentSpending: number) {
  const percentage = (currentSpending / MONTHLY_BUDGET) * 100
  if (percentage >= 100) {
    await alert(
      `Monthly budget exceeded! Spending: $${currentSpending} / $${MONTHLY_BUDGET}`,
    )
  } else if (percentage >= 80) {
    await alert(
      `Budget warning: ${percentage.toFixed(1)}% of monthly budget used ($${currentSpending} / $${MONTHLY_BUDGET})`,
    )
  }
}

async function alert(message: string) {
  console.log('[Cost Alert]', message)
  for (const channel of ALERT_CHANNELS) {
    switch (channel) {
      case 'email':
        break
      case 'slack':
        break
    }
  }
}
