"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, BanknoteIcon, Bot, LineChart, Mail, MessageSquare, User, Wallet, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast("You are in the list")
      setIsSubmitting(false)
      setEmail("")
      setName("")
    }, 1500)
  }

  return (
    <div className="dark min-h-screen bg-black relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-8 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Smart Finance Tracking{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl">
              Join the waitlist for the next generation expense tracker
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 w-full mb-10">
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { icon: <Wallet className="h-5 w-5" />, text: "Connect all your bank accounts" },
                  { icon: <Bot className="h-5 w-5" />, text: "Have AI categorize your transactions" },
                  { icon: <MessageSquare className="h-5 w-5" />, text: "Get insights into your spending via Telegram" },
                  { icon: <Zap className="h-5 w-5" />, text: "Use AI to ask questions about your spending" },
                  { icon: <BanknoteIcon className="h-5 w-5" />, text: "Set budgets and goals" },
                  {
                    icon: <LineChart className="h-5 w-5" />,
                    text: "Get notified when you're about to exceed your budgets",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <div className="mr-3 mt-0.5 bg-zinc-900 p-2 rounded-full text-purple-400">{item.icon}</div>
                    <p className="text-zinc-200">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-xl border border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-4">Join the Waitlist</h3>
              <p className="text-zinc-400 mb-6">Be the first to know when we launch and get early access.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-300 h-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="Your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-300 h-12"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 mt-2 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Join Waitlist"}
                  {!isSubmitting && (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              </form>

              <p className="text-zinc-500 text-sm mt-4 text-center">We respect your privacy. No spam, ever.</p>
            </div>
          </div>
        </main>

        <footer className="text-center text-zinc-500 text-sm pb-8">
          <p>© {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}