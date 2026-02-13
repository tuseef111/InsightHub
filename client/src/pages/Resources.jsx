import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Search, ExternalLink, Heart, Loader2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { useForm as useEditForm } from "react-hook-form"

const resourceSchema = z.object({
  url: z.string().url("Invalid URL").refine((urlStr) => {
    try {
      const u = new URL(urlStr)
      const host = u.hostname.toLowerCase()
      const path = u.pathname.toLowerCase()
      console.log("host",host)
      if (host === "medium.com" || host === "dev.to" || host === "hashnode.com" || host === "github.com" || host === "vercel.com/blog") return true
      return false
    } catch {
      return false
    }
  }, "Domain not allowed"),
  collectionId: z.string().min(1, "Collection is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.string().optional(), // Comma separated
})

export default function Resources() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterCollection, setFilterCollection] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterFavorite, setFilterFavorite] = useState("all")
  const [filterDomain, setFilterDomain] = useState("all")
  const [errorMsg, setErrorMsg] = useState("")
  const queryClient = useQueryClient()

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await api.get("/collections")
      return data.collections
    }
  })

  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources", search, filterCollection, filterDifficulty, filterFavorite, filterDomain],
    queryFn: async () => {
      const { data } = await api.get("/resources", {
        params: { 
          q: search, 
          collectionId: filterCollection, 
          difficulty: filterDifficulty,
          favorite: filterFavorite,
          domain: filterDomain
        }
      })
      return data.resources
    },
  })
  const domainOptions = useMemo(() => {
    const s = new Set()
    ;(resources || []).forEach(r => { if (r.domain) s.add(r.domain) })
    return ["all", ...Array.from(s).sort()]
  }, [resources])

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/resources", {
        url: payload.url,
        collectionId: payload.collectionId,
        difficulty: payload.difficulty,
        tags: payload.tags ? payload.tags.split(",").map(t => t.trim()) : []
      })
      return data.resource
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"])
      setIsDialogOpen(false)
      reset()
      setErrorMsg("")
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || "Failed to add resource"
      setErrorMsg(msg)
    }
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, favorite }) => {
      await api.patch(`/resources/${id}/favorite`, { favorite })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"])
    },
  })
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/resources/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"])
    },
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, tags, difficulty }) => {
      const { data } = await api.patch(`/resources/${id}`, { 
        tags, 
        difficulty 
      })
      return data.resource
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"])
      setIsEditOpen(false)
    },
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const editForm = useEditForm({
    defaultValues: { tags: "", difficulty: "beginner" }
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      difficulty: "beginner",
    }
  })

  const onSubmit = (data) => {
    createMutation.mutate(data)
  }
  const onEditSubmit = (values) => {
    if (!editing?._id) return
    const tags = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : []
    updateMutation.mutate({ id: editing._id, tags, difficulty: values.difficulty })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Add a URL to fetch metadata and save to your collection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    {...register("url")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Allowed: medium.com, dev.to, hashnode.com, github.com, vercel.com/blog
                  </p>
                  {errors.url && (
                    <p className="text-sm text-red-500">{errors.url.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="collection">Collection</Label>
                  <Controller
                    name="collectionId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections?.map(c => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.collectionId && (
                    <p className="text-sm text-red-500">{errors.collectionId.message}</p>
                  )}
                  {(!collections || collections.length === 0) && (
                    <p className="text-xs text-muted-foreground">
                      No collections found. Create one first in Collections.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.difficulty && (
                    <p className="text-sm text-red-500">{errors.difficulty.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="react, frontend, guide"
                    {...register("tags")}
                  />
                </div>
              </div>
              <DialogFooter>
                {errorMsg && <p className="text-sm text-red-500 mr-auto">{errorMsg}</p>}
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Resource
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card p-4 rounded-lg border">
        <div className="flex-1">
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Select value={filterCollection} onValueChange={setFilterCollection}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Collections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections?.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterFavorite} onValueChange={setFilterFavorite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Favorites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Saved</SelectItem>
              <SelectItem value="false">Unsaved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              {domainOptions.map(d => (
                <SelectItem key={d} value={d}>{d === "all" ? "All Domains" : d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
         <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : resources?.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No resources found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources?.map((resource) => (
            <Card key={resource._id} className="flex flex-col overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {resource.image && (
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                )}
              </div>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-1">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {resource.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(Array.isArray(resource.tags) ? resource.tags : String(resource.tags || "").split(/[,\s]+/).filter(Boolean)).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center">
                    {resource.domain}
                  </span>
                  <Badge variant="outline" className="capitalize">{resource.difficulty}</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center border-t bg-muted/20 mt-auto">
                 <Button
                    variant="ghost"
                    size="sm"
                    className={resource.favorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}
                    onClick={() => toggleFavoriteMutation.mutate({ id: resource._id, favorite: !resource.favorite })}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${resource.favorite ? "fill-current" : ""}`} />
                    {resource.favorite ? "Saved" : "Save"}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditing(resource)
                      setIsEditOpen(true)
                      editForm.reset({ 
                        tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : String(resource.tags || ""), 
                        difficulty: resource.difficulty 
                      })
                    }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(resource._id)} disabled={deleteMutation.isPending}>
                      Delete
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update tags and difficulty.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input id="edit-tags" placeholder="react, frontend, guide" {...editForm.register("tags")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Controller
                  name="difficulty"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
