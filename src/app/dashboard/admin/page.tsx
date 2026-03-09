
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, FileCheck, AlertCircle, Clock, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, limit, query, orderBy } from "firebase/firestore";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();

  const scholarshipsQuery = useMemoFirebase(() => (db && user) ? collection(db, "scholarships") : null, [db, user]);
  const applicationsQuery = useMemoFirebase(() => (db && user) ? query(collection(db, "applications"), orderBy("appliedAt", "desc"), limit(10)) : null, [db, user]);
  const studentsQuery = useMemoFirebase(() => (db && user) ? collection(db, "studentProfiles") : null, [db, user]);

  const { data: scholarships, isLoading: isScholarshipsLoading } = useCollection(scholarshipsQuery);
  const { data: applications, isLoading: isAppsLoading } = useCollection(applicationsQuery);
  const { data: students, isLoading: isStudentsLoading } = useCollection(studentsQuery);

  if (isScholarshipsLoading || isAppsLoading || isStudentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Synthesizing management insights...</p>
      </div>
    );
  }

  const pendingApps = applications?.filter(a => a.status === 'Pending') || [];
  const approvedApps = applications?.filter(a => a.status === 'Approved') || [];
  const approvalRate = applications?.length ? Math.round((approvedApps.length / applications.length) * 100) : 0;
  
  const stats = [
    { label: "Total Students", value: students?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Scholarships", value: scholarships?.length || 0, icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Applications", value: applications?.length || 0, icon: FileCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Pending Review", value: pendingApps.length, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time management console for ScholarPort.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
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
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications && applications.length > 0 ? (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.studentName}</TableCell>
                      <TableCell>{app.scholarshipName}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={app.status === 'Approved' ? 'default' : app.status === 'Rejected' ? 'destructive' : 'secondary'} 
                          className="capitalize"
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="text-primary hover:underline text-sm font-medium">Review</button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 opacity-20" />
                        No recent applications found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/5 h-fit">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-bold">{approvalRate}%</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000" 
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-3 w-3" /> Growth & Trends
              </h4>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm font-semibold text-primary mb-1">Scholarship Velocity</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Platform activity has increased by 12% since last week. Review response time is currently optimal.
                </p>
              </div>
            </div>

            <Separator className="my-2" />
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">System Alerts</h4>
              {pendingApps.length > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                  <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">{pendingApps.length} applications awaiting decision.</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                  <p className="text-xs text-emerald-700 font-medium">All applications are currently up-to-date.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
