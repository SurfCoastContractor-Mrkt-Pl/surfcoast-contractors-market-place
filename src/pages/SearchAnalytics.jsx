import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Eye, Mouse, Target, RefreshCw } from 'lucide-react';

export default function SearchAnalytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [days, setDays] = useState(90);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('fetchSearchConsoleData', {
        days,
        row_limit: 100,
      });

      if (response.data.success) {
        setData(response.data);
      } else {
        setError(response.data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch search data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Search Analytics</h1>
          <p className="text-slate-600">Top contractor search queries and ranking performance</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex gap-2">
            {[30, 90, 180].map((d) => (
              <Button
                key={d}
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
                disabled={loading}
              >
                Last {d} days
              </Button>
            ))}
          </div>
          <Button onClick={fetchData} disabled={loading} variant="outline" className="ml-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !data && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Summary Cards */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
                    <Eye className="w-4 h-4" />
                    Total Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{data.summary.totalImpressions.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Search results shown</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
                    <Mouse className="w-4 h-4" />
                    Total Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{data.summary.totalClicks.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Clicks from search</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    Avg CTR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{data.summary.avgCtr}%</p>
                  <p className="text-xs text-slate-500 mt-1">Click-through rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
                    <Target className="w-4 h-4" />
                    Avg Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{data.summary.avgPosition}</p>
                  <p className="text-xs text-slate-500 mt-1">Average ranking</p>
                </CardContent>
              </Card>
            </div>

            {/* Queries Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
                <CardDescription>Keywords people search to find contractors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Query</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">Impressions</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">Clicks</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">CTR</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.queries.map((query, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900 font-medium">{query.query}</td>
                          <td className="text-right py-3 px-4 text-slate-600">{query.impressions.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-slate-600">{query.clicks.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-slate-600">{query.ctr}%</td>
                          <td className="text-right py-3 px-4 text-slate-600">
                            <span className={query.position <= 3 ? 'text-green-600 font-semibold' : query.position <= 10 ? 'text-blue-600' : 'text-orange-600'}>
                              {query.position}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pages Table */}
            {data.pages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Pages</CardTitle>
                  <CardDescription>Pages with most impressions and clicks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Page</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-900">Impressions</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-900">Clicks</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-900">CTR</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-900">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pages.map((page, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900 text-sm truncate">{page.page}</td>
                            <td className="text-right py-3 px-4 text-slate-600">{page.impressions.toLocaleString()}</td>
                            <td className="text-right py-3 px-4 text-slate-600">{page.clicks.toLocaleString()}</td>
                            <td className="text-right py-3 px-4 text-slate-600">{page.ctr}%</td>
                            <td className="text-right py-3 px-4 text-slate-600">
                              <span className={page.position <= 3 ? 'text-green-600 font-semibold' : page.position <= 10 ? 'text-blue-600' : 'text-orange-600'}>
                                {page.position}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}