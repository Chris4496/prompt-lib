"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreVertical, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FolderProps {
  folder: { id: number; name: string }
  onRename: (id: number, newName: string) => void
  onDelete: (id: number) => void
  onSelect: () => void
  isSelected: boolean
}

export default function Folder({ folder, onRename, onDelete, onSelect, isSelected }: FolderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(folder.name)

  const handleRename = () => {
    onRename(folder.id, newName)
    setIsEditing(false)
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer mb-2 ${
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center flex-1">
        {isEditing ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyPress={(e) => e.key === "Enter" && handleRename()}
            className="mr-2 bg-white text-black"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1">{folder.name}</span>
        )}
      </div>
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
              setIsEditing(true)
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onDelete(folder.id)
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

