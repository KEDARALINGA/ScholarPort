
"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, Clock } from "lucide-react";

export default function StudentApplications() {
  const { user } = useUser();
  const db = useFirestore();

  const appsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    // We filter by studentId to match the security rules
    return query(
      collection(db, "applications"),
      where("studentId", "==", user.uid)
    );
  }, [db, user?.uid]);

  const { data: applications, isLoading } = useCollection(appsQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the progress of your scholarship submissions.</p>
      </div>

      <div className="grid gap-6">
        {applications && applications.length > 0 ? (
          applications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className={`w-2 md:w-3 ${
                  app.status === 'Approved' ? 'bg-emerald-500' : 
                  app.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{app.scholarshipName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {app.category}
                        </span>
                      </div>
                    </div>
                    <Badge variant={app.status === 'Approved' ? 'default' : app.status === 'Rejected' ? 'destructive' : 'secondary'} className="px-4 py-1 text-sm">
                      {app.status}
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 border text-sm italic text-muted-foreground line-clamp-3">
                    "{app.statementOfPurpose}"
                  </div>

                  {app.feedback && (
                    <div className="mt-4 p-3 bg-primary/5 rounded border border-primary/10 text-sm">
                      <p className="font-bold text-primary mb-1">Feedback from Reviewer:</p>
                      <p>{app.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <Clock className="h-12 w-12 text-muted/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No applications yet</h3>
            <p className="text-muted-foreground">Your submitted applications will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
