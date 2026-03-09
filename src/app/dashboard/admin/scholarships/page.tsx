
"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminScholarships() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const scholarshipsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "scholarships");
  }, [db, user]);

  const { data: scholarships, isLoading } = useCollection(scholarshipsQuery);

  const [newScholarship, setNewScholarship] = useState({
    name: "",
    description: "",
    eligibility: "",
    amount: "",
    deadline: "",
    category: "Merit-Based"
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    addDocumentNonBlocking(collection(db, "scholarships"), {
      ...newScholarship,
      amount: Number(newScholarship.amount.replace(/[^0-9.-]+/g,"")) || 0,
      adminId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setIsAddOpen(false);
    setNewScholarship({ name: "", description: "", eligibility: "", amount: "", deadline: "", category: "Merit-Based" });
    toast({ title: "Scholarship Added", description: "The new listing is now public." });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "scholarships", id));
    toast({ variant: "destructive", title: "Deleted", description: "Scholarship has been removed." });
  };

  const filteredScholarships = scholarships?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Manage Scholarships</h1>
          <p className="text-muted-foreground mt-1">Create and maintain your scholarship catalog.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Scholarship
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Add New Scholarship</DialogTitle>
                <DialogDescription>Fill in the details for the new scholarship program.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Scholarship Name</Label>
                  <Input id="name" value={newScholarship.name} onChange={(e) => setNewScholarship({...newScholarship, name: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" value={newScholarship.description} onChange={(e) => setNewScholarship({...newScholarship, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (Numbers only)</Label>
                    <Input id="amount" placeholder="5000" value={newScholarship.amount} onChange={(e) => setNewScholarship({...newScholarship, amount: e.target.value})} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" value={newScholarship.deadline} onChange={(e) => setNewScholarship({...newScholarship, deadline: e.target.value})} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cat">Category</Label>
                  <Select onValueChange={(val) => setNewScholarship({...newScholarship, category: val})} defaultValue="Merit-Based">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Merit-Based">Merit-Based</SelectItem>
                      <SelectItem value="Need-Based">Need-Based</SelectItem>
                      <SelectItem value="Service-Based">Service-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="elig">Eligibility Criteria</Label>
                  <Input id="elig" value={newScholarship.eligibility} onChange={(e) => setNewScholarship({...newScholarship, eligibility: e.target.value})} required />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit">Save Listing</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by name or category..." 
          className="pl-10" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading scholarships...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scholarship Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScholarships.length > 0 ? (
                  filteredScholarships.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell className="text-emerald-600 font-bold">${s.amount?.toLocaleString()}</TableCell>
                      <TableCell>{s.deadline}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      No scholarships found.
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
