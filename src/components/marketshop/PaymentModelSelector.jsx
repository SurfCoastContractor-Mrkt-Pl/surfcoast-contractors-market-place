import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentModelSelector({ onSelect, disabled = false }) {
  const [selected, setSelected] = useState(null);

  const models = [
    {
      id: 'subscription',
      name: 'Monthly Subscription',
      price: '$35',
      period: '/month',
      description: 'Flat monthly fee',
      features: [
        'Predictable monthly costs',
        'All features included',
        'Cancel anytime after billing cycle'
      ]
    },
    {
      id: 'facilitation',
      name: 'Facilitation Fee',
      price: '5%',
      period: 'per transaction',
      description: 'Only pay when you earn',
      features: [
        'No upfront costs',
        'Pay only on sales',
        'Switch to subscription anytime'
      ]
    }
  ];

  const handleSelect = (id) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Payment Model</h2>
        <p className="text-slate-600">Select how you'd like to pay for your vendor listing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <Card
            key={model.id}
            className={cn(
              'cursor-pointer transition-all border-2',
              selected === model.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            )}
            onClick={() => !disabled && handleSelect(model.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{model.name}</CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </div>
                {selected === model.id && (
                  <div className="bg-blue-600 rounded-full p-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">{model.price}</span>
                <span className="text-slate-600 ml-1">{model.period}</span>
              </div>
              <ul className="space-y-2">
                {model.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}