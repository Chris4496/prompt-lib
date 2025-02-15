"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PromptProps {
  prompt: { id: number; title: string; text: string }
  onUpdate: (title: string, text: string) => void
}

export default function Prompt({ prompt, onUpdate }: PromptProps) {
  const [title, setTitle] = useState(prompt.title)
  const [text, setText] = useState(prompt.text)
  const { toast } = useToast()

  const handleUpdate = () => {
    onUpdate(title, text)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "The prompt text has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "There was an error copying the text to your clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
            className="text-xl font-bold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          className="min-h-[100px]"
        />
        <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-full">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </CardContent>
    </Card>
  )
}

