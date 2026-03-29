import React, { useState, useEffect } from 'react';
import {
  Zap,
  Upload,
  CheckCircle,
  BarChart3,
  Headphones,
  Camera,
  Lightbulb,
  PaintBucket,
  Users,
  Wrench,
  ArrowRight,
  Star,
  Github,
  Linkedin,
  Twitter,
} from 'lucide-react';

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [animatedElements, setAnimatedElements] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Blueprint grid background pattern
  const BlueprintBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute w-full h-full opacity-10" style={{ top: scrollY * 0.5 }}>
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-cyan-400 opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-cyan-400 opacity-20" />
    </div>
  );

  // Pipeline step with animated connector
  const PipelineStep = ({ number, label, icon: Icon }) => (
    <div className="flex flex-col items-center relative flex-1">
      <div
        className="relative mb-4 transform transition-all duration-300 hover:scale-110"
        style={{
          animation: `bounce 3s ease-in-out ${number * 0.2}s infinite`,
        }}
      >
        <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-lg" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-2 border-cyan-400">
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
      <span className="text-sm font-mono text-cyan-400 text-center mt-2">{label}</span>
      {number < 6 && (
        <div className="absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-400 to-transparent opacity-50" />
      )}
    </div>
  );

  // Department card with hover effect
  const DepartmentCard = ({ icon: Icon, label, description }) => (
    <div className="group relative bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-orange-500/0 group-hover:from-cyan-400/10 group-hover:to-orange-500/5 rounded-lg transition-all duration-300" />
      <div className="relative z-10">
        <div className="mb-4 p-3 bg-cyan-400/10 rounded-lg w-fit">
          <Icon className="w-6 h-6 text-cyan-400 group-hover:text-orange-400 transition-colors" />
        </div>
        <h3 className="text-lg font-mono font-bold text-white mb-2">{label}</h3>
        <p className="text-sm text-blue-200">{description}</p>
      </div>
    </div>
  );

  // How it works step
  const HowItWorksStep = ({ number, title, description, icon: Icon }) => (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-10 blur-lg w-20 h-20" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center font-mono font-bold text-2xl text-white border-2 border-orange-400">
          {number}
        </div>
      </div>
      <Icon className="w-8 h-8 text-cyan-400 mb-4" />
      <h3 className="text-xl font-mono font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-blue-200 max-w-xs">{description}</p>
    </div>
  );

  // Pricing tier
  const PricingTier = ({ tier, price, description, features, highlighted }) => (
    <div
      className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
        highlighted
          ? 'border-2 border-orange-400 bg-gradient-to-br from-orange-900/20 to-cyan-900/20 transform scale-105'
          : 'border border-cyan-400/30 bg-gradient-to-br from-blue-900/20 to-cyan-900/10 hover:border-cyan-400/60'
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 text-center text-xs font-mono font-bold">
          RECOMMENDED
        </div>
      )}
      <div className="p-8 pt-12">
        <h3 className="text-2xl font-mono font-bold text-white mb-2">{tier}</h3>
        <p className="text-sm text-blue-200 mb-6">{description}</p>
        <div className="mb-6">
          <span className="text-5xl font-mono font-bold text-cyan-400">${price}</span>
          <span className="text-blue-300 font-mono text-sm">/month</span>
        </div>
        <button
          className={`w-full py-3 px-4 rounded-lg font-mono font-bold mb-8 transition-all duration-300 ${
            highlighted
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-cyan-400/20 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-blue-900'
          }`}
        >
          Subscribe Now
        </button>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
              <span className="text-sm text-blue-200">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Testimonial card
  const TestimonialCard = ({ name, company, quote }) => (
    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/60 transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
        ))}
      </div>
      <p className="text-sm text-blue-100 mb-4 italic">"{quote}"</p>
      <p className="font-mono font-bold text-white text-sm">{name}</p>
      <p className="text-xs text-cyan-400">{company}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-950" style={{ backgroundColor: '#0a1929' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        * {
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
        }

        .hero-title {
          animation: slideIn 0.8s ease-out;
        }

        .hero-subtitle {
          animation: slideIn 0.8s ease-out 0.2s backwards;
        }

        .cta-button {
          animation: slideIn 0.8s ease-out 0.4s backwards;
        }

        .glow-effect {
          animation: glow 3s ease-in-out infinite;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Section fade in on scroll */
        .section-animate {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-blue-950/80 border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-lg text-white">TD Tools</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#pipeline" className="text-sm text-blue-200 hover:text-cyan-400 transition">
              Pipeline
            </a>
            <a href="#departments" className="text-sm text-blue-200 hover:text-cyan-400 transition">
              Departments
            </a>
            <a href="#how-it-works" className="text-sm text-blue-200 hover:text-cyan-400 transition">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-blue-200 hover:text-cyan-400 transition">
              Pricing
            </a>
          </div>
          <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-300">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <BlueprintBackground />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="hero-title text-6xl md:text-7xl font-bold font-mono mb-6 leading-tight">
            <span className="text-white">Stop Guessing.</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Start Estimating.
            </span>
          </h1>

          <p className="hero-subtitle text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto">
            AI-Powered Labor Estimation for Live Events. Accurately estimate crew requirements in seconds, not hours.
          </p>

          <div className="cta-button flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-blue-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 glow-effect">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-10 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold rounded-lg transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Floating blueprint elements */}
          <div className="mt-16 relative h-64">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-24 h-24 border-2 border-cyan-400 rounded-lg" />
              <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-cyan-400" />
              <div className="absolute top-32 right-16 w-16 h-16 border-2 border-orange-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-cyan-400 text-sm font-mono">Scroll to explore</div>
          <ArrowRight className="w-5 h-5 text-cyan-400 mx-auto mt-2 transform rotate-90" />
        </div>
      </section>

      {/* Pipeline Section */}
      <section id="pipeline" className="relative py-20 px-6 bg-gradient-to-b from-blue-950 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            <span className="text-cyan-400">Intelligent</span> Estimation Pipeline
          </h2>
          <p className="text-center text-blue-200 mb-16 max-w-2xl mx-auto">
            Our 6-step workflow transforms raw specifications into accurate labor estimates
          </p>

          <div className="grid grid-cols-6 gap-2 md:gap-4 mb-16">
            <PipelineStep number={1} label="Import" icon={Upload} />
            <PipelineStep number={2} label="Review" icon={CheckCircle} />
            <PipelineStep number={3} label="Validate" icon={Zap} />
            <PipelineStep number={4} label="Interview" icon={Users} />
            <PipelineStep number={5} label="Estimate" icon={BarChart3} />
            <PipelineStep number={6} label="Report" icon={CheckCircle} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-400/20 rounded-xl p-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Automated Crew Planning</h3>
              <ul className="space-y-3">
                {[
                  'Upload CAD files, CSV specs, or use our web editor',
                  'AI automatically validates specifications against department standards',
                  'Generates detailed labor requirements by department',
                  'Export reports in PDF, Excel, or JSON formats',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-cyan-400/10 to-orange-500/10 rounded-lg p-6 border border-cyan-400/20 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
                <p className="text-blue-200 text-sm font-mono">Live data visualization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="relative py-20 px-6 bg-blue-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            Coverage for <span className="text-cyan-400">6 Departments</span>
          </h2>
          <p className="text-center text-blue-200 mb-16 max-w-2xl mx-auto">
            Specialized labor models for every discipline in live event production
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <DepartmentCard
              icon={Headphones}
              label="Audio"
              description="Engineers, technicians, and audio support staff for sound design and live mixing"
            />
            <DepartmentCard
              icon={Camera}
              label="Video"
              description="Camera operators, vision control, and video production specialists"
            />
            <DepartmentCard
              icon={Lightbulb}
              label="Lighting"
              description="LDs, programmers, and lighting technicians for complex rig setups"
            />
            <DepartmentCard
              icon={PaintBucket}
              label="Scenic"
              description="Set designers, builders, and scenic technicians for stage construction"
            />
            <DepartmentCard
              icon={Users}
              label="Soft Goods"
              description="Drape specialists, wardrobe, and fabric technicians"
            />
            <DepartmentCard
              icon={Wrench}
              label="Stagehands"
              description="General labor, deck crew, and stage management personnel"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 px-6 bg-gradient-to-b from-blue-950 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            How <span className="text-orange-400">TD Tools</span> Works
          </h2>
          <p className="text-center text-blue-200 mb-16 max-w-2xl mx-auto">
            Three simple steps to professional labor estimates
          </p>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <HowItWorksStep
              number={1}
              title="Upload Your Plans"
              description="Import CAD files, technical specs, or project details via our intuitive web interface"
              icon={Upload}
            />
            <HowItWorksStep
              number={2}
              title="AI Validates"
              description="Our neural models analyze specifications and ask clarifying questions in real time"
              icon={CheckCircle}
            />
            <HowItWorksStep
              number={3}
              title="Get Your Report"
              description="Receive detailed labor estimates with confidence intervals and department breakdowns"
              icon={BarChart3}
            />
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-400/20 rounded-xl p-8 text-center">
            <p className="text-blue-100 mb-4">
              Average estimation time: <span className="text-cyan-400 font-bold">3-5 minutes</span>
            </p>
            <p className="text-blue-200 text-sm">
              From specification to labor estimate, faster and more accurate than manual planning
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 px-6 bg-blue-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            Simple, Transparent <span className="text-cyan-400">Pricing</span>
          </h2>
          <p className="text-center text-blue-200 mb-16 max-w-2xl mx-auto">
            Choose the plan that fits your team's needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingTier
              tier="Starter"
              price="49"
              description="Perfect for small projects"
              features={[
                '5 estimates per month',
                'Basic department models',
                'Email support',
                'CSV export',
                'Single user account',
              ]}
            />
            <PricingTier
              tier="Professional"
              price="149"
              description="For growing production teams"
              features={[
                'Unlimited estimates',
                'All department models',
                'Priority email support',
                'PDF & Excel export',
                'Team collaboration (up to 5 users)',
                'API access',
                'Custom labor rates',
              ]}
              highlighted={true}
            />
            <PricingTier
              tier="Enterprise"
              price="499"
              description="Full-featured production suite"
              features={[
                'Everything in Professional',
                'Dedicated account manager',
                'Custom integrations',
                'SLA guarantee',
                'Unlimited team members',
                'Advanced analytics',
                'White-label options',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-blue-950 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            Trusted by Production Teams <span className="text-cyan-400">Worldwide</span>
          </h2>
          <p className="text-center text-blue-200 mb-16">Professionals rely on TD Tools for accurate, fast labor estimation</p>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Maya Rodriguez"
              company="Live Event Productions Inc"
              quote="TD Tools cut our estimation time from hours to minutes. The accuracy is incredible."
            />
            <TestimonialCard
              name="James Chen"
              company="Madison Square Garden Events"
              quote="We use TD Tools for every major production. It's become essential to our planning process."
            />
            <TestimonialCard
              name="Sarah Williams"
              company="Broadway Technical Services"
              quote="The AI models understand our industry. Results are always spot-on and detailed."
            />
          </div>

          <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Productions Planned', value: '2,500+' },
              { label: 'Events Supported', value: '15K+' },
              { label: 'Hours Saved', value: '50K+' },
              { label: 'Customer Satisfaction', value: '98%' },
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-cyan-400/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 bg-blue-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to <span className="text-orange-400">Transform</span> Your Estimation Process?
          </h2>
          <p className="text-xl text-blue-200 mb-12">
            Join production teams using TD Tools to estimate labor faster and more accurately
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 glow-effect">
              Start Free Trial
            </button>
            <button className="px-12 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold rounded-lg transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-blue-900 border-t border-cyan-400/20 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
                <span className="font-bold text-lg text-white">TD Tools</span>
              </div>
              <p className="text-sm text-blue-300">
                AI-Powered Labor Estimation for Live Events
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Documentation', 'API Docs'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-blue-300 hover:text-cyan-400 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-blue-300 hover:text-cyan-400 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-blue-300 hover:text-cyan-400 transition">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-blue-300 hover:text-cyan-400 transition">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-blue-300 hover:text-cyan-400 transition">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan-400/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-blue-300">
                © 2026 Agentic Sales Inc. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-blue-300 hover:text-cyan-400 transition">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-blue-300 hover:text-cyan-400 transition">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-blue-300 hover:text-cyan-400 transition">
                  Status
                </a>
              </div>
            </div>
            <p className="text-xs text-blue-400 mt-4">
              agenticpipeline.io
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
