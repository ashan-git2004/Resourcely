import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingBookings: 3,
    activeTickets: 2,
    availableResources: 12,
    notifications: 5,
  });

  useEffect(() => {
    // In a real app, fetch stats from backend
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const quickActions = [
    {
      icon: "📅",
      title: "Book Resources",
      description: "Reserve rooms, equipment, or facilities",
      href: "/bookings",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: "🎫",
      title: "Support Tickets",
      description: "Report issues and track resolutions",
      href: "/tickets",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: "📚",
      title: "Resources",
      description: "Browse available campus resources",
      href: "/resources",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: "🔔",
      title: "Notifications",
      description: "Stay updated with latest announcements",
      href: "/notifications",
      color: "from-green-500 to-teal-500",
    },
  ];

  const features = [
    {
      icon: "✨",
      title: "Smart Booking System",
      description: "Reserve resources with real-time availability and instant confirmations",
    },
    {
      icon: "🛠️",
      title: "Maintenance Tracking",
      description: "Submit and track maintenance requests with priority levels",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "View resource utilization and booking trends",
    },
    {
      icon: "🔐",
      title: "Secure Access",
      description: "OAuth2 authentication with role-based access control",
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        <div
          className="absolute inset-0 opacity-30 -z-10"
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)",
          }}
        />

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span
              style={{
                background: "linear-gradient(135deg, #00d9ff 0%, #ff6b35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Welcome to Smart Campus
            </span>
          </h1>
          <p className="text-xl text-campus-muted mb-4">
            Manage your bookings, resources, and support requests seamlessly
          </p>
          <p className="text-sm text-campus-muted/70">
            Logged in as <span className="text-campus-accent font-semibold">{auth?.email}</span>
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Upcoming Bookings", value: stats.upcomingBookings, icon: "📅" },
            { label: "Active Tickets", value: stats.activeTickets, icon: "🎫" },
            { label: "Available Resources", value: stats.availableResources, icon: "📦" },
            { label: "Notifications", value: stats.notifications, icon: "🔔" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="card text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-campus-accent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-campus-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.href}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-campus-panel to-[rgba(26,31,46,0.5)] border border-campus-border hover:border-campus-accent transition-all duration-300"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <div className="text-5xl mb-4 group-group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-campus-accent transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-campus-muted">{action.description}</p>
                <div className="mt-4 flex items-center text-campus-accent font-semibold text-sm">
                  Explore
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="card flex gap-4 hover:border-campus-accent transition-colors duration-300"
            >
              <div className="text-4xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-campus-muted text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div
          className="card relative overflow-hidden border-campus-accent/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)",
          }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-campus-muted mb-6">
              Explore all the features and manage your campus resources effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/bookings" className="primary-btn justify-center">
                Browse Resources
              </Link>
              <Link to="/tickets" className="secondary-btn justify-center">
                Create Support Ticket
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity (placeholder) */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold mb-10">Recent Activity</h2>
        <div className="card">
          <div className="text-center py-8">
            <p className="text-campus-muted mb-4">No recent activity yet</p>
            <p className="text-sm text-campus-muted/70">
              Your bookings, tickets, and interactions will appear here
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-campus-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-bold mb-2">Support</h3>
            <p className="text-sm text-campus-muted">
              Need help? Contact the admin team or create a support ticket
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Documentation</h3>
            <p className="text-sm text-campus-muted">
              Check out our guides and tutorials for platform usage
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Account</h3>
            <p className="text-sm text-campus-muted">
              Manage your profile and notification preferences
            </p>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-campus-border/50 text-xs text-campus-muted">
          <p>© 2026 Smart Campus. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}
