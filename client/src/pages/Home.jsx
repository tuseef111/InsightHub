import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Folder } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function Home() {
  const [q, setQ] = useState("")
  const { isAuthenticated } = useAuthStore()
  const { data: collections, isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await api.get("/collections")
      return data.collections
    },
    enabled: isAuthenticated
  })
  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data } = await api.get("/resources")
      return data.resources
    },
    enabled: isAuthenticated
  })
 
  return (
    <div className="grid grid-cols-1 gap-6">
      <main>
        <div className="flex items-center justify-end gap-3 mb-4">
          <div className="w-64">
            <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
        </div>
        <div className="space-y-6">
          {isAuthenticated && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collections?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resources?.length || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Recent Collections </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCollections ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (collections?.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collections.slice(0,6).map(c => (
                    <Card key={c._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{c.name}</div>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {c.resourceCount || 0} resources
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No collections yet.</div>
              ))}
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader>
              <CardTitle>Recent Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingResources ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-md border animate-pulse">
                      <div className="h-4 w-40 bg-muted rounded"></div>
                      <div className="mt-2 h-3 w-24 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (resources?.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {resources.slice(0,6).map(r => (
                    <Card key={r._id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline line-clamp-1">
                          {r.title}
                        </a>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{r.domain}</span>
                        <Badge variant="outline" className="capitalize">{r.difficulty}</Badge>
                        {r.favorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No resources yet.</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
