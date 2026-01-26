"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  BookOpen, Plus, Search, Calendar, Smile, Meh, Frown, Heart,
  MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type JournalEntry = {
  id: string
  title: string
  content: string
  mood: number
  tags: string[]
  created_at: string
}

const moodIcons = [
  { value: 1, icon: Frown, label: "Very Low", color: "text-red-500" },
  { value: 2, icon: Frown, label: "Low", color: "text-orange-500" },
  { value: 3, icon: Meh, label: "Neutral", color: "text-yellow-500" },
  { value: 4, icon: Smile, label: "Good", color: "text-lime-500" },
  { value: 5, icon: Heart, label: "Great", color: "text-emerald-500" },
]

const journalPrompts = [
  "What are three things you're grateful for today?",
  "How did you take care of yourself today?",
  "What's one challenge you faced and how did you handle it?",
  "Describe a moment that brought you peace today.",
  "What's something you learned about yourself recently?",
  "Write about someone who made a positive impact on your life.",
  "What would you tell your past self about where you are now?",
  "What small win can you celebrate today?",
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState(3)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setEntries(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter a title and content for your journal entry.",
      })
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title,
      content,
      mood,
      tags: [],
      is_private: true,
    })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
      })
    } else {
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      })
      setTitle("")
      setContent("")
      setMood(3)
      setIsDialogOpen(false)
      fetchEntries()
    }
    setSaving(false)
  }

  const getRandomPrompt = () => {
    const prompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
    setContent(prompt + "\n\n")
  }

  const getMoodIcon = (moodValue: number) => {
    const moodData = moodIcons.find(m => m.value === moodValue) || moodIcons[2]
    const Icon = moodData.icon
    return <Icon className={`h-5 w-5 ${moodData.color}`} />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Journal</h1>
          <p className="text-slate-600 mt-1">
            A private space to reflect and grow on your healing journey
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
              <DialogDescription>
                Take a moment to reflect on your thoughts and feelings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your entry a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <Button variant="ghost" size="sm" onClick={getRandomPrompt}>
                    Get a prompt
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label>How are you feeling?</Label>
                <div className="flex gap-2">
                  {moodIcons.map((moodOption) => {
                    const Icon = moodOption.icon
                    return (
                      <button
                        key={moodOption.value}
                        onClick={() => setMood(moodOption.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          mood === moodOption.value
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:bg-muted/80"
                        }`}
                        title={moodOption.label}
                      >
                        <Icon className={`h-6 w-6 ${moodOption.color}`} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Entry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mood Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {moodIcons.map((moodOption) => {
          const count = entries.filter(e => e.mood === moodOption.value).length
          const Icon = moodOption.icon
          return (
            <Card key={moodOption.value} className="shadow-warm border-amber-100 hover-lift transition-all">
              <CardContent className="pt-4 text-center">
                <Icon className={`h-8 w-8 mx-auto ${moodOption.color}`} />
                <p className="text-2xl font-bold mt-2 text-slate-800">{count}</p>
                <p className="text-xs text-slate-500">{moodOption.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Entries List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Recent Entries</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search entries..." className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Card key={entry.id} className="flex flex-col shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {getMoodIcon(entry.mood)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-1">{entry.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {entry.content}
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1">
                      {entry.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" size="sm">
                    Read More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-warm border-amber-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-slate-800">Start Your Journal</h3>
              <p className="text-slate-600 mt-2 mb-4">
                Writing can be a powerful tool for healing and self-discovery
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="shadow-warm">
                <Plus className="mr-2 h-4 w-4" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
