
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Search, 
  FileText, 
  UserCircle, 
  LogOut,
  Menu,
  Bell,
  CheckCircle,
  Users,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isAdminPath = pathname.startsWith("/dashboard/admin");

  // Check if user is an admin
  const adminRoleRef = useMemoFirebase(() => 
    user?.uid ? doc(db, "roles_admin", user.uid) : null,
    [db, user?.uid]
  );
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  useEffect(() => {
    if (isUserLoading || isAdminRoleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Direct role-based path protection
    if (isAdminPath) {
      if (adminRole) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } else {
      // Students can access student paths
      setIsAuthorized(true);
    }
  }, [user, isUserLoading, adminRole, isAdminRoleLoading, isAdminPath, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const studentNav = [
    { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "Scholarships", href: "/dashboard/student/scholarships", icon: Search },
    { name: "My Applications", href: "/dashboard/student/applications", icon: FileText },
    { name: "Profile", href: "/dashboard/student/profile", icon: UserCircle },
  ];

  const adminNav = [
    { name: "Admin Home", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Scholarships", href: "/dashboard/admin/scholarships", icon: GraduationCap },
    { name: "Applications", href: "/dashboard/admin/applications", icon: CheckCircle },
    { name: "Student List", href: "/dashboard/admin/students", icon: Users },
  ];

  const currentNav = isAdminPath ? adminNav : studentNav;

  if (isUserLoading || isAdminRoleLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Verifying access permissions...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-100 p-4 rounded-full mb-6 text-rose-600">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You do not have administrative privileges to view this section of the portal.
        </p>
        <Button onClick={() => router.push("/dashboard/student")}>
          Return to Student Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r bg-card">
        <div className="p-6 flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">ScholarPort</span>
        </div>
        <div className="flex-1 px-4 space-y-2 py-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Main Menu
          </div>
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 sm:px-8 bg-card sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Access dashboard sections via mobile sidebar.</SheetDescription>
                  </SheetHeader>
                  <div className="p-6 flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-primary font-headline">ScholarPort</span>
                  </div>
                  <div className="px-4 space-y-2 py-4">
                    {currentNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t mt-auto">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-lg font-bold truncate">
              {currentNav.find(n => n.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-background"></span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold truncate max-w-[150px]">{user?.displayName || (adminRole ? "Administrator" : "Student")}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
              </div>
              <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100/100`} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 flex-1 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
