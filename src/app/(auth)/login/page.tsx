
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, getDocs, query, limit } from "firebase/firestore";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = (role: 'student' | 'admin') => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (role === 'admin') {
        const adminRoleDoc = await getDoc(doc(db, 'roles_admin', user.uid));
        if (!adminRoleDoc.exists()) {
          throw new Error("You do not have administrative privileges.");
        }
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/student");
      }

      toast({
        title: "Login Successful",
        description: `Welcome back to your ${role} dashboard!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seedDemoData = async (role: 'student' | 'admin') => {
    setIsLoading(true);
    const email = role === 'admin' ? 'admin@scholarport.edu' : 'student@scholarport.edu';
    const password = 'password123';

    try {
      let user;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } catch (authError: any) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }

      if (role === 'admin') {
        await setDoc(doc(db, "roles_admin", user.uid), { adminUid: user.uid });
        await setDoc(doc(db, "adminProfiles", user.uid), {
          id: user.uid,
          fullName: "System Administrator",
          email: email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        const scholarshipCollection = collection(db, "scholarships");
        const existingScholarships = await getDocs(query(scholarshipCollection, limit(1)));
        
        if (existingScholarships.empty) {
          const sampleScholarships = [
            {
              name: "STEM Future Leaders Fund",
              description: "Full-ride scholarship for students pursuing engineering or computer science with a focus on sustainable global technology. Recipients will also receive mentorship from industry experts.",
              eligibility: "GPA 3.8+, STEM Major, demonstrable community leadership, underrepresented minority status preferred.",
              amount: 25000,
              category: "Merit-Based",
              deadline: "2025-12-15",
              adminId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            {
              name: "NextGen Creative Arts Award",
              description: "Financial support for exceptionally creative students in fine arts, digital media, or creative writing. Aimed at fostering the next generation of visual storytellers.",
              eligibility: "Portfolio of work, GPA 3.0+, reference from academic advisor or professional in the arts.",
              amount: 10000,
              category: "Service-Based",
              deadline: "2025-06-20",
              adminId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            {
              name: "Global Visionary Grant",
              description: "Supporting students who demonstrate exceptional promise in international relations or global health. This grant includes a funded internship at a partner NGO.",
              eligibility: "Open to all humanities and social science majors. Proficiency in a second language is a plus.",
              amount: 15000,
              category: "Need-Based",
              deadline: "2025-08-30",
              adminId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            {
              name: "Women in Tech Empowerment",
              description: "Focused on bridging the gender gap in technology sectors by providing full tuition and housing stipends.",
              eligibility: "Identifies as female, pursuing CS or Engineering, minimum GPA 3.5.",
              amount: 35000,
              category: "Diversity/Inclusion",
              deadline: "2025-11-01",
              adminId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          ];
          for (const s of sampleScholarships) {
            await addDoc(scholarshipCollection, s);
          }
        }
      } else {
        await setDoc(doc(db, "studentProfiles", user.uid), {
          id: user.uid,
          fullName: "Alex Rivera",
          email: email,
          phoneNumber: "+1 555-987-6543",
          collegeName: "Tech Institute of Innovation",
          course: "Artificial Intelligence & Ethics",
          familyIncome: 42000,
          academicBackground: "Top 2% of graduating class. Awarded 'Most Innovative Research' in Machine Learning. 3.98 GPA. Relevant projects in Neural Networks.",
          futureGoals: "I aim to pioneer equitable AI solutions for low-resource environments, focusing on education and healthcare accessibility.",
          documentIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Seed a pending application for the student to show dash functionality
        const appsRef = collection(db, "applications");
        const existingApps = await getDocs(query(appsRef, where("studentId", "==", user.uid), limit(1)));
        if (existingApps.empty) {
          const scholarships = await getDocs(query(collection(db, "scholarships"), limit(1)));
          if (!scholarships.empty) {
            const s = scholarships.docs[0].data();
            await addDoc(appsRef, {
              scholarshipId: scholarships.docs[0].id,
              scholarshipName: s.name,
              studentId: user.uid,
              studentName: "Alex Rivera",
              academicMarks: 3.98,
              category: s.category,
              statementOfPurpose: "I am writing to express my deep interest in the STEM Future Leaders Fund. My academic background in AI and my commitment to ethical technology make me an ideal candidate...",
              status: "Pending",
              appliedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      toast({
        title: "Grand Master Login Success",
        description: `Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}. System data synchronized.`,
      });
      router.push(role === 'admin' ? "/dashboard/admin" : "/dashboard/student");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="bg-primary p-2.5 rounded-2xl text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
            <span className="text-3xl font-black text-primary font-headline tracking-tighter">ScholarPort</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your secure portal</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 backdrop-blur border shadow-sm rounded-xl">
            <TabsTrigger value="student" className="rounded-lg data-[state=active]:shadow-md">Student</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-lg data-[state=active]:shadow-md">Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Student Access</CardTitle>
                <CardDescription>Enter your credentials to manage applications.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin('student')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-student">Email</Label>
                    <Input name="email" id="email-student" placeholder="student@scholarport.edu" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-student">Password</Label>
                    <Input name="password" id="password-student" type="password" placeholder="••••••••" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Sign In
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-12 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors" 
                    onClick={() => seedDemoData('student')}
                    disabled={isLoading}
                  >
                    <Sparkles className="mr-2 h-5 w-5 text-accent animate-pulse" />
                    Grand Master Student Login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Admin Console</CardTitle>
                <CardDescription>Restricted access for scholarship staff only.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin('admin')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-admin">Admin Email</Label>
                    <Input name="email" id="email-admin" placeholder="admin@scholarport.edu" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin">Password</Label>
                    <Input name="password" id="password-admin" type="password" placeholder="••••••••" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Secure Admin Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-12 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors" 
                    onClick={() => seedDemoData('admin')}
                    disabled={isLoading}
                  >
                    <Sparkles className="mr-2 h-5 w-5 text-accent animate-pulse" />
                    Grand Master Admin Login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
