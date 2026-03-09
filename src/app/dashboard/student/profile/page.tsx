"use client";

import { useState } from "react";
import { User, Mail, Phone, Loader2, Save, Sparkles, BookCheck, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfile() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const profileRef = useMemoFirebase(() => 
    user?.uid ? doc(db, "studentProfiles", user.uid) : null,
    [db, user?.uid]
  );

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profileRef) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      fullName: formData.get("fullName"),
      phoneNumber: formData.get("phoneNumber"),
      academicBackground: formData.get("academicBackground"),
      futureGoals: formData.get("futureGoals"),
      updatedAt: serverTimestamp(),
    };

    updateDocumentNonBlocking(profileRef, updates);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your academic and personal details have been saved for the AI Assistant.",
      });
    }, 500);
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) return <div className="p-10 text-center">Profile not found. Please log in again.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-32 bg-primary/10 rounded-xl border border-primary/20 overflow-hidden">
        <div className="absolute -bottom-12 left-8">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={`https://picsum.photos/seed/${profile.id}/100/100`} />
            <AvatarFallback>{profile.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-8">
        <h1 className="text-3xl font-bold">{profile.fullName}</h1>
        <p className="text-muted-foreground">{profile.course} Scholar</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2 shadow-sm border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              General Information
            </CardTitle>
            <CardDescription>Contact and institution details.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.fullName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={profile.email} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" defaultValue={profile.phoneNumber} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College / University</Label>
              <Input id="college" value={profile.collegeName} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Sparkles className="h-5 w-5" />
              AI Assistant Context
            </CardTitle>
            <CardDescription>Details used by our AI to draft your Statement of Purpose (SOP).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academicBackground" className="flex items-center gap-2">
                <BookCheck className="h-4 w-4" /> Academic Background & Achievements
              </Label>
              <Textarea 
                id="academicBackground" 
                name="academicBackground" 
                placeholder="List major achievements, GPA, research, or honors..." 
                className="min-h-[120px]"
                defaultValue={profile.academicBackground || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="futureGoals" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Future Career & Academic Aspirations
              </Label>
              <Textarea 
                id="futureGoals" 
                name="futureGoals" 
                placeholder="Describe your long-term goals and how your current studies align..." 
                className="min-h-[120px]"
                defaultValue={profile.futureGoals || ""}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save My Context
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}