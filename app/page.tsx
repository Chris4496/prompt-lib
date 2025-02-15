"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PlusIcon, MenuIcon } from "lucide-react"
import Folder from "./components/folder"
import Prompt from "./components/prompt"

interface FolderType {
  id: number
  name: string
}

interface PromptType {
  id: number
  title: string
  text: string
}

export default function Home() {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [prompts, setPrompts] = useState<Record<number, PromptType[]>>({})
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)

  useEffect(() => {
    const storedFolders = localStorage.getItem("folders")
    const storedPrompts = localStorage.getItem("prompts")

    if (storedFolders) {
      setFolders(JSON.parse(storedFolders))
    }
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders))
  }, [folders])

  useEffect(() => {
    localStorage.setItem("prompts", JSON.stringify(prompts))
  }, [prompts])

  const addFolder = () => {
    const newFolder = { id: Date.now(), name: `New Folder ${folders.length + 1}` }
    setFolders([...folders, newFolder])
    setPrompts({ ...prompts, [newFolder.id]: [] })
  }

  const renameFolder = (id: number, newName: string) => {
    setFolders(folders.map((folder) => (folder.id === id ? { ...folder, name: newName } : folder)))
  }

  const deleteFolder = (id: number) => {
    setFolders(folders.filter((folder) => folder.id !== id))
    const { [id]: _, ...newPrompts } = prompts
    setPrompts(newPrompts)
    console.log(selectedFolder, _)
    if (selectedFolder === id) {
      setSelectedFolder(null)
    }
  }

  const addPrompt = () => {
    if (selectedFolder) {
      const newPrompt = { id: Date.now(), title: "New Prompt", text: "Enter your prompt here" }
      setPrompts({
        ...prompts,
        [selectedFolder]: [...(prompts[selectedFolder] || []), newPrompt],
      })
    }
  }

  const updatePrompt = (folderId: number, promptId: number, title: string, text: string) => {
    setPrompts({
      ...prompts,
      [folderId]: prompts[folderId].map((prompt) => (prompt.id === promptId ? { ...prompt, title, text } : prompt)),
    })
  }

  return (
    <div className="flex h-screen">
      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-20">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <div className="py-4">
            <Button onClick={addFolder} className="w-full mb-6 rounded-full">
              <PlusIcon className="mr-2 h-4 w-4" /> New Folder
            </Button>
            {folders.map((folder) => (
              <Folder
                key={folder.id}
                folder={folder}
                promptCount={prompts[folder.id]?.length || 0}
                onRename={renameFolder}
                onDelete={deleteFolder}
                onSelect={() => setSelectedFolder(folder.id)}
                isSelected={selectedFolder === folder.id}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Drawer */}
      <div className="hidden lg:block w-[300px] border-r p-6 overflow-y-auto">
        <Button onClick={addFolder} className="w-full mb-6 rounded-full">
          <PlusIcon className="mr-2 h-4 w-4" /> New Folder
        </Button>
        {folders.map((folder) => (
          <Folder
            key={folder.id}
            folder={folder}
            promptCount={prompts[folder.id]?.length || 0}
            onRename={renameFolder}
            onDelete={deleteFolder}
            onSelect={() => setSelectedFolder(folder.id)}
            isSelected={selectedFolder === folder.id}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile */}
        {selectedFolder ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{folders.find((f) => f.id === selectedFolder)?.name}</h1>
              <Button onClick={addPrompt} className="rounded-full">
                <PlusIcon className="mr-2 h-4 w-4" /> New Prompt
              </Button>
            </div>
            <div className="space-y-6">
              {prompts[selectedFolder]?.map((prompt) => (
                <Prompt
                  key={prompt.id}
                  prompt={prompt}
                  onUpdate={(title, text) => updatePrompt(selectedFolder, prompt.id, title, text)}
                />
              ))}
            </div>
          </>
        ) : (
          <h1 className="text-2xl font-bold">Select a folder to view prompts</h1>
        )}
      </div>
    </div>
  )
}

