// import { useState } from "react"
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { Plus, Trash2, Folder, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import api from "@/lib/api"

// const collectionSchema = z.object({
//   name: z.string().min(1, "Name is required").max(50, "Name is too long"),
// })

// export default function Collections() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isEditOpen, setIsEditOpen] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [search, setSearch] = useState("")
//   const queryClient = useQueryClient()

//   const { data: collections, isLoading } = useQuery({
//     queryKey: ["collections"],
//     queryFn: async () => {
//       const { data } = await api.get("/collections")
//       return data.collections
//     },
//   })
//   const filtered = (collections || []).filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
//   const createMutation = useMutation({
//     mutationFn: async (newCollection) => {
//       const { data } = await api.post("/collections", newCollection)
//       return data.collection
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["collections"])
//       setIsDialogOpen(false)
//       reset()
//     },
//   })

//   const deleteMutation = useMutation({
//     mutationFn: async (id) => {
//       await api.delete(`/collections/${id}`)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["collections"])
//     },
//   })
//   const updateMutation = useMutation({
//     mutationFn: async ({ id, name }) => {
//       const { data } = await api.patch(`/collections/${id}`, { name })
//       return data.collection
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["collections"])
//       setIsEditOpen(false)
//       resetEdit()
//     },
//   })

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(collectionSchema),
//   })
//   const {
//     register: registerEdit,
//     handleSubmit: handleSubmitEdit,
//     reset: resetEdit,
//     formState: { errors: editErrors },
//   } = useForm({
//     resolver: zodResolver(collectionSchema),
//     defaultValues: { name: "" }
//   })

//   const onSubmit = (data) => {
//     createMutation.mutate(data)
//   }
//   const onEditSubmit = (data) => {
//     if (!editing?._id) return
//     updateMutation.mutate({ id: editing._id, name: data.name })
//   }

//   if (isLoading) {
//     return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
//         <div className="w-64">
//           <Input placeholder="Search collections..." value={search} onChange={(e)=>setSearch(e.target.value)} />
//         </div>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               New Collection
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Create Collection</DialogTitle>
//               <DialogDescription>
//                 Create a new collection to organize your resources.
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <div className="grid gap-4 py-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="name">Name</Label>
//                   <Input
//                     id="name"
//                     placeholder="e.g., React Ecosystem"
//                     {...register("name")}
//                   />
//                   {errors.name && (
//                     <p className="text-sm text-red-500">{errors.name.message}</p>
//                   )}
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button type="submit" disabled={createMutation.isPending}>
//                   {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                   Create
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {filtered?.map((collection) => (
//           <Card key={collection._id}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {collection.name}
//               </CardTitle>
//               <Folder className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{collection.resourceCount}</div>
//               <p className="text-xs text-muted-foreground">
//                 resources
//               </p>
//             </CardContent>
//             <CardFooter>
//               <div className="grid grid-cols-2 gap-2 w-full">
//               <Button 
//                 variant="destructive" 
//                 size="sm" 
//                 className="w-full"
//                 onClick={() => deleteMutation.mutate(collection._id)}
//                 disabled={deleteMutation.isPending}
//               >
//                 {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
//                 Delete
//               </Button>
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 className="w-full"
//                 onClick={() => { setEditing(collection); setIsEditOpen(true); resetEdit({ name: collection.name }) }}
//                 disabled={updateMutation.isPending}
//               >
//                 Rename
//               </Button>
//               </div>
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Rename Collection</DialogTitle>
//             <DialogDescription>
//               Update the name of this collection.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmitEdit(onEditSubmit)}>
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="edit-name">Name</Label>
//                 <Input id="edit-name" placeholder="New name" {...registerEdit("name")} />
//                 {editErrors.name && <p className="text-sm text-red-500">{editErrors.name.message}</p>}
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="submit" disabled={updateMutation.isPending}>
//                 {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Save
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }










import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Folder, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import api from "@/lib/api"

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
})

export default function Collections() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState(null)

  const queryClient = useQueryClient()

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await api.get("/collections")
      return data.collections
    },
  })

  const filtered = (collections || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: async (newCollection) => {
      const { data } = await api.post("/collections", newCollection)
      return data.collection
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collections"])
      setIsDialogOpen(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/collections/${id}`)
    },
    onMutate: (id) => {
      setDeletingId(id)
    },
    onSettled: () => {
      setDeletingId(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collections"])
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const { data } = await api.patch(`/collections/${id}`, { name })
      return data.collection
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collections"])
      setIsEditOpen(false)
      resetEdit()
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(collectionSchema),
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: { name: "" },
  })

  const onSubmit = (data) => {
    createMutation.mutate(data)
  }

  const onEditSubmit = (data) => {
    if (!editing?._id) return
    updateMutation.mutate({ id: editing._id, name: data.name })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>

        <div className="w-64">
          <Input
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your resources.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., React Ecosystem"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((collection) => (
          <Card key={collection._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {collection.name}
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {collection.resourceCount}
              </div>
              <p className="text-xs text-muted-foreground">resources</p>
            </CardContent>

            <CardFooter>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => deleteMutation.mutate(collection._id)}
                  disabled={deletingId === collection._id}
                >
                  {deletingId === collection._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEditing(collection)
                    setIsEditOpen(true)
                    resetEdit({ name: collection.name })
                  }}
                  disabled={updateMutation.isPending}
                >
                  Rename
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Collection</DialogTitle>
            <DialogDescription>
              Update the name of this collection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="New name"
                  {...registerEdit("name")}
                />
                {editErrors.name && (
                  <p className="text-sm text-red-500">
                    {editErrors.name.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}