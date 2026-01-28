import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SubscriptionTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Set up recurring payment subscriptions</CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground text-lg mb-4">Coming soon</p>
        <p className="text-sm text-muted-foreground">
          This feature will allow you to create and manage recurring payment subscriptions.
        </p>
      </CardContent>
    </Card>
  )
}
