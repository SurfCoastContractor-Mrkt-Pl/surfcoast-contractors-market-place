/**
 * PostSignupContractorDiscovery — shown on the CustomerSignup success page
 * and the CustomerPortal to direct clients to find contractors.
 */
import { Link } from 'react-router-dom';
import { Search, Star, Users, ArrowRight } from 'lucide-react';

const TRADES = [
  { label: 'Plumbers', slug: 'plumbers' },
  { label: 'Electricians', slug: 'electricians' },
  { label: 'HVAC', slug: 'hvac-technicians' },
  { label: 'Carpenters', slug: 'carpenters' },
  { label: 'Painters', slug: 'painters' },
  { label: 'Roofers', slug: 'roofers' },
  { label: 'General Contractors', slug: 'general-contractors' },
  { label: 'Landscapers', slug: 'landscapers' },
];

export default function PostSignupContractorDiscovery() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Find a Contractor Near You</h3>
          <p className="text-sm text-gray-600">Browse verified pros by trade</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {TRADES.map(trade => (
          <Link
            key={trade.slug}
            to={`/contractors/${trade.slug}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white border border-blue-200 text-sm font-semibold text-blue-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-center"
          >
            {trade.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/FindContractors"
          className="flex items-center justify-center gap-2 flex-1 px-5 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
        >
          <Users className="w-4 h-4" />
          Browse All Contractors
        </Link>
        <Link
          to="/QuoteRequestWizard"
          className="flex items-center justify-center gap-2 flex-1 px-5 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
        >
          <Star className="w-4 h-4" />
          Request a Quote
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}