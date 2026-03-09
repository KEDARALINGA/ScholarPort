
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Phone, User, Building2, BookOpen, Wallet, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullname') as string;
    const phone = formData.get('phone') as string;
    const college = formData.get('college') as string;
    const course = formData.get('course') as string;
    const income = Number(formData.get('income')?.toString().replace(/[^0-9.-]+/g,"")) || 0;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create student profile in Firestore
      await setDoc(doc(db, "studentProfiles", user.uid), {
        id: user.uid,
        fullName,
        email,
        phoneNumber: phone,
        collegeName: college,
        course,
        familyIncome: income,
        documentIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Welcome to ScholarPort!",
      });
      router.push("/dashboard/student");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <GraduationCap className="h-8 w-8" />
            </div>
            <span className="text-3xl font-bold text-primary font-headline">ScholarPort</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create Student Account</h1>
          <p className="text-muted-foreground mt-2">Join ScholarPort to access world-class scholarships</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>Please provide accurate information to check your eligibility.</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="fullname" id="fullname" placeholder="John Doe" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="email" id="email" type="email" placeholder="john@example.com" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="phone" id="phone" placeholder="+1 (555) 000-0000" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="college" id="college" placeholder="Harvard University" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Current Course</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="course" id="course" placeholder="B.S. Computer Science" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Annual Family Income</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="income" id="income" placeholder="e.g. 50000" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input name="password" id="password" type="password" placeholder="Create a strong password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full text-lg h-12" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Complete Registration
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
