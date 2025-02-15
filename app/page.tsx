"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PlusIcon, MenuIcon, DownloadIcon, UploadIcon } from "lucide-react"
import Folder from "./components/folder"
import Prompt from "./components/prompt"
import { useToast } from "@/hooks/use-toast"


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
    const { [id]: _, ...newPrompts } = prompts;
    console.log(selectedFolder, _);
    setPrompts(newPrompts);
    if (selectedFolder === id) {
      setSelectedFolder(null);
    }
  }

  const addPrompt = () => {
    if (selectedFolder) {
      const newPrompt = { id: Date.now(), title: "", text: "" }
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

  const { toast } = useToast()

  const exportData = () => {
    const data = {
      folders: folders,
      prompts: prompts,
    }
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "prompt_manager_export.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({
      title: "Export Successful",
      description: "Your data has been exported to a JSON file.",
    })
  }

  const importData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    
    input.onchange = async (e) => {
      try {
        const target = e.target as HTMLInputElement | null;
        const file = target?.files?.[0];
        if (!file) return
        
        const text = await file.text()
        const data = JSON.parse(text)
        
        // Validate data structure
        if (!data.folders || !data.prompts || 
            !Array.isArray(data.folders) ||
            typeof data.prompts !== 'object') {
          throw new Error('Invalid file format')
        }
  
        // Validate folder structure
        const isValidFolder = (folder: FolderType) => {
          return folder.id && 
                 typeof folder.id === 'number' &&
                 folder.name &&
                 typeof folder.name === 'string'
        }
  
        if (!data.folders.every(isValidFolder)) {
          throw new Error('Invalid folder data')
        }
  
        // Validate prompts structure
        const isValidPrompt = (prompt: PromptType) => {
          return prompt.id &&
                 typeof prompt.id === 'number' &&
                 prompt.title &&
                 typeof prompt.title === 'string' &&
                 prompt.text &&
                 typeof prompt.text === 'string'
        }
  
        for (const folderId in data.prompts) {
          if (!Array.isArray(data.prompts[folderId]) ||
              !data.prompts[folderId].every(isValidPrompt)) {
            throw new Error('Invalid prompt data')
          }
        }
  
        // Save to localStorage
        localStorage.setItem("folders", JSON.stringify(data.folders))
        localStorage.setItem("prompts", JSON.stringify(data.prompts))
        
        // Update state
        setFolders(data.folders)
        setPrompts(data.prompts)
        setSelectedFolder(null)
  
        toast({
          title: "Import Successful",
          description: "Your data has been imported successfully.",
        })
      } catch (error) {
        let errorMessage = "Failed to import data. Please make sure the file is valid.";
        if (error instanceof Error) {
          errorMessage = `Failed to import data: ${error.message}`;
        }
        toast({
          title: "Import Failed",
          description: errorMessage,
          variant: "destructive",
        })
        console.error('Import error:', error)
      }
    }
  
    input.click()
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Drawer */}
      <div className="hidden lg:flex lg:flex-col w-[300px] border-r">
        <div className="p-6 border-b"> {/* Fixed header */}
          <Button onClick={addFolder} className="w-full rounded-full">
            <PlusIcon className="mr-2 h-4 w-4" /> New Folder
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6"> {/* Scrollable content */}
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
      </div>

      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-20">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
          <div className="p-6 border-b"> {/* Fixed header */}
            <Button onClick={addFolder} className="w-full rounded-full">
              <PlusIcon className="mr-2 h-4 w-4" /> New Folder
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6"> {/* Scrollable content */}
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

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold min-w-0 truncate text-center sm:text-left">
            {selectedFolder ? `${folders.find((f) => f.id === selectedFolder)?.name} Prompts` : "Prompt Manager"}
          </h1>
          <div className="flex items-center justify-center w-full sm:w-auto sm:justify-end gap-1 sm:gap-2 flex-shrink-0">
            <Button onClick={importData} className="rounded-full px-2 sm:px-4 text-sm min-w-14">
              <UploadIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button onClick={exportData} className="rounded-full px-2 sm:px-4 text-sm min-w-14">
              <DownloadIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {selectedFolder && (
              <Button onClick={addPrompt} className="rounded-full px-2 sm:px-4 text-sm min-w-14">
                <PlusIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Prompt</span>
              </Button>
            )}
          </div>
        </div>
        {selectedFolder ? (
          <div className="space-y-6">
            {prompts[selectedFolder]?.map((prompt) => (
              <Prompt
                key={prompt.id}
                prompt={prompt}
                onUpdate={(title, text) => updatePrompt(selectedFolder, prompt.id, title, text)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Select a folder to view prompts or use the Import button to upload your data.
          </p>
        )}
      </div>
    </div>
  )
}

