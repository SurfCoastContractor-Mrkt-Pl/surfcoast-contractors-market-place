import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Eye, Share2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingToolkit({ contractor }) {
  const [copied, setCopied] = useState(null);

  if (!contractor) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const templates = {
    bio: {
      title: 'Professional Bio',
      description: 'Use this bio across your profiles and marketing materials',
      templates: [
        {
          id: 'bio-1',
          name: 'Concise',
          content: `${contractor.name} is a dedicated ${contractor.contractor_type === 'trade_specific' ? contractor.trade_specialty : 'general'} contractor with ${contractor.years_experience || '10'} years of experience. Specializing in quality work and customer satisfaction, I'm committed to delivering exceptional results on every project.`
        },
        {
          id: 'bio-2',
          name: 'Detailed',
          content: `${contractor.name} is an experienced ${contractor.contractor_type === 'trade_specific' ? contractor.trade_specialty : 'general'} contractor based in ${contractor.location}. With ${contractor.years_experience || '10'} years of proven expertise, I provide reliable, high-quality services. My commitment to excellence and attention to detail ensures every project is completed to the highest standards. ${contractor.bio || 'Available for residential and commercial work.'}`
        },
        {
          id: 'bio-3',
          name: 'Engaging',
          content: `Meet ${contractor.name} – your trusted ${contractor.contractor_type === 'trade_specific' ? contractor.trade_specialty : 'general'} contractor. With ${contractor.years_experience || '10'} years of hands-on experience and a passion for excellence, I transform projects into success stories. From conception to completion, I bring professionalism, reliability, and craftsmanship to every job.`
        }
      ]
    },
    socials: {
      title: 'Social Media Posts',
      description: 'Ready-to-use posts for Instagram, Facebook, and Twitter',
      templates: [
        {
          id: 'social-1',
          name: 'Project Showcase',
          content: `✨ Just completed another amazing project! 🔨 At ${contractor.name}, we take pride in delivering exceptional quality work. Your dream project is just a message away. 📞 Call or text today for a free consultation!\n\n#${contractor.trade_specialty || 'ContractorLife'} #QualityWork #ServiceWithASmile`
        },
        {
          id: 'social-2',
          name: 'Testimonial Ask',
          content: `🌟 If ${contractor.name} has helped with your project, we'd love to hear about it! Your feedback means the world to us and helps other homeowners discover great service. Leave a review on our profile! ⭐\n\n#SatisfiedCustomers #LocalBusiness #SupportSmall`
        },
        {
          id: 'social-3',
          name: 'Availability Post',
          content: `📅 Now booking projects for the next season! Whether it's a small repair or a major renovation, ${contractor.name} is ready to help. Available for both residential and commercial work. DM or call for scheduling! 🔨\n\n#Scheduling #ReadyToWork #HireLocal`
        },
        {
          id: 'social-4',
          name: 'Tip/Education',
          content: `💡 Quick tip: Regular maintenance prevents costly repairs down the road. As your local ${contractor.contractor_type === 'trade_specific' ? contractor.trade_specialty : 'contractor'}, we recommend [seasonal task]. Questions? Let's chat!\n\n#ProTips #Maintenance #ExpertAdvice`
        }
      ]
    },
    email: {
      title: 'Email Templates',
      description: 'Professional email templates for customer communication',
      templates: [
        {
          id: 'email-1',
          name: 'Introduction',
          content: `Subject: Meet Your Local Contractor – ${contractor.name}\n\nHi [Customer Name],\n\nThank you for considering ${contractor.name} for your project needs. With ${contractor.years_experience || '10'} years of experience in ${contractor.contractor_type === 'trade_specific' ? contractor.trade_specialty : 'general contracting'}, I'm committed to delivering quality results on time and within budget.\n\nI'd love to discuss your project and provide you with a detailed estimate. Feel free to reach out at your convenience.\n\nBest regards,\n${contractor.name}`
        },
        {
          id: 'email-2',
          name: 'After Completed Work',
          content: `Subject: Thank You for Your Business!\n\nHi [Customer Name],\n\nThank you for trusting ${contractor.name} with your recent project. We truly appreciated the opportunity to work with you and hope you're satisfied with the results.\n\nIf you need any follow-up work or have any questions, please don't hesitate to reach out. Word-of-mouth referrals help us grow, so if you know anyone who could benefit from our services, we'd be grateful for the recommendation!\n\nBest regards,\n${contractor.name}`
        }
      ]
    },
    flyer: {
      title: 'Flyer Content',
      description: 'Copy for printed flyers and door hangers',
      templates: [
        {
          id: 'flyer-1',
          name: 'General Services Flyer',
          content: `🔨 ${contractor.name.toUpperCase()} 🔨\nYour Local Trusted Contractor\n\n✓ ${contractor.years_experience || '10'}+ Years Experience\n✓ Licensed & Insured\n✓ Free Estimates\n✓ Quality Guaranteed\n\nServing ${contractor.location}\n\n📞 [Your Phone]\n📧 [Your Email]\n🌐 [Your Website]\n\n"Turning Your Vision Into Reality"\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCall Today for Your Free Consultation!\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        },
        {
          id: 'flyer-2',
          name: 'Special Offer Flyer',
          content: `🎉 SPECIAL OFFER 🎉\n\n15% OFF YOUR FIRST PROJECT\n\n${contractor.name}\n${contractor.contractor_type === 'trade_specific' ? contractor.trade_specialty.toUpperCase() : 'GENERAL CONTRACTING'}\n\n✓ Professional & Reliable\n✓ Licensed & Insured  \n✓ Free Estimates\n✓ Satisfaction Guaranteed\n\n📞 [Phone Number]\n\nValid through [DATE]\nOffer code: WELCOME15\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nLet's Build Something Great Together!\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        }
      ]
    }
  };

  const TemplateCard = ({ template }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-semibold text-slate-900">{template.name}</h4>
        <Badge variant="outline" className="text-xs">Template</Badge>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
        <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono text-xs">
          {template.content}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs gap-1"
          onClick={() => copyToClipboard(template.content, template.id)}
        >
          <Copy className="w-3 h-3" />
          {copied === template.id ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1"
          onClick={() => {
            const element = document.createElement('a');
            element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(template.content);
            element.download = `${template.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
            element.click();
          }}
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Marketing Toolkit</h3>
            <p className="text-sm text-slate-600">
              Ready-to-use templates to promote your business across all channels
            </p>
          </div>
          <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
        </div>
      </Card>

      {/* Templates */}
      <Tabs defaultValue="bio" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="bio" className="text-xs sm:text-sm">Bio</TabsTrigger>
          <TabsTrigger value="socials" className="text-xs sm:text-sm">Social Posts</TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm">Email</TabsTrigger>
          <TabsTrigger value="flyer" className="text-xs sm:text-sm">Flyer</TabsTrigger>
        </TabsList>

        {Object.entries(templates).map(([key, section]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="text-sm text-slate-600 mb-4">
              {section.description}
            </div>
            <div className="space-y-4">
              {section.templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tips */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h4 className="font-semibold text-amber-900 mb-3">💡 Pro Marketing Tips</h4>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>✓ Keep your messaging consistent across all platforms</li>
          <li>✓ Use high-quality before/after photos of completed projects</li>
          <li>✓ Encourage satisfied customers to leave reviews and share testimonials</li>
          <li>✓ Update your bio and posts regularly with seasonal services</li>
          <li>✓ Share helpful tips and industry insights to build authority</li>
          <li>✓ Include clear calls-to-action with your contact information</li>
        </ul>
      </Card>
    </div>
  );
}