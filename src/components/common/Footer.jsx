import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Car className="w-4 h-4 font-bold" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Drive<span className="text-emerald-400">Go</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              DriveGo is a peer-to-peer vehicle rental and fleet management platform connecting trusted vehicle owners with verified drivers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Listings & Secure Bookings</span>
            </div>
          </div>

          {/* Vehicle Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vehicles?category=Car" className="hover:text-white transition-colors">Luxury Sedans & Hatchbacks</Link></li>
              <li><Link to="/vehicles?category=SUV" className="hover:text-white transition-colors">Adventure & 4x4 SUVs</Link></li>
              <li><Link to="/vehicles?category=Bike" className="hover:text-white transition-colors">Motorcycles & Cruisers</Link></li>
              <li><Link to="/vehicles?category=Scooter" className="hover:text-white transition-colors">Smart Electric Scooters</Link></li>
              <li><Link to="/vehicles?category=Van" className="hover:text-white transition-colors">Passenger Vans & Shuttles</Link></li>
              <li><Link to="/vehicles?category=Truck" className="hover:text-white transition-colors">Commercial Cargo Trucks</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Browse All Vehicles</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">How DriveGo Works</Link></li>
              <li><Link to="/register?role=owner" className="hover:text-white transition-colors">List Your Vehicle (Owners)</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">24/7 Roadside Assistance</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Account Portal</Link></li>
            </ul>
          </div>

          {/* MCA Portfolio & Test Credentials */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200">Build By Avinash Sonawanwe &hearts;</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              MERN Stack architecture featuring MongoDB, Express.js, React.js, Node.js with JWT auth and double-booking conflict algorithms.
            </p>
            
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DriveGo Vehicle Rental System. Built for academic presentation and demonstration.</p>
          <div className="flex gap-6">
            <span>Server: Express / Node.js</span>
            <span>Database: MongoDB / Mongoose</span>
            <span>Client: React 19 / Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
