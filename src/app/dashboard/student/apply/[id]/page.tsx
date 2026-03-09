
"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ChevronRight, 
  GraduationCap, 
  Info, 
  Loader2, 
  Sparkles,
  ClipboardCheck,
  FileBadge,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { SopAssistant } from "@/components/sop-assistant";

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const scholarshipId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const scholarshipRef = useMemoFirebase(() => 
    scholarshipId ? doc(db, "scholarships", scholarshipId) : null,
    [db, scholarshipId]
  );
  
  const studentRef = useMemoFirebase(() => 
    user?.uid ? doc(db, "studentProfiles", user.uid) : null,
    [db, user?.uid]
  );

  const { data: scholarship, isLoading: isScholarshipLoading } = useDoc(scholarshipRef);
  const { data: student, isLoading: isStudentLoading } = useDoc(studentRef);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    academicMarks: "",
    category: "",
    sop: "",
  });

  if (isScholarshipLoading || isStudentLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading application portal...</p>
      </div>
    );
  }

  if (!scholarship) return <div className="p-10 text-center">Scholarship not found.</div>;
  if (!student) return <div className="p-10 text-center">Please complete your profile before applying.</div>;

  const isProfileIncomplete = !student.academicBackground || !student.futureGoals;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "applications"), {
        scholarshipId: scholarship.id,
        scholarshipName: scholarship.name,
        studentId: student.id,
        studentName: student.fullName,
        academicMarks: Number(formData.academicMarks) || formData.academicMarks,
        category: formData.category,
        statementOfPurpose: formData.sop,
        status: "Pending",
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast({
        title: "Application Submitted!",
        description: `Your submission for ${scholarship.name} is now pending review.`,
      });
      router.push("/dashboard/student/applications");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "Failed to submit application.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 px-4 py-2 rounded-full">
          <span className={`flex items-center gap-1.5 ${step >= 1 ? "text-primary font-bold" : ""}`}>
            <UserCheck className="h-4 w-4" /> Credentials
          </span>
          <ChevronRight className="h-4 w-4 opacity-30" />
          <span className={`flex items-center gap-1.5 ${step >= 2 ? "text-primary font-bold" : ""}`}>
            <Sparkles className="h-4 w-4" /> SOP Draft
          </span>
          <ChevronRight className="h-4 w-4 opacity-30" />
          <span className={`flex items-center gap-1.5 ${step >= 3 ? "text-primary font-bold" : ""}`}>
            <ClipboardCheck className="h-4 w-4" /> Review
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {step === 1 && (
            <Card className="border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Academic Verification</CardTitle>
                <CardDescription>Step 1 of 3: Provide your current academic standing.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="marks">Cumulative GPA / Aggregate Marks</Label>
                    <Input 
                      id="marks" 
                      placeholder="e.g. 3.9 / 4.0 or 85%" 
                      required 
                      value={formData.academicMarks}
                      onChange={(e) => setFormData({...formData, academicMarks: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Scholarship Category</Label>
                    <Select onValueChange={(val) => setFormData({...formData, category: val})} value={formData.category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relevant category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Merit-Based">Merit-Based</SelectItem>
                        <SelectItem value="Need-Based">Need-Based</SelectItem>
                        <SelectItem value="Diversity/Inclusion">Diversity/Inclusion</SelectItem>
                        <SelectItem value="Research-Focused">Research-Focused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 p-4 border-2 border-dashed rounded-lg bg-muted/30">
                  <Label htmlFor="income-proof" className="flex items-center gap-2">
                    <FileBadge className="h-4 w-4" /> Supporting Evidence (Transcripts/ID)
                  </Label>
                  <Input id="income-proof" type="file" className="cursor-pointer" />
                  <p className="text-xs text-muted-foreground">PDF or JPG formats only. Max 5MB.</p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t p-6 flex justify-end">
                <Button 
                  disabled={!formData.academicMarks || !formData.category} 
                  onClick={() => setStep(2)}
                >
                  Save & Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Statement of Purpose</CardTitle>
                <CardDescription>Step 2 of 3: Elaborate on your motivations and goals.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {isProfileIncomplete && (
                  <Alert variant="destructive" className="bg-rose-50 border-rose-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Incomplete</AlertTitle>
                    <AlertDescription>
                      Our AI works best when your profile is filled out. 
                      <Button variant="link" className="p-0 h-auto text-xs ml-1 font-bold underline" onClick={() => router.push("/dashboard/student/profile")}>
                        Update Profile Goals
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="sop">Your Statement (Min. 300 words recommended)</Label>
                  <Textarea 
                    id="sop" 
                    placeholder="Describe your journey, why you chose this field, and how this scholarship changes your trajectory..." 
                    className="min-h-[300px] leading-relaxed"
                    required
                    value={formData.sop}
                    onChange={(e) => setFormData({...formData, sop: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t p-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  disabled={!formData.sop} 
                  onClick={() => setStep(3)}
                >
                  Review Application <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Final Review</CardTitle>
                <CardDescription>Step 3 of 3: Verify your submission before finalizing.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-4 w-4" /> Personal Details
                    </h4>
                    <div className="space-y-1">
                      <p className="text-lg font-bold">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">{student.course} @ {student.collegeName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <FileBadge className="h-4 w-4" /> Application Data
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">GPA/Marks:</span>
                      <span className="font-bold">{formData.academicMarks}</span>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-bold">{formData.category}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Statement of Purpose</h4>
                  <div className="p-6 bg-muted/30 rounded-xl border italic text-sm text-muted-foreground leading-relaxed">
                    {formData.sop}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t p-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Modify Draft</Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8" 
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Submit Application Now
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <aside className="lg:w-1/3 space-y-6">
          {step === 2 && (
            <SopAssistant 
              scholarshipName={scholarship.name}
              scholarshipDescription={scholarship.description}
              studentProfile={{
                academicBackground: student.academicBackground || student.course,
                extracurricularActivities: "Based on verified university enrollment",
                futureGoals: student.futureGoals || "Advancing career in field of study"
              }}
              onSopGenerated={(sop) => setFormData({...formData, sop})}
            />
          )}

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <CardTitle className="text-sm">Submission Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-4 text-muted-foreground">
              <p>Once submitted, applications are locked for editing. Decisions are typically reached within 14 business days.</p>
              <div className="p-3 bg-white rounded border border-primary/10 space-y-2">
                <span className="font-bold text-primary block">Eligible Award:</span>
                <span className="text-2xl font-black text-accent">${scholarship.amount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-bold block text-foreground">Next Step:</span>
                <span>Wait for administrative review notifications.</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
