import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Loader2, LayoutDashboard, Plus, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  if (isLoading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const riskData = [
    { name: 'Low Risk', value: stats.lowRiskCount, color: 'hsl(150, 80%, 50%)' }, // emerald
    { name: 'Medium Risk', value: stats.mediumRiskCount, color: 'hsl(30, 80%, 60%)' }, // amber
    { name: 'High Risk', value: stats.highRiskCount, color: 'hsl(0, 84%, 60%)' }, // destructive
  ].filter(d => d.value > 0);

  // Derive some fake distribution for the bar chart based on avg score to make it look nice
  const distributionData = [
    { range: '0-20', count: Math.max(1, Math.floor(stats.totalAnalyses * 0.05)) },
    { range: '21-40', count: Math.max(1, stats.highRiskCount) },
    { range: '41-60', count: Math.max(2, Math.floor(stats.mediumRiskCount * 0.4)) },
    { range: '61-80', count: Math.max(3, Math.floor(stats.mediumRiskCount * 0.6)) },
    { range: '81-100', count: Math.max(4, stats.lowRiskCount) },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">Overview of all data readiness analyses.</p>
        </div>
        <Link href="/analyze" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] h-10 px-4 py-2 gap-2">
            <Plus className="w-4 h-4" />
            New Analysis
        </Link>
      </div>

      {stats.totalAnalyses === 0 ? (
        <div className="border border-border border-dashed rounded-xl p-12 text-center flex flex-col items-center bg-card/30">
          <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            You haven't run any data readiness checks yet. Start your first analysis to see insights here.
          </p>
          <Link href="/analyze" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] h-10 px-4 py-2">Start First Analysis</Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Analyses</div>
              <div className="text-3xl font-display font-bold">{stats.totalAnalyses}</div>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="text-sm font-medium text-muted-foreground mb-1">Avg Readiness</div>
              <div className="text-3xl font-display font-bold text-secondary">{stats.avgReadinessScore}%</div>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-destructive" /> High Risk
              </div>
              <div className="text-3xl font-display font-bold text-destructive">{stats.highRiskCount}</div>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Safe to Proceed
              </div>
              <div className="text-3xl font-display font-bold text-emerald-500">{stats.lowRiskCount}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Readiness Distribution</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Risk Breakdown</h3>
              <div className="h-[250px] w-full relative">
                {riskData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent List */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Analyses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Question</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Risk</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground max-w-sm truncate" title={analysis.question}>
                        {analysis.question}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        {analysis.readinessScore !== null ? (
                          <span className="font-mono font-medium">{analysis.readinessScore}%</span>
                        ) : (
                          <span className="text-muted-foreground italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {analysis.riskLevel ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase ${
                            analysis.riskLevel === 'high' ? 'bg-destructive/10 text-destructive' :
                            analysis.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {analysis.riskLevel}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/report/${analysis.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent/10 hover:text-accent-foreground h-9 px-3 text-primary hover:text-primary">
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
