export async function GET() {
  const samples = [
    {
      title: "New Bid Received",
      message: "A buyer placed a new bid on your maize lot.",
      href: "/buyers",
      priority: "high",
    },
    {
      title: "Payment Reminder",
      message: "Invoice #2391 is due tomorrow.",
      href: "/buyers",
      priority: "low",
    },
  ];
  return Response.json(samples);
}

