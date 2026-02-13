// import { useParams, Link } from "react-router-dom"
// import { useQuery } from "@tanstack/react-query"
// import { Loader2 } from "lucide-react"
// import api from "@/lib/api"
// import { Button } from "@/components/ui/button"

// export default function BlogDetail() {
//   const { id } = useParams()

//   const { data, isLoading } = useQuery({
//     queryKey: ["blog", id],
//     queryFn: async () => {
//       const { data } = await api.get(`/blogs/${id}`)
//       return data.blog
//     }
//   })

//   if (isLoading) {
//     return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
//   }

//   if (!data) {
//     return <div className="p-4">Not found</div>
//   }

//   return (
//     <article className="max-w-3xl">
//       <h1 className="text-3xl font-bold">{data.title}</h1>
//       <p className="mt-2 text-sm text-muted-foreground">
//         {data.author?.name} · {new Date(data.createdAt).toLocaleDateString()}
//       </p>
//       {data.coverImage ? (
//         <img src={data.coverImage} alt="" className="my-4 h-64 w-full rounded object-cover" />
//       ) : null}
//       <div className="prose max-w-none dark:prose-invert">
//         {data.content}
//       </div>
//       <div className="mt-6">
//         <Link to="/home"><Button variant="outline">Back to Home</Button></Link>
//       </div>
//     </article>
//   )
// }

