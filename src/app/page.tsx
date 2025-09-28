"use client";

import Link from "next/link";

const FeatureCard = ({
  icon,
  title,
  description,
  bgColor,
}: {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}) => (
  <div className={`text-center p-6 ${bgColor} rounded-xl`}>
    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-white text-2xl font-bold">{icon}</span>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
    <div className="text-blue-200">{label}</div>
  </div>
);

export default function Home() {
  const features = [
    {
      icon: "💰",
      title: "Expense Sharing",
      description:
        "Easily split trip costs, activities, and shared purchases with friends",
      bgColor: "bg-blue-50",
    },
    {
      icon: "📊",
      title: "Detailed Reports",
      description:
        "Track and analyze expenses with visual and easy-to-understand reports",
      bgColor: "bg-green-50",
    },
    {
      icon: "👥",
      title: "Group Management",
      description:
        "Create and manage multiple groups for different trips or activities",
      bgColor: "bg-purple-50",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Create Trip",
      description: "Create a new trip and add participating members",
    },
    {
      number: 2,
      title: "Add Expenses",
      description: "Add expenses and allocate them to specific members",
    },
    {
      number: 3,
      title: "Track & Settle",
      description: "Monitor balances and easily settle payments",
    },
  ];

  const stats = [
    { value: "1000+", label: "Users" },
    { value: "500+", label: "Trips" },
    { value: "$50K+", label: "Expenses" },
    { value: "99%", label: "Satisfaction" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Splitmate
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Smart group expense management app - Share costs easily and
              transparently
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/trips"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for effective group expense management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                bgColor={feature.bgColor}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Just 3 simple steps to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <StatCard key={index} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users managing group expenses effectively
          </p>
          <Link
            href="/trips"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg inline-block"
          >
            Create Your First Trip
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Splitmate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
