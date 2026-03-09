
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Eye, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const appsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "applications");
  }, [db, user]);

  const { data: applications, isLoading } = useCollection(appsQuery);

  const handleDecision = (id: string, status: 'Approved' | 'Rejected') => {
    if (!db || !user) return;
    
    const appRef = doc(db, "applications", id);
    updateDocumentNonBlocking(appRef, {
      status,
      decisionById: user.uid,
      decisionAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    toast({
      title: `Application ${status}`,
      description: `The student has been notified of the decision.`,
    });
  };

  const filteredApps = applications?.filter(app => 
    app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.scholarshipName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Applications Review</h1>
        <p className="text-muted-foreground mt-1">Make informed selection decisions for scholarship schemes.</p>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search student or scheme..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching applications...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead>Marks/GPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.studentName}</TableCell>
                      <TableCell>{app.scholarshipName}</TableCell>
                      <TableCell>{app.academicMarks}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={app.status === 'Approved' ? 'default' : app.status === 'Rejected' ? 'destructive' : 'secondary'}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Review</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Scholarship Application Review</DialogTitle>
                              <DialogDescription>Review student credentials and AI-assisted SOP.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                <div>
                                  <p className="text-muted-foreground">Student</p>
                                  <p className="font-bold">{app.studentName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Application Category</p>
                                  <p className="font-bold">{app.category}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold mb-2">Statement of Purpose</h4>
                                <div className="p-4 bg-muted/30 rounded border text-sm leading-relaxed whitespace-pre-wrap">
                                  {app.statementOfPurpose}
                                </div>
                              </div>
                              {app.status === 'Pending' && (
                                <div className="flex justify-end gap-3 pt-6 border-t">
                                  <Button variant="outline" className="text-rose-600 hover:bg-rose-50" onClick={() => handleDecision(app.id, 'Rejected')}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                  </Button>
                                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleDecision(app.id, 'Approved')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      No matching applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
