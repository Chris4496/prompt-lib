"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MoreVertical, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PromptProps {
  prompt: { id: number; title: string; text: string }
  onUpdate: (title: string, text: string) => void
  onDelete: (id: number) => void
}

export default function Prompt({ prompt, onUpdate, onDelete }: PromptProps) {
  const [title, setTitle] = useState(prompt.title)
  const [text, setText] = useState(prompt.text)
  const { toast } = useToast()

  const handleUpdate = () => {
    onUpdate(title, text)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The prompt text has been copied to your clipboard.",
    })
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
            placeholder="New Prompt"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          className="min-h-[100px]"
          placeholder="Enter your prompt here"
        />
        <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-full">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
          <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(prompt.id)
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

