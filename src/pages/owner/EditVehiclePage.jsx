import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const EditVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vehicles/${id}`);
        setFormData(res.data.data);
      } catch (err) {
        showToast(err.message || 'Failed to load vehicle', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.put(`/vehicles/${id}`, formData);
      showToast('Vehicle details updated successfully.', 'success');
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading vehicle details..." />;
  }

  if (!formData) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 mb-4">Vehicle not found.</p>
        <Link to="/owner/dashboard" className="text-xs font-bold text-emerald-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Owner Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Edit Vehicle Listing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update pricing, specifications, or location for {formData.title}.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Listing Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Daily Rate (₹)
              </label>
              <input
                type="number"
                name="dailyRate"
                required
                value={formData.dailyRate}
                onChange={handleChange}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weekly Rate (₹)
              </label>
              <input
                type="number"
                name="weeklyRate"
                value={formData.weeklyRate}
                onChange={handleChange}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full text-xs font-normal p-3 rounded-xl border border-slate-200 focus:outline-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Updates'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
