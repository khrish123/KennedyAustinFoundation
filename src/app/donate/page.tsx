"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Check, ArrowRight, Shield, Users, Sparkles } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const impactLevels = [
  {
    amount: 25,
    title: "Supporter",
    description: "Provides crisis support materials for one family",
    icon: Heart,
  },
  {
    amount: 50,
    title: "Advocate",
    description: "Funds one grief counseling session",
    icon: Users,
  },
  {
    amount: 100,
    title: "Champion",
    description: "Sponsors a youth to attend a workshop",
    icon: Sparkles,
  },
  {
    amount: 250,
    title: "Guardian",
    description: "Supports a family for an entire month",
    icon: Shield,
  },
]

const testimonials = [
  {
    quote: "The Kennedy Austin Foundation was there when I had nowhere else to turn. They saved my family.",
    author: "Maria S.",
    role: "Program Participant",
  },
  {
    quote: "My donation goes directly to helping families in crisis. I can see the impact every day.",
    author: "James T.",
    role: "Monthly Donor",
  },
]

export default function DonatePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    message: "",
    isAnonymous: false,
  })

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0)

  const handleDonate = async () => {
    if (finalAmount < 1) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a donation amount of at least $1.",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/payments/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          isRecurring: donationType === "monthly",
          donorName: donorInfo.isAnonymous ? "Anonymous" : donorInfo.name,
          donorEmail: donorInfo.email,
          message: donorInfo.message,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        })
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Support Our Mission</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Your Gift Makes a Difference
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Every dollar you donate goes directly to supporting families in crisis.
                Help us continue providing free services to those who need them most.
              </p>
            </div>
          </div>
        </section>

        {/* Donation Form */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Form Side */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Make a Donation</CardTitle>
                    <CardDescription>
                      Choose your donation amount and frequency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Donation Type Tabs */}
                    <Tabs
                      value={donationType}
                      onValueChange={(v) => setDonationType(v as "one-time" | "monthly")}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="one-time">One-time</TabsTrigger>
                        <TabsTrigger value="monthly" id="monthly">Monthly</TabsTrigger>
                      </TabsList>
                      <TabsContent value="one-time" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Make a one-time contribution to support our programs.
                        </p>
                      </TabsContent>
                      <TabsContent value="monthly" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Become a monthly supporter and provide ongoing help to families in need.
                        </p>
                      </TabsContent>
                    </Tabs>

                    {/* Amount Selection */}
                    <div className="space-y-3">
                      <Label>Select Amount</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[25, 50, 100, 250].map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant={selectedAmount === amount ? "default" : "outline"}
                            onClick={() => {
                              setSelectedAmount(amount)
                              setCustomAmount("")
                            }}
                            className="h-12"
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      <div className="relative mt-3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setSelectedAmount(null)
                          }}
                          className="pl-7"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Donor Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="donorName">Your Name</Label>
                        <Input
                          id="donorName"
                          placeholder="Your name (optional)"
                          value={donorInfo.name}
                          onChange={(e) =>
                            setDonorInfo({ ...donorInfo, name: e.target.value })
                          }
                          disabled={donorInfo.isAnonymous}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donorEmail">Email</Label>
                        <Input
                          id="donorEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={donorInfo.email}
                          onChange={(e) =>
                            setDonorInfo({ ...donorInfo, email: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          We&apos;ll send your receipt to this address
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Leave a message of support..."
                          value={donorInfo.message}
                          onChange={(e) =>
                            setDonorInfo({ ...donorInfo, message: e.target.value })
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={donorInfo.isAnonymous}
                          onChange={(e) =>
                            setDonorInfo({ ...donorInfo, isAnonymous: e.target.checked })
                          }
                          className="rounded border-input"
                        />
                        <span className="text-sm">Make my donation anonymous</span>
                      </label>
                    </div>

                    {/* Donate Button */}
                    <Button
                      onClick={handleDonate}
                      loading={loading}
                      disabled={finalAmount < 1}
                      size="lg"
                      className="w-full"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Donate ${finalAmount || 0} {donationType === "monthly" && "Monthly"}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Secure payment powered by Stripe
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Side */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {impactLevels.map((level) => (
                      <Card
                        key={level.amount}
                        className={`cursor-pointer transition-all ${
                          selectedAmount === level.amount
                            ? "ring-2 ring-primary"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => {
                          setSelectedAmount(level.amount)
                          setCustomAmount("")
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <level.icon className="h-5 w-5 text-primary" />
                            {selectedAmount === level.amount && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <CardTitle className="text-lg">${level.amount}</CardTitle>
                          <CardDescription className="text-xs font-medium">
                            {level.title}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {level.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-primary">100%</div>
                      <p className="text-sm text-muted-foreground">
                        of donations go directly to programs
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Tax-deductible 501(c)(3) organization
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Transparent financial reporting
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Cancel monthly donations anytime
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Testimonials */}
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <p className="text-sm italic text-muted-foreground mb-4">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                        <div>
                          <div className="font-medium">{testimonial.author}</div>
                          <div className="text-xs text-muted-foreground">
                            {testimonial.role}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Ways to Help */}
        <section className="bg-muted/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Other Ways to Support
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Can&apos;t donate right now? There are other meaningful ways to help.
            </p>
            <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Volunteer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your time and skills to support our programs.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spread the Word</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share our mission with your network.
                  </p>
                  <Button variant="outline" className="w-full">
                    Share
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Corporate Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Partner with us for corporate giving programs.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
