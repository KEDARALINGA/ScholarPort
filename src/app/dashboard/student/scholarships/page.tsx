
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  DollarSign, 
  Bookmark, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Info,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { summarizeScholarshipDescription } from "@/ai/flows/scholarship-description-summarizer";
import { useToast } from "@/hooks/use-toast";

export default function ScholarshipCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<string | null>(null);
  
  const db = useFirestore();
  const { toast } = useToast();

  const scholarshipsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "scholarships"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: scholarships, isLoading } = useCollection(scholarshipsQuery);

  const handleSummarize = async (description: string, id: string) => {
    setSummarizingId(id);
    try {
      const result = await summarizeScholarshipDescription({ scholarshipDescription: description });
      setActiveSummary(result.summary);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate summary at this time."
      });
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredScholarships = scholarships?.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Scholarship Catalog</h1>
          <p className="text-muted-foreground mt-1">Discover opportunities that match your potential.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={setSelectedCategory} defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schemes</SelectItem>
              <SelectItem value="Merit-Based">Merit-Based</SelectItem>
              <SelectItem value="Need-Based">Need-Based</SelectItem>
              <SelectItem value="Service-Based">Service-Based</SelectItem>
              <SelectItem value="Diversity/Inclusion">Diversity/Inclusion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading scholarships...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.length > 0 ? (
            filteredScholarships.map((s) => (
              <Card key={s.id} className="flex flex-col hover:shadow-lg transition-all border-primary/5 group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {s.category}
                    </Badge>
                    <Dialog onOpenChange={(open) => !open && setActiveSummary(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-accent hover:bg-accent/10"
                          onClick={() => handleSummarize(s.description, s.id)}
                        >
                          <Zap className="h-4 w-4 fill-current" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-accent" />
                            AI Quick Summary
                          </DialogTitle>
                          <DialogDescription>
                            Condensing key requirements for <strong>{s.name}</strong>.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          {summarizingId === s.id ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                              <Loader2 className="h-6 w-6 animate-spin text-accent" />
                              <p className="text-sm text-muted-foreground animate-pulse">AI is reading the fine print...</p>
                            </div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert">
                              {activeSummary ? (
                                <div className="bg-accent/5 p-4 rounded-lg border border-accent/20 text-sm whitespace-pre-wrap leading-relaxed">
                                  {activeSummary}
                                </div>
                              ) : (
                                <p>Failed to load summary. Please check the full description.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardTitle className="line-clamp-1">{s.name}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-foreground">
                        ${s.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-rose-500" />
                      <span>{s.deadline ? new Date(s.deadline).toLocaleDateString() : 'Rolling'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      <Info className="h-3 w-3" /> Eligibility
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-xs">{s.eligibility}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-bold" asChild>
                    <Link href={`/dashboard/student/apply/${s.id}`}>
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <Search className="h-12 w-12 text-muted/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No schemes match your filter</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or category selection.</p>
              <Button variant="link" onClick={() => {setSearchTerm(""); setSelectedCategory("all")}}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
