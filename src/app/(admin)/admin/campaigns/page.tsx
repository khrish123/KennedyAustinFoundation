"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Mail,
  Bell,
  Share2,
  Plus,
  Search,
  MoreHorizontal,
  Send,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Campaign, CampaignType, CampaignStatus } from "@/types"

export default function CampaignsPage() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const [newCampaign, setNewCampaign] = useState({
    title: "",
    type: "email" as CampaignType,
    subject: "",
    body: "",
    ctaText: "",
    ctaUrl: "",
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch campaigns",
      })
    } else {
      setCampaigns(data || [])
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const supabase = createClient()

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `campaigns/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file)

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: uploadError.message,
        })
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath)

      setUploadedImages((prev) => [...prev, publicUrl])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.body) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in the title and body",
      })
      return
    }

    setCreating(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from("campaigns").insert({
      title: newCampaign.title,
      type: newCampaign.type,
      status: "draft" as CampaignStatus,
      content: {
        subject: newCampaign.subject,
        body: newCampaign.body,
        cta_text: newCampaign.ctaText,
        cta_url: newCampaign.ctaUrl,
      },
      images: uploadedImages,
      target_audience: { all_subscribers: true },
      created_by: user?.id,
    })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create campaign",
      })
    } else {
      toast({
        title: "Campaign created",
        description: "Your campaign has been saved as a draft",
      })
      setIsCreateDialogOpen(false)
      setNewCampaign({
        title: "",
        type: "email",
        subject: "",
        body: "",
        ctaText: "",
        ctaUrl: "",
      })
      setUploadedImages([])
      fetchCampaigns()
    }

    setCreating(false)
  }

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "scheduled":
        return "info"
      case "sent":
        return "success"
      case "completed":
        return "default"
      default:
        return "secondary"
    }
  }

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case "email":
        return Mail
      case "push":
        return Bell
      case "social":
        return Share2
      default:
        return Mail
    }
  }

  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage marketing campaigns
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create an email, push notification, or social media campaign
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    placeholder="Monthly Newsletter"
                    value={newCampaign.title}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value: CampaignType) =>
                      setNewCampaign({ ...newCampaign, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </span>
                      </SelectItem>
                      <SelectItem value="push">
                        <span className="flex items-center gap-2">
                          <Bell className="h-4 w-4" /> Push Notification
                        </span>
                      </SelectItem>
                      <SelectItem value="social">
                        <span className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" /> Social Media
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newCampaign.type === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Your subject line"
                    value={newCampaign.subject}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, subject: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="body">Content</Label>
                <Textarea
                  id="body"
                  placeholder="Write your campaign content..."
                  value={newCampaign.body}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, body: e.target.value })
                  }
                  className="min-h-[150px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    placeholder="Learn More"
                    value={newCampaign.ctaText}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, ctaText: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaUrl">CTA Button URL</Label>
                  <Input
                    id="ctaUrl"
                    placeholder="https://..."
                    value={newCampaign.ctaUrl}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, ctaUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop images or click to upload
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button asChild variant="outline" size="sm">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      Choose Files
                    </label>
                  </Button>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} loading={creating}>
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter((c) => c.status === "sent" || c.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Campaigns List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading campaigns...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first campaign to reach your subscribers
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type)
                return (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{campaign.title}</h3>
                              <Badge variant={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(campaign.created_at).toLocaleDateString()}
                              {campaign.images && campaign.images.length > 0 && (
                                <span className="ml-2">
                                  <ImageIcon className="h-3 w-3 inline mr-1" />
                                  {campaign.images.length} image(s)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {campaign.status === "draft" && (
                            <Button size="sm" variant="outline">
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <div className="space-y-4">
            {filteredCampaigns.filter((c) => c.status === "draft").map((campaign) => {
              const TypeIcon = getTypeIcon(campaign.type)
              return (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Draft - {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <div className="text-center py-8 text-muted-foreground">
            No scheduled campaigns
          </div>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <div className="space-y-4">
            {filteredCampaigns.filter((c) => c.status === "sent" || c.status === "completed").map((campaign) => {
              const TypeIcon = getTypeIcon(campaign.type)
              return (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sent {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Opens: </span>
                        <span className="font-medium">{campaign.stats?.opened || 0}</span>
                        <span className="text-muted-foreground ml-3">Clicks: </span>
                        <span className="font-medium">{campaign.stats?.clicked || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
