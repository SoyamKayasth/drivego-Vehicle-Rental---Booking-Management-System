import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  KeyRound,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Search,
  Award,
  HelpCircle,
  HeartHandshake,
  Users,
  RefreshCcw,
  IndianRupee,
  Layers,
  Database,
  Server,
  Code2,
  CalendarCheck,
  FileCheck2,
  ThumbsUp
} from 'lucide-react';

export const AboutPage = () => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('customer');

  const customerSteps = [
    {
      step: '01',
      title: 'Search & Compare Fleet',
      desc: 'Browse hundreds of verified cars, SUVs, bikes, scooters, and vans across Mumbai, Bangalore, Delhi, Pune, and Hyderabad. Filter by transmission, fuel type, seating capacity, or daily budget.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Real-Time Availability Check',
      desc: 'Select your exact pickup and return schedule. Our real-time calendar prevents double bookings and recalculates itemized rental costs plus refundable security deposit with zero hidden counter fees.',
      icon: CalendarCheck,
    },
    {
      step: '03',
      title: 'Instant Reservation & Payment',
      desc: 'Confirm your booking with instant checkout via Card, UPI, or Counter Cash. Your funds are secured while the vehicle owner reviews and confirms the booking details.',
      icon: CreditCard,
    },
    {
      step: '04',
      title: 'Keys Handover & Drive',
      desc: 'Meet your host at the designated pickup landmark or home delivery point. Do a quick digital vehicle check-in, start the engine, and hit the road with 24/7 roadside assistance.',
      icon: KeyRound,
    },
  ];

  const ownerSteps = [
    {
      step: '01',
      title: 'List Your Vehicle in Minutes',
      desc: 'Submit your vehicle details, registration number, specifications, high-res photos, and set your custom hourly, daily, weekly, or monthly pricing tariffs.',
      icon: Car,
    },
    {
      step: '02',
      title: 'Quick Admin Verification',
      desc: 'Our administrative moderation team checks vehicle details and roadworthiness to ensure passenger safety and maintain elite platform quality.',
      icon: FileCheck2,
    },
    {
      step: '03',
      title: 'Manage Requests on Your Terms',
      desc: 'You maintain 100% control over your vehicle schedule. Block maintenance days, set availability, and accept or reject customer booking requests as you choose.',
      icon: RefreshCcw,
    },
    {
      step: '04',
      title: 'Earn Steady Rental Income',
      desc: 'Hand over keys to verified drivers, receive rental payouts directly upon booking, inspect your vehicle upon return, and build a trusted 5-star host reputation.',
      icon: IndianRupee,
    },
  ];

  const safetyPillars = [
    {
      title: '100% Verified Hosts & Drivers',
      desc: 'Every driver must complete identity authentication, and every vehicle host undergoes verification before listings appear in public search.',
      icon: ShieldCheck,
    },
    {
      title: 'Transparent Pricing Guarantee',
      desc: 'What you see is what you pay. Rental charges, security deposits, and fuel guidelines are clearly itemized before you authorize payment.',
      icon: Award,
    },
    {
      title: 'Double-Booking Prevention',
      desc: 'Our mathematical calendar checks overlapping reservation intervals down to the exact minute, guaranteeing your car is ready when you arrive.',
      icon: Clock,
    },
    {
      title: '24/7 Roadside Assistance',
      desc: 'From flat tires and battery jump-starts to emergency towing, our nationwide partner network keeps you protected on every highway.',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mobility Reimagined for Modern Drivers & Hosts</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-display leading-tight">
          Smarter vehicle rental for real journeys.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed font-light">
          DriveGo connects verified vehicle owners with conscious drivers. We turn idle private cars, motorcycles, and commercial vans into dependable shared mobility, eliminating high ownership costs and double-booking headaches.
        </p>
      </section>

      {/* Real-Life Mission Story & Value Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs">
        <div className="space-y-6">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            Our Purpose & Vision
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Why DriveGo exists in the real world
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              In major metropolitan cities, privately owned vehicles remain parked for over <strong>90% of their lifespan</strong>, steadily losing value while taking up valuable urban space. At the same time, weekend travelers, commuting professionals, and logistics drivers face rigid traditional car rental agencies burdened with hidden fees and long paperwork.
            </p>
            <p>
              DriveGo was engineered to solve this friction. We created a transparent, peer-to-peer ecosystem where vehicle owners earn meaningful passive income by renting out their personal cars, adventure SUVs, and bikes—while giving customers frictionless access to well-maintained vehicles with instant online confirmation.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero cancellation penalties before trip start</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sanitized and inspected vehicle handovers</span>
            </div>
          </div>
        </div>

        {/* Real-World Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-3xl font-black text-slate-900 tabular-nums">15+</div>
            <div className="text-xs font-bold text-slate-800">Vehicle Models</div>
            <p className="text-[11px] text-slate-500">From electric scooters to 10-seater luxury vans.</p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="text-3xl font-black text-emerald-700 tabular-nums">100%</div>
            <div className="text-xs font-bold text-emerald-900">Conflict Protected</div>
            <p className="text-[11px] text-emerald-700">Strict calendar overlap validation prevents double bookings.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-3xl font-black text-slate-900 tabular-nums">6</div>
            <div className="text-xs font-bold text-slate-800">Major Cities</div>
            <p className="text-[11px] text-slate-500">Mumbai, Bangalore, Delhi, Pune, Hyderabad, and Goa.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-3xl font-black text-slate-900 tabular-nums">4.8★</div>
            <div className="text-xs font-bold text-slate-800">Verified Rating</div>
            <p className="text-[11px] text-slate-500">Only verified completed rentals can submit reviews.</p>
          </div>
        </div>
      </section>

      {/* HOW THE WEBSITE WORKS (Interactive Step-by-Step Guide) */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            Platform Workflow
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            How DriveGo Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose a role below to see how our reservation and hosting lifecycle functions from start to finish.
          </p>

          {/* Role Segmented Tabs */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => setActiveWorkflowTab('customer')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeWorkflowTab === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Customers (Renting a Vehicle)
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkflowTab('owner')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeWorkflowTab === 'owner'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Vehicle Owners (Listing & Earning)
            </button>
          </div>
        </div>

        {/* Step-by-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(activeWorkflowTab === 'customer' ? customerSteps : ownerSteps).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 font-mono tabular-nums">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span>Step {item.step}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          {activeWorkflowTab === 'customer' ? (
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <span>Explore Fleet and Book Your Drive</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/register?role=owner"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <span>Register as a Vehicle Owner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Real-Life Safety & Trust Pillars */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
            Trust & Security Guarantees
          </span>
          <h2 className="text-3xl font-black tracking-tight font-display">
            Built for safety, reliability, and peace of mind
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            We hold ourselves to rigorous automotive inspection and user verification benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Academic Engineering & MERN Stack Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            Software Engineering & MCA Academic Portfolio
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Technical Architecture & MERN Stack Implementation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            DriveGo is architected following industry software engineering design patterns, separation of concerns, and clean RESTful API standards.
          </p>
        </div>

        {/* 4 Pillars of MERN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              M
            </div>
            <h3 className="text-sm font-bold text-slate-900">MongoDB & Mongoose</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Schemas with validation, relational ObjectId referencing for Users, Vehicles, Bookings, Payments, and Reviews, with automatic population and dual persistent store capability.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
              E
            </div>
            <h3 className="text-sm font-bold text-slate-900">Express.js Backend</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modular controllers, role-based middleware (`requireAuth`, `requireRole`), centralized error handlers, CORS, and deterministic HTTP response codes (200, 201, 400, 403, 409).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
              R
            </div>
            <h3 className="text-sm font-bold text-slate-900">React 19 & Tailwind CSS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Client-side SPA with React Router, context state management for auth and toast alerts, mobile-responsive layout, and zero-pill metadata typography.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
              N
            </div>
            <h3 className="text-sm font-bold text-slate-900">Node.js Runtime</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Secure password hashing with bcrypt, stateless JWT session tokens, authoritative rental price calculation engine, and interval conflict validation algorithms.
            </p>
          </div>
        </div>

        {/* Business Logic Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Interval Conflict Detection Algorithm</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforces <code>startA &lt; endB && endA &gt; startB</code> across bookings with <code>pending</code>, <code>confirmed</code>, or <code>active</code> statuses. Double-booking requests are reliably rejected with HTTP 409 Conflict.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Server-Authoritative Pricing Calculation</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prices are calculated strictly server-side using ceiling units for hourly, daily, weekly, and monthly rates. Client inputs are never trusted for financial transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="bg-emerald-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl font-black font-display tracking-tight">
          Ready to experience hassle-free vehicle rental?
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
          Join DriveGo today as a driver or list your idle vehicle to start earning. Verified hosts, transparent pricing, and instant booking.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            to="/vehicles"
            className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Browse Available Fleet
          </Link>
          <Link
            to="/register?role=owner"
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Become a Vehicle Host
          </Link>
        </div>
      </section>
    </div>
  );
};
