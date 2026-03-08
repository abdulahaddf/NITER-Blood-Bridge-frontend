import { Link } from "react-router-dom";
import {
  Droplets,
  Search,
  UserPlus,
  Shield,
  Heart,
  ChevronRight,
  Users,
  Activity,
  Droplet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BloodGroupLabels, type BloodGroup } from "@/types";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { usePublicStats } from "@/hooks/usePublicStats";

const bloodGroupColors: Record<BloodGroup, string> = {
  A_POS: "bg-blue-500",
  A_NEG: "bg-blue-700",
  B_POS: "bg-orange-500",
  B_NEG: "bg-orange-700",
  AB_POS: "bg-purple-500",
  AB_NEG: "bg-purple-700",
  O_POS: "bg-green-500",
  O_NEG: "bg-green-700",
};

const BLOOD_GROUPS: BloodGroup[] = ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'];

export function LandingPage() {
  const { stats, isLoading } = usePublicStats();

  // Map hook stats to component local names for compatibility
  const totalUsers = stats.totalDonors;
  const eligibleDonors = stats.eligibleDonors;
  const bloodGroupStats = stats.byBloodGroup;
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar/>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 blood-gradient-subtle">
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)]?.map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/20"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container-max section-padding py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Heart className="h-4 w-4 mr-2 text-primary" />
                Connecting Lives at NITER
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Find a blood donor at <span className="text-primary">NITER</span> — instantly
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              A verified community of donors within our campus. Every second
              matters when lives are at stake. Join our network of heroes today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="btn-primary text-lg px-8">
                <Link to="/login">
                  <Search className="h-5 w-5 mr-2" />
                  Find a Donor
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="btn-outline text-lg px-8"
              >
                <Link to="/register">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Become a Donor
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 grid grid-cols-3 gap-8"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `${totalUsers}+`}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total Donors
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : eligibleDonors}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Currently Eligible
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  8
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Blood Groups
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blood Group Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Available Blood Groups</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our community has donors from all blood groups. Click on any group
              to find eligible donors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(isLoading ? BLOOD_GROUPS?.map(bg => ({ bloodGroup: bg, count: 0, eligibleCount: 0 })) : bloodGroupStats)?.map((stat: { bloodGroup: BloodGroup; count: number; eligibleCount: number }, index: number) => (
              <motion.div
                key={stat.bloodGroup}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to="/login">
                  <div className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`blood-group-badge ${bloodGroupColors[stat.bloodGroup]}`}
                      >
                        {BloodGroupLabels[stat.bloodGroup]}
                      </span>
                      <Droplet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stat.eligibleCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Eligible Donors
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started is easy. Join our community in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserPlus,
                title: "Register & Verify Email",
                description:
                  "Create your account with your email and verify it to get started.",
                step: "01",
              },
              {
                icon: Users,
                title: "Complete Your Donor Profile",
                description:
                  "Add your details, blood group, and availability information.",
                step: "02",
              },
              {
                icon: Activity,
                title: "Get Found in Search",
                description:
                  "Once verified, you will appear in search results when someone needs your blood type.",
                step: "03",
              },
            ]?.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-card rounded-xl p-8 card-shadow h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="pt-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container-max section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              About NITER Blood Bridge
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              NITER Blood Bridge is a platform built for the National Institute
              of Technical Teachers&apos; Education and Research community. Our
              mission is to create a reliable network of blood donors within our
              campus, making it easier to find help during medical emergencies.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>
                Your phone number is never shown publicly. Contact is only
                shared with logged-in verified members.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Save Lives?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join our community of donors today. Your contribution can make the
              difference between life and death for someone in need.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              <Link to="/register">
                Become a Donor Now
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container-max section-padding">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Droplets className="h-6 w-6" />
              <span className="font-bold">NITER Blood Bridge</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              National Institute of Technical Teachers&apos; Education and
              Research, Bangladesh
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
