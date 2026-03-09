"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  GraduationCap, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Loader2,
  Trophy
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-bg");

  const scholarshipsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "scholarships"), limit(3));
  }, [db]);

  const { data: scholarships, isLoading } = useCollection(scholarshipsQuery);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 lg:py-32">
          <div className="absolute inset-0 z-0 opacity-20">
            {heroImg && (
              <Image 
                src={heroImg.imageUrl}
                alt={heroImg.description}
                fill
                className="object-cover"
                data-ai-hint={heroImg.imageHint}
              />
            )}
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Unlock Your Potential with ScholarPort
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-10 leading-relaxed">
                Empowering students to achieve their academic dreams through a streamlined scholarship portal. Discover, apply, and succeed with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" asChild>
                  <Link href="/register">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/50 hover:bg-primary-foreground/10" asChild>
                  <Link href="/#scholarships">Explore Scholarships</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Key Features</h2>
              <div className="h-1.5 w-20 bg-accent mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="h-8 w-8 text-accent" />,
                  title: "Smart Discovery",
                  description: "Search and filter through hundreds of scholarships tailored to your academic background and financial needs."
                },
                {
                  icon: <Sparkles className="h-8 w-8 text-accent" />,
                  title: "AI-Powered SOP Assistant",
                  description: "Draft compelling Statements of Purpose with our built-in AI tool that helps you highlight your unique strengths."
                },
                {
                  icon: <ShieldCheck className="h-8 w-8 text-accent" />,
                  title: "Seamless Tracking",
                  description: "Stay updated with real-time application status. Receive notifications on approvals and next steps."
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4 bg-accent/10 w-fit p-3 rounded-2xl">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Scholarship Spotlight */}
        <section id="scholarships" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-4">Featured Scholarships</h2>
                <div className="h-1.5 w-20 bg-accent rounded-full"></div>
              </div>
              <Button variant="ghost" className="text-primary hover:text-accent font-semibold" asChild>
                <Link href="/login">View Full Catalog <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : scholarships && scholarships.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {scholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="overflow-hidden group hover:border-accent transition-all duration-300 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/${scholarship.id}/400/300`}
                        alt={scholarship.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        data-ai-hint="university campus"
                      />
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {scholarship.category || "Featured"}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{scholarship.name}</CardTitle>
                      <CardDescription className="line-clamp-2 h-10">{scholarship.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-lg text-primary">
                          ${scholarship.amount?.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "Rolling"}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" asChild>
                        <Link href="/login">Apply Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted shadow-inner">
                <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary">Catalog Being Updated</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  New opportunities are added daily. Log in as an administrator to add scholarships or sign up as a student to be notified.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/login">Login to Seed Data</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground pt-16 pb-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12 border-b border-primary-foreground/10 pb-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-accent" />
                <span className="text-2xl font-bold tracking-tight font-headline">ScholarPort</span>
              </div>
              <p className="max-w-md opacity-80 leading-relaxed">
                Empowering the next generation of leaders by simplifying the path to financial aid. Your future, our mission.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Quick Links</h3>
              <ul className="space-y-2 opacity-80">
                <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
                <li><Link href="/#scholarships" className="hover:text-accent transition-colors">Scholarships</Link></li>
                <li><Link href="/register" className="hover:text-accent transition-colors">Student Registration</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Contact Us</h3>
              <ul className="space-y-4 opacity-80">
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <span>support@scholarport.edu</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center opacity-60 text-sm">
            <p>&copy; {new Date().getFullYear()} ScholarPort Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
