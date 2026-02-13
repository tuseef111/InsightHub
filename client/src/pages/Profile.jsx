import { useAuthStore } from "@/store/authStore"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Profile() {
  const { user, updateProfile } = useAuthStore()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    profession: user?.profession || "",
    gender: user?.gender || "",
    avatarUrl: user?.avatarUrl || ""
  }))
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const updated = await updateProfile(payload)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"])
    }
  })
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e)=>setForm(f=>({...f, firstName: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e)=>setForm(f=>({...f, lastName: e.target.value}))} />
            </div>
          </div>
          {/* <div className="space-y-2">
            <Label>Profession</Label>
            <Input value={form.profession} onChange={(e)=>setForm(f=>({...f, profession: e.target.value}))} />
          </div> */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender </Label>
              <select className="border rounded h-8 px-2" value={form.gender} onChange={(e)=>setForm(f=>({...f, gender: e.target.value}))}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Button onClick={()=>mutation.mutate(form)}>Save</Button> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Published</CardTitle>
        </CardHeader>
        <CardContent>
          <UserBlogs />
        </CardContent>
      </Card>
    </div>
  )
}

function UserBlogs() {
  const { data } = useQuery({
    queryKey: ["my-blogs"],
    queryFn: async () => {
      const { data } = await api.get("/blogs/mine")
      return data.blogs
    }
  })
  if (!data?.length) return <p className="text-sm text-muted-foreground">No blogs yet.</p>
  return (
    <ul className="space-y-2">
      {data.map(b => (
        <li key={b._id} className="text-sm">{b.title}</li>
      ))}
    </ul>
  )
}
