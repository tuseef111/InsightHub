// import { useQuery } from "@tanstack/react-query"
// import api from "@/lib/api"

// export default function Stats() {
//   const { data: collections } = useQuery({
//     queryKey: ["collections"],
//     queryFn: async () => {
//       const { data } = await api.get("/collections")
//       return data.collections
//     }
//   })
//   return (
//     <div className="space-y-2">
//       <h1 className="text-2xl font-bold">Stats</h1>
//       <p className="text-sm">Collections: {collections?.length || 0}</p>
//     </div>
//   )
// }

