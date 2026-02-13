import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts"
import api from "@/lib/api"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await api.get("/analytics")
      return data
    },
  })

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard & Analytics</h1>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.totalCollections} collections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.favorites}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.favorites / analytics.totalResources) * 100)}% of total resources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Tag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{analytics.topTags[0]?.name}</div>
            <p className="text-xs text-muted-foreground">
              Used in {analytics.topTags[0]?.count} resources
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Resources per Collection Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resources by Collection</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.resourcesPerCollection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Domains */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Domains</CardTitle>
            <CardDescription>
              Where your resources are coming from.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {analytics.topDomains.map((domain, i) => (
                <div key={domain.name} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-4 text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{domain.name}</p>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${(domain.count / analytics.totalResources) * 100}%` }} 
                      />
                    </div>
                  </div>
                  <div className="font-medium text-sm ml-4">{domain.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Tags</CardTitle>
            <CardDescription>
              Most frequently used tags across your collections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topTags.map((tag) => (
                <div 
                  key={tag.name} 
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium capitalize">{tag.name}</span>
                  <span className="text-sm text-muted-foreground">{tag.count} resources</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
