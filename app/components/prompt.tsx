"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MoreVertical, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PromptProps {
  prompt: { id: number; title: string; text: string }
  onUpdate: (title: string, text: string) => void
  onDelete: (id: number) => void
}

export default function Prompt({ prompt, onUpdate, onDelete }: PromptProps) {
  const [title, setTitle] = useState(prompt.title)
  const [text, setText] = useState(prompt.text)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Extract unique placeholders from text
  const extractPlaceholders = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g)
    if (!matches) return []

    const uniquePlaceholders = [...new Set(
      matches.map(match => match.slice(2, -2).trim())
    )]
    return uniquePlaceholders
  }

  const placeholders = extractPlaceholders(text)

  // Clean up placeholder values when text changes
  React.useEffect(() => {
    const currentPlaceholders = extractPlaceholders(text)
    setPlaceholderValues(prev => {
      const cleaned = { ...prev }
      Object.keys(cleaned).forEach(key => {
        if (!currentPlaceholders.includes(key)) {
          delete cleaned[key]
        }
      })
      return cleaned
    })
  }, [text])

  // Update placeholder values
  const updatePlaceholderValue = (placeholder: string, value: string) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [placeholder]: value
    }))
  }

  const handleUpdate = () => {
    onUpdate(title, text)
  }

  const handleCopy = async () => {
    let processedText = text

    // Substitute placeholder values
    Object.entries(placeholderValues).forEach(([placeholder, value]) => {
      if (value.trim()) {
        const regex = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g')
        processedText = processedText.replace(regex, value)
      }
    })

    await navigator.clipboard.writeText(processedText)
    toast({
      title: "Copied to clipboard",
      description: placeholders.length > 0
        ? "The prompt text has been copied with placeholder substitutions."
        : "The prompt text has been copied to your clipboard.",
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

        {/* Placeholder inputs */}
        {placeholders.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Fill in placeholders:</h4>
            {placeholders.map((placeholder) => (
              <div key={placeholder} className="flex items-center space-x-2">
                <label className="text-sm font-medium min-w-[100px]">
                  {placeholder}:
                </label>
                <Input
                  value={placeholderValues[placeholder] || ''}
                  onChange={(e) => updatePlaceholderValue(placeholder, e.target.value)}
                  placeholder={`Enter ${placeholder}`}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        )}

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

