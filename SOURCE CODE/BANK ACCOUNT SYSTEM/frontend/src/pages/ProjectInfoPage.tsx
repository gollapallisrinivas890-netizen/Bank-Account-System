import React from 'react';
import {
  GraduationCap,
  Users,
  Code2,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const ProjectInfoPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'G. Srinivas',
      regNo: '25B11AI349',
      role: 'Project Manager & System Analyst',
      tasks: 'Objectives, system workflow, architecture design, module integration & timeline.'
    },
    {
      name: 'P. Sai Tharun',
      regNo: '25B11AIA53',
      role: 'Account Management Developer',
      tasks: 'Account creation, customer details, balance enquiry, search & update functionality.'
    },
    {
      name: 'B. Venkatesh',
      regNo: '25B11AI136',
      role: 'Transaction Developer',
      tasks: 'Deposit module, withdrawal module, transaction recording & balance checks.'
    },
    {
      name: 'T. Harika',
      regNo: '25B11AI982',
      role: 'Database, Testing & Documentation',
      tasks: 'ER diagram, DFD, file/database storage, system testing, debugging & project report.'
    }
  ];

  const oopConcepts = [
    {
      title: 'Classes & Objects',
      desc: 'Used to model real-world banking entities. Account, Transaction, and Bank classes define encapsulated data members and member functions.'
    },
    {
      title: 'Data Encapsulation',
      desc: 'Account balances and security PINs are protected from direct uncontrolled access, requiring verified member functions for all debits.'
    },
    {
      title: 'Member Functions',
      desc: 'Operations such as deposit(), withdraw(), transferMoney(), balanceEnquiry(), and securityCheck() execute precise state mutations.'
    },
    {
      title: 'State Persistence',
      desc: 'Transforms volatile in-memory C++ structures into durable, acid-compliant SQLite database records with integer paise precision.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 text-white rounded-3xl p-6 sm:p-8 border border-navy-800 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-cyan-500/30">
          <GraduationCap className="w-4 h-4" />
          Cornerstone Project Review – 2 • 2026–2027
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Bank Account Management System Using C++
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Interactive full-stack web demonstration prototype developed for Batch 13, Department of Artificial Intelligence &amp; Machine Learning / Computer Science &amp; Engineering, Aditya University.
        </p>
        <div className="mt-4 pt-4 border-t border-navy-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <span>Project Guide: <strong className="text-cyan-300">T. Vijaya Lakshmi Madam</strong> (Assistant Professor)</span>
          <span>Institution: <strong className="text-slate-200">Aditya University</strong></span>
          <span>Batch: <strong className="text-slate-200">Batch 13</strong></span>
        </div>
      </div>

      {/* Team Members Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Batch 13 Project Team &amp; Responsibilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-extrabold text-navy-900 text-sm">{member.name}</h4>
                  <span className="font-mono text-[11px] text-cyan-700 font-bold">{member.regNo}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {member.role}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{member.tasks}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OOP Concepts Mapping */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          Object-Oriented Programming (OOP) Implementation in C++
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {oopConcepts.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-xs text-navy-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          System Workflow &amp; Architecture
        </h3>
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
          <div className="text-cyan-400 font-bold">USER INTERFACE / CLIENT PORTAL</div>
          <div className="pl-4">↓ Authenticate via Account ID (8 Digits) + PIN (4 Digits)</div>
          <div className="pl-4">↓ Multi-Bank Engine (SBI, HDFC, ICICI, AXIS, CANARA, BOB, PNB, UBI)</div>
          <div className="pl-4">↓ Validation Layer:</div>
          <div className="pl-8 text-amber-300">• ATM Withdrawal Cap: ₹20,000 / txn</div>
          <div className="pl-8 text-amber-300">• Bank Counter Cap: ₹50,000 / txn</div>
          <div className="pl-8 text-amber-300">• UPI &amp; Transfer Cap: ₹1,00,000 / txn</div>
          <div className="pl-8 text-amber-300">• Recharge Cap: ₹10,000 / txn</div>
          <div className="pl-8 text-amber-300">• Bill Payment Cap: ₹50,000 / txn</div>
          <div className="pl-8 text-amber-300">• Total Daily Outgoing Limit: ₹1,00,000</div>
          <div className="pl-8 text-amber-300">• 3 Consecutive Login Failures = Account Lockout</div>
          <div className="pl-4">↓ Database Layer (SQLite with Integer Paise Math):</div>
          <div className="pl-8 text-emerald-400">Atomic Two-Account Transactions &amp; Audit Trail</div>
        </div>
      </div>

      {/* Preservation & Prototype Notes */}
      <div className="p-5 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 space-y-2">
        <h4 className="font-bold flex items-center gap-1.5 text-cyan-900">
          <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          Prototype Fidelity &amp; Preservation Guarantee
        </h4>
        <p className="leading-relaxed">
          The original C++ source code (<code className="font-mono font-bold text-navy-900">Batch_13_Bank_Account_Management_System.cpp</code>) is preserved in its original form and compiles cleanly with MinGW GCC.
          This full-stack prototype translates every rule, limit, validation, and feature from the C++ source code into a visual, demonstrable, persistent web interface suitable for your college guide review.
        </p>
      </div>
    </div>
  );
};
