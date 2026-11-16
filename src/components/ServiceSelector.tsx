import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceItem, ServiceType } from '../types';
import { Stethoscope, HeartPulse, Activity, Scan, Baby, FileSearch, CheckCircle2 } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Scan: <Scan className="w-5 h-5" />,
  Baby: <Baby className="w-5 h-5" />,
  FileSearch: <FileSearch className="w-5 h-5" />,
};

export const ServiceSelector: React.FC = () => {
  const { services, selectedService, setSelectedService } = useApp();
  const [filter, setFilter] = useState<'all' | ServiceType>('all');

  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    return service.type === filter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            1. Select Doctor or Diagnostic Service
          </h2>
          <p className="text-xs text-slate-500">
            Choose what you need today — time slots adapt to your chosen provider
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'all'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setFilter('doctor')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'doctor'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setFilter('diagnostic')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'diagnostic'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diagnostics & Labs
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredServices.map(service => {
          const isSelected = selectedService.id === service.id;
          return (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-2 ring-teal-600/10'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-700'
                    }`}
                  >
                    {iconMap[service.iconName] || <Stethoscope className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {service.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 inline shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{service.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {service.room}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">~{service.durationMinutes}m</span>
                  <span className="font-bold text-slate-900 text-sm">{service.price}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
