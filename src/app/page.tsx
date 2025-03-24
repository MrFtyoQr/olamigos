"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, Loader2 } from "lucide-react"

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`http://localhost:8000/api/ask?question=${encodeURIComponent(input)}`)
      const data = await response.text()

      setMessages((prev) => [...prev, { role: "assistant", content: data }])
    } catch (error) {
      console.error("Error fetching response:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lo siento, ha ocurrido un error al procesar tu pregunta." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-2xl">Chat Interactivo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 h-[60vh] overflow-y-auto mb-4 p-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Haz una pregunta para comenzar la conversación</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-card border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

