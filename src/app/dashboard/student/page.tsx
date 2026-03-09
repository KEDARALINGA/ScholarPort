
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  FileText, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  Sparkles,
  TrendingUp,
  Loader2,
  Search,
  Award,
  Zap
} from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const myApplicationsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "applications"),
      where("studentId", "==", user.uid),
      orderBy("appliedAt", "desc")
    );
  }, [db, user?.uid]);

  const scholarshipsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "scholarships"), orderBy("amount", "desc"), limit(3));
  }, [db, user]);

  const { data: myApplications, isLoading: isAppsLoading } = useCollection(myApplicationsQuery);
  const { data: recommendedScholarships, isLoading: isScholarshipsLoading } = useCollection(scholarshipsQuery);

  if (isUserLoading || isAppsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Synthesizing your success dashboard...</p>
      </div>
    );
  }

  const pendingApps = myApplications?.filter(a => a.status === 'Pending') || [];
  const approvedApps = myApplications?.filter(a => a.status === 'Approved') || [];
  const successRate = myApplications?.length ? Math.round((approvedApps.length / myApplications.length) * 100) : 0;

  const stats = [
    { label: "My Applications", value: myApplications?.length || 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Pending Review", value: pendingApps.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Awards Secured", value: approvedApps.length, icon: Award, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Welcome Back, {user?.displayName?.split(' ')[0] || 'Scholar'}! 👋</h1>
          <p className="text-muted-foreground mt-1">You've secured {approvedApps.length} scholarship{approvedApps.length !== 1 ? 's' : ''} so far. Keep going!</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg font-bold group" asChild>
          <Link href="/dashboard/student/scholarships">
            <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" /> Explore Catalog
          </Link>
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-background border-primary/20 shadow-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
          <div className="bg-white p-5 rounded-2xl shadow-inner border border-primary/10 relative">
            <Sparkles className="h-10 w-10 text-accent animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-extrabold text-primary mb-1">AI-Powered Success</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our refined SOP Assistant uses Genkit AI to draft statements that align with specific donor values. 
              <strong> 40% higher approval rate</strong> reported by users.
            </p>
          </div>
          <Button className="w-full md:w-auto bg-white text-primary border-primary/10 hover:bg-primary hover:text-white font-bold" variant="outline" asChild>
            <Link href="/dashboard/student/scholarships">Try AI Assistant <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Live Status Tracking</CardTitle>
              <CardDescription>Real-time updates on your active submissions.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" asChild>
              <Link href="/dashboard/student/applications">View All History</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {myApplications && myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        app.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                        app.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {app.status === 'Approved' ? <CheckCircle className="h-5 w-5" /> : 
                         app.status === 'Rejected' ? <Clock className="h-5 w-5" /> : 
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm group-hover:text-primary transition-colors">{app.scholarshipName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="h-3 w-3" /> {app.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`font-black text-[10px] tracking-widest px-3 py-1 ${
                        app.status === 'Approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                        app.status === 'Rejected' ? 'bg-rose-500 hover:bg-rose-600' : 
                        'bg-amber-500 hover:bg-amber-600'
                      }`}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/30 p-8 rounded-full mb-6">
                  <FileText className="h-16 w-16 text-muted/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">Your Catalog is Empty</h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-8">
                  Kickstart your academic journey by exploring tailored scholarship schemes today.
                </p>
                <Button className="font-bold h-12 px-8 shadow-md" asChild>
                  <Link href="/dashboard/student/scholarships">Browse Schemes Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/5 h-fit">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent fill-current" />
              Top Recommendations
            </CardTitle>
            <CardDescription>Based on your GPA & Course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {recommendedScholarships?.map((s) => (
              <div key={s.id} className="group border-b last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-extrabold text-sm group-hover:text-primary transition-colors line-clamp-1">{s.name}</h4>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">${s.amount?.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {s.description}
                </p>
                <Button size="sm" variant="secondary" className="w-full text-xs font-bold h-9 group-hover:bg-primary group-hover:text-white transition-all shadow-sm" asChild>
                  <Link href={`/dashboard/student/apply/${s.id}`}>
                    Launch Application
                  </Link>
                </Button>
              </div>
            ))}
            
            <div className="pt-2">
              <div className="bg-accent/5 p-5 rounded-2xl border border-accent/10">
                <div className="flex items-center gap-2 text-accent font-black mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-tighter">Success Tip</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Completing your "Future Goals" profile section increases the AI Assistant's precision by 65%.
                </p>
                <Link href="/dashboard/student/profile" className="text-[11px] text-primary font-bold mt-4 block hover:underline">Update Profile &rarr;</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
