import React from 'react';
import { Button } from '../components/ui/button';
import { Scale, Globe, FileText, CheckCircle, ChevronLeft, Check, Clock, DollarSign, Shield } from 'lucide-react';

const serviceDetails = {
    'corporate-law': {
        icon: Scale,
        title: 'Corporate Services',
        description: 'Comprehensive legal support for businesses including formation and compliance.',
        fullDescription: 'Our corporate legal services cover business formation, restructuring, compliance, and dispute resolution. We provide end-to-end support from initial consultation to complete corporate governance, ensuring your business is legally sound and protected.',
        features: [
            'Business formation & registration',
            'Corporate governance advice',
            'Mergers and acquisitions support',
            'Regulatory compliance checks',
            'Drafting corporate resolutions',
            'Shareholder agreements',
            'Dispute resolution',
            'Ongoing legal counsel'
        ],
        process: [
            { step: 1, title: 'Initial Consultation', description: 'Discuss your business structure and requirements' },
            { step: 2, title: 'Document Collection', description: 'Gather all necessary corporate documents' },
            { step: 3, title: 'Strategy Preparation', description: 'Review options and advise on legal strategy' },
            { step: 4, title: 'Filing', description: 'File necessary paperwork with authorities' },
            { step: 5, title: 'Ongoing Support', description: 'Provide continued legal guidance' }
        ],
        pricing: 'Starting from Rs. 25,000',
        duration: '1-3 weeks (varies by complexity)',
        benefits: [
            'Assures corporate compliance',
            'Expert guidance throughout the lifecycle',
            'Time-saving and stress-free',
            'Minimize business risks'
        ]
    },
    'legal-consultation': {
        icon: Scale,
        title: 'Legal Consultation Services',
        description: 'Professional legal advice for personal and business matters from experienced lawyers.',
        fullDescription: 'Get expert legal guidance on various matters including family law, property disputes, contract negotiations, business law, and more. Our experienced lawyers provide personalized consultations tailored to your specific situation, helping you make informed decisions.',
        features: [
            'Initial case assessment',
            'Legal strategy development',
            'Contract review and negotiation',
            'Dispute resolution advice',
            'Litigation support',
            'Legal documentation review',
            'Ongoing legal counsel',
            'Confidential consultations'
        ],
        process: [
            { step: 1, title: 'Book Consultation', description: 'Schedule an appointment with our lawyers' },
            { step: 2, title: 'Case Review', description: 'Discuss your legal matter in detail' },
            { step: 3, title: 'Legal Analysis', description: 'We analyze your case and options' },
            { step: 4, title: 'Action Plan', description: 'Receive recommendations and next steps' },
            { step: 5, title: 'Implementation', description: 'We help execute the legal strategy' }
        ],
        pricing: 'Rs. 20,000 per hour',
        duration: '1 hour consultation',
        benefits: [
            'Expert legal advice',
            'Personalized solutions',
            'Peace of mind',
            'Cost-effective legal support'
        ]
    },
    'contract-drafting': {
        icon: FileText,
        title: 'Contract Drafting Services',
        description: 'Comprehensive contract preparation and review services for all types of agreements.',
        fullDescription: 'Professional contract drafting and review services for business agreements, employment contracts, lease agreements, partnership deeds, and more. Our lawyers ensure your contracts are legally sound, protect your interests, and minimize potential disputes.',
        features: [
            'Custom contract drafting',
            'Contract review and analysis',
            'Terms and conditions optimization',
            'Legal compliance verification',
            'Risk assessment',
            'Negotiation support',
            'Contract amendments',
            'Template customization'
        ],
        process: [
            { step: 1, title: 'Requirement Gathering', description: 'Understand your contract needs' },
            { step: 2, title: 'Draft Preparation', description: 'Create initial contract draft' },
            { step: 3, title: 'Review & Revision', description: 'Review and incorporate feedback' },
            { step: 4, title: 'Legal Compliance', description: 'Ensure legal compliance and protection' },
            { step: 5, title: 'Final Delivery', description: 'Deliver finalized contract' }
        ],
        pricing: 'Starting from Rs. 30,000',
        duration: '3-7 days',
        benefits: [
            'Legally binding contracts',
            'Risk minimization',
            'Clear terms and conditions',
            'Professional drafting'
        ]
    },
    'document-verification': {
        icon: CheckCircle,
        title: 'Document Verification Services',
        description: 'Thorough verification and authentication of legal documents and certificates.',
        fullDescription: 'Professional document verification and authentication services for educational certificates, employment documents, property papers, and other legal documents. We ensure your documents are authentic, legally valid, and accepted by relevant authorities.',
        features: [
            'Document authenticity verification',
            'Notarization services',
            'Apostille assistance',
            'Translation verification',
            'Educational certificate verification',
            'Employment document verification',
            'Property document verification',
            'Government liaison services'
        ],
        process: [
            { step: 1, title: 'Document Submission', description: 'Submit documents for verification' },
            { step: 2, title: 'Initial Review', description: 'Preliminary document assessment' },
            { step: 3, title: 'Verification Process', description: 'Authenticate with relevant authorities' },
            { step: 4, title: 'Certification', description: 'Provide verification certificate' },
            { step: 5, title: 'Delivery', description: 'Return verified documents' }
        ],
        pricing: 'Starting from Rs. 20,000',
        duration: '2-5 days',
        benefits: [
            'Guaranteed authenticity',
            'Legally recognized verification',
            'Fast processing',
            'Reliable service'
        ]
    }
};

export default function ServiceDetailsPage({ service, onNavigate }) {
    const details = serviceDetails[service] || serviceDetails['legal-consultation'];
    const Icon = details.icon;

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Scale className="w-8 h-8 text-[#0A2342]" />
                            <span className="text-2xl font-bold text-[#0A2342]">DNJ Legal Firm</span>
                        </div>
                        <Button
                            onClick={() => onNavigate('landing')}
                            variant="outline"
                            className="border-[#0A2342] text-[#0A2342]"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#0A2342] to-[#1a3a5c] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Icon className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{details.title}</h1>
                            <p className="text-gray-200 text-lg">{details.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Column - Main Details */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Overview */}
                            <div>
                                <h2 className="text-3xl font-bold text-[#0A2342] mb-4">Overview</h2>
                                <p className="text-gray-700 text-lg leading-relaxed">{details.fullDescription}</p>
                            </div>

                            {/* Key Features */}
                            <div>
                                <h2 className="text-3xl font-bold text-[#0A2342] mb-6">Key Features</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {details.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 bg-[#E5F1FB] p-4 rounded-lg">
                                            <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Process */}
                            <div>
                                <h2 className="text-3xl font-bold text-[#0A2342] mb-6">Our Process</h2>
                                <div className="space-y-4">
                                    {details.process.map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-12 h-12 bg-[#0A2342] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-[#0A2342] mb-1">{item.title}</h3>
                                                <p className="text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">

                            {/* Benefits */}
                            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                                <h3 className="text-xl font-bold text-[#0A2342] mb-4">Why Choose Us</h3>
                                <div className="space-y-3">
                                    {details.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-[#0A2342] to-[#1a3a5c] text-white p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
                                <p className="text-gray-200 mb-4">Contact us for a free consultation</p>
                                <Button
                                    onClick={() => onNavigate('register')}
                                    className="w-full bg-white text-[#0A2342] hover:bg-gray-100"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
