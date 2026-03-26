import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Zap, Star, Target } from 'lucide-react';
import { TIME_PERIODS } from '@/lib/metricsCalculator';

export default function MetricsPanel({ metrics, onPeriodChange, currentPeriod = 'all_time' }) {
  if (!metrics) return null;

  const { performance, revenue, customers } = metrics;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(TIME_PERIODS).map(([key, { label }]) => (
          <Button
            key={key}
            variant={currentPeriod === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(key)}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{performance.completionRate}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-slate-900">{performance.avgResponseTime}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <Star className="w-3 h-3" /> Rating
              </p>
              <p className="text-2xl font-bold text-slate-900">{performance.avgRating}/5</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Reviews</p>
              <p className="text-2xl font-bold text-slate-900">{performance.reviewCount}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Revenue Metrics */}
      {revenue && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Revenue
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-slate-900">${revenue.totalEarnings}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Completed Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{revenue.completedJobs}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Avg Job Earnings</p>
              <p className="text-2xl font-bold text-slate-900">${revenue.avgJobEarnings}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{revenue.activeJobs}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Customer Metrics */}
      {customers && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Customer Acquisition & Retention
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">New Customers</p>
              <p className="text-2xl font-bold text-slate-900">{customers.newCustomers}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Repeat Customers</p>
              <p className="text-2xl font-bold text-slate-900">{customers.repeatCustomers}</p>
            </Card>
            {customers.repeatRate !== undefined && (
              <Card className="p-4">
                <p className="text-xs text-slate-600 mb-1">Repeat Rate</p>
                <p className="text-2xl font-bold text-slate-900">{customers.repeatRate}%</p>
              </Card>
            )}
            <Card className="p-4">
              <p className="text-xs text-slate-600 mb-1">Total Reviews</p>
              <p className="text-2xl font-bold text-slate-900">{customers.totalReviews || customers.reviewCount}</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}