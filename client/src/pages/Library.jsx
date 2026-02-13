// import { useQuery } from "@tanstack/react-query"
// import api from "@/lib/api"
// import { Loader2 } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export default function Library() {
//   const { data, isLoading } = useQuery({
//     queryKey: ["collections"],
//     queryFn: async () => {
//       const { data } = await api.get("/collections")
//       return data.collections
//     }
//   })

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Library</h1>
//       {isLoading ? (
//         <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {data?.map((c) => (
//             <Card key={c._id}>
//               <CardHeader>
//                 <CardTitle>{c.name}</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm text-muted-foreground">Resources: {c.resourceCount}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

