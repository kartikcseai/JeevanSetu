
import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {
  Stethoscope,
  FileText,
  Pill,
  Users,
  Menu,
  X,
  Activity,
  TestTube,
  HeartPulse,
  Brain,
  Video,
  Hospital,
  Home,
  UserPlus
} from "lucide-react"

const components: { title: string; href: string; description: string; icon: any }[] = []

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center px-4 gap-2">
      <div className="w-full max-w-5xl rounded-full border bg-background/95 backdrop-blur shadow-lg px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <img src="/src/assets/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            Jeevan<span className="text-primary">Setu</span>
          </span>
        </Link>

        {/* Desktop Navigation - Mega Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>

              {/* Find Care */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent h-9">Find Care</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <Stethoscope className="h-6 w-6 text-white" />
                          <div className="mb-2 mt-4 text-lg font-medium text-white">
                            Find Doctors
                          </div>
                          <p className="text-sm leading-tight text-white/90">
                            Book appointments with top specialists near you.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li >
                    <ListItem href="#" title="Video Consultation" icon={Video}>
                      Connect with doctors instantly via video call.
                    </ListItem>
                    <ListItem href="#" title="Hospital Visit" icon={Hospital}>
                      Book OPD slots at top hospitals.
                    </ListItem>
                    <ListItem href="#" title="Home Visit" icon={Home}>
                      Get treated in the comfort of your home.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Lab Tests */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent h-9">Lab Tests</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    <ListItem href="/dashboard/patient?tab=tests" title="Full Body Checkup" icon={Activity}>
                      Comprehensive health screening packages.
                    </ListItem>
                    <ListItem href="/dashboard/patient?tab=tests" title="Blood Tests" icon={TestTube}>
                      CBC, Blood Sugar, Lipid Profile & more.
                    </ListItem>
                    <ListItem href="/dashboard/patient?tab=tests" title="Women's Health" icon={HeartPulse}>
                      PCOD, Thyroid, and hormone tests.
                    </ListItem>
                    <ListItem href="/dashboard/patient?tab=tests" title="Diabetes Screening" icon={FileText}>
                      HbA1c and fasting sugar tests.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Medicines */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent h-9">Medicines</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                    <ListItem href="#" title="Prescription" icon={Pill}>
                      Upload prescription & order medicines.
                    </ListItem>
                    <ListItem href="#" title="Healthcare Products" icon={ShoppingBag}>
                      Wellness, supplements & personal care.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* For Providers */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/dashboard/doctor" className={navigationMenuTriggerStyle()}>
                    For Doctors
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Symptom Checker */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/symptom-checker" className={navigationMenuTriggerStyle()}>
                    Symptom Checker
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" className="rounded-full" asChild>
            <Link to="/auth/login">Log in</Link>
          </Button>
          <Button className="rounded-full" asChild>
            <Link to="/auth/register">Sign up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu (Detached & Rounded) */}
      {isMobileMenuOpen && (
        <div className="w-full max-w-5xl rounded-3xl border bg-background/95 backdrop-blur shadow-xl p-6 lg:hidden animate-in slide-in-from-top-2 fade-in-0">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-medium">Find Care</span>
            </Link>
            <Link to="/dashboard/patient?tab=tests" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <TestTube className="w-5 h-5" />
              </div>
              <span className="font-medium">Lab Tests</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-medium">Medicines</span>
            </Link>
            <Link to="/symptom-checker" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-medium">Symptom Checker</span>
            </Link>

            <div className="h-px bg-border my-2" />

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full rounded-xl" asChild>
                <Link to="/auth/login">Log in</Link>
              </Button>
              <Button className="w-full rounded-xl" asChild>
                <Link to="/auth/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: any, title: string }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1.5 ml-6">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

import { ShoppingBag } from "lucide-react"
