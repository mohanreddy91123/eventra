import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  User,
  Hash,
  Building2,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  Plus,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentProfilePage: React.FC = () => {
  const { user, profile, updatePreferences } = useAuth();

  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState<string>('');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [newInterest, setNewInterest] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updatePreferences({ skills, interests });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <User className="h-7 w-7 text-indigo-600" />
          Student Profile & AI Preferences
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your verified student records and customize recommendation tags.
        </p>
      </div>

      {/* 1. Official Institutional Information (Strictly Locked) */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Verified Institutional Record
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official university details submitted during registration.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 self-start">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Read-Only & Locked</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Institutional Security Policy:</strong> To protect academic credentials and ensure verified event attendance rosters, official details (Full Name, Roll Number, Department, Section, Phone, and Email) cannot be altered directly. If you need any corrections, please submit a request to the University Academic Registrar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">{user?.name}</div>
          </div>

          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                University Roll Number
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-extrabold font-mono text-slate-900">
              {profile?.roll_number}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Department
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">{profile?.department}</div>
          </div>

          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Section
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-extrabold font-mono text-slate-900">
              Section {profile?.section}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Phone Number
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">+91 {profile?.phone_number}</div>
          </div>

          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Official Campus Email
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* 2. AI Recommendation Preferences (Fully Editable) */}
      <form
        onSubmit={handleSavePreferences}
        className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              AI Recommendation Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your technical skills and topics to get precision event match percentages.
            </p>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Your Technical & Professional Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type a skill and press Enter or Add (e.g. Python, Docker, React, CAD)..."
              className="block flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="rounded-full p-0.5 hover:bg-indigo-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Interests Tag Management */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Relevant Topics & Campus Interests
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={handleAddInterest}
              placeholder="Type an interest and press Enter or Add (e.g. Hackathons, AI Research, Cultural)..."
              className="block flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Interest
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 shadow-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="rounded-full p-0.5 hover:bg-purple-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSaving ? 'Updating Recommendations...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
