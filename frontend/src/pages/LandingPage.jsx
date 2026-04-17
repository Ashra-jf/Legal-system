import React from 'react';
import { Button } from '../components/ui/button';
import { Scale, FileText, CheckCircle, Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Shield, Users, Clock, Award, Star, ChevronRight, Briefcase } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const services = [
    {
      slug: 'corporate-law',
      icon: Briefcase,
      title: 'Corporate Services',
      description: 'Comprehensive legal support for businesses including formation and compliance.'
    },
    {
      slug: 'legal-consultation',
      icon: Scale,
      title: 'Legal Consultation',
      description: 'Professional legal advice for personal and business matters from experienced lawyers.',
    },
    {
      slug: 'contract-drafting',
      icon: FileText,
      title: 'Contract Drafting',
      description: 'Comprehensive contract preparation and review services for all types of agreements.',
    },
    {
      slug: 'document-verification',
      icon: CheckCircle,
      title: 'Document Verification',
      description: 'Thorough verification and authentication of legal documents and certificates.',
    },
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: 'Trusted & Reliable',
      description: 'Over 15 years of proven track record in delivering exceptional legal services to our clients.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Highly qualified lawyers and legal professionals dedicated to your success.',
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: '24/7 availability and rapid response to all client queries and urgent matters.',
    },
    {
      icon: Award,
      title: 'Success Rate',
      description: '98% success rate in case resolution and client satisfaction guaranteed.',
    },
  ];

  const testimonials = [
    {
      name: 'James Wilson',
      role: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      content: 'DNJ Legal Firm handled my corporate restructuring with utmost professionalism. Their attention to detail and prompt service made the entire process smooth and stress-free.',
      rating: 5,
    },
    {
      name: 'Priya Fernando',
      role: 'Entrepreneur',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      content: 'Excellent legal consultation services! The team is knowledgeable, responsive, and genuinely cares about achieving the best outcomes for their clients.',
      rating: 5,
    },
    {
      name: 'Anil Perera',
      role: 'Client',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      content: 'I highly recommend DNJ Legal Firm for any legal matters. They provided clear guidance throughout my case and delivered results beyond my expectations.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-[#0A2342]" />
              <span className="text-[#0A2342]">DNJ Legal Firm</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-[#0A2342] transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-[#0A2342] transition-colors">About</a>
              <a href="#services" className="text-gray-700 hover:text-[#0A2342] transition-colors">Services</a>
              <a href="#testimonials" className="text-gray-700 hover:text-[#0A2342] transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-[#0A2342] transition-colors">Contact</a>
              <Button
                onClick={() => onNavigate('login')}
                variant="outline"
                className="border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
              >
                Login
              </Button>
              <Button
                onClick={() => onNavigate('register')}
                className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
              >
                Register
              </Button>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <Button
                onClick={() => onNavigate('login')}
                variant="outline"
                size="sm"
                className="border-[#0A2342] text-[#0A2342]"
              >
                Login
              </Button>
              <Button
                onClick={() => onNavigate('register')}
                size="sm"
                className="bg-[#0A2342] text-white"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-[#0A2342] via-[#0A2342] to-[#1a3a5c] text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-sm">🏆 Sri Lanka's Trusted Legal Partner</span>
              </div>
              <h1 className="text-white mb-6">
                Your Trusted Partner for Legal Services
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0">
                At DNJ Legal Firm, we provide comprehensive legal solutions tailored to your needs.
                Our experienced team is committed to delivering professional services with integrity and excellence.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  onClick={() => onNavigate('register')}
                  size="lg"
                  className="bg-white text-[#0A2342] hover:bg-gray-100"
                >
                  Book a Consultation
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>

              </div>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                <div>
                  <div className="text-white mb-1">500+</div>
                  <div className="text-gray-300 text-sm">Happy Clients</div>
                </div>
                <div>
                  <div className="text-white mb-1">15+</div>
                  <div className="text-gray-300 text-sm">Years Experience</div>
                </div>
                <div>
                  <div className="text-white mb-1">98%</div>
                  <div className="text-gray-300 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-20 blur-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1685303276798-05e7f07d3927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXclMjBsaWJyYXJ5JTIwYm9va3N8ZW58MXx8fHwxNzYwODU5MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Law library and legal books"
                className="relative w-full h-[500px] object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#0A2342] mb-4">Why Choose DNJ Legal Firm</h2>
            <div className="w-20 h-1 bg-[#0A2342] mx-auto mb-6"></div>
            <p className="text-gray-700 max-w-3xl mx-auto text-lg">
              We combine expertise, dedication, and personalized service to deliver outstanding legal solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center group hover:-translate-y-2 transition-all duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0A2342] to-[#1a3a5c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl transition-shadow">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-[#0A2342] mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section with Image */}
      <section id="about" className="py-20 bg-[#E5F1FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1683770997177-0603bd44d070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBwcm9mZXNzaW9uYWwlMjB0ZWFtfGVufDF8fHx8MTc2MDg1OTEyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Professional legal team"
                className="w-full h-[450px] object-cover rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-[#0A2342] mb-6">About DNJ Legal Firm</h2>
              <div className="w-20 h-1 bg-[#0A2342] mb-6"></div>
              <p className="text-gray-700 mb-6 text-lg">
                DNJ Legal Firm is a leading provider of legal services in Sri Lanka. With years of experience
                and a dedicated team of professionals, we are committed to helping our clients succeed in
                achieving their legal goals.
              </p>
              <p className="text-gray-700 mb-8">
                Our commitment to excellence, integrity, and client satisfaction sets us apart trusted partner
                in your legal journey. We understand that every client's situation is unique, and we provide personalized
                solutions tailored to your specific needs.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#0A2342]">
                  <div className="text-[#0A2342] mb-2">Professional Excellence</div>
                  <p className="text-gray-600 text-sm">Certified lawyers with extensive experience</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#0A2342]">
                  <div className="text-[#0A2342] mb-2">Client-Focused</div>
                  <p className="text-gray-600 text-sm">Your success is our priority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#0A2342] mb-4">Our Services</h2>
            <div className="w-20 h-1 bg-[#0A2342] mx-auto mb-6"></div>
            <p className="text-gray-700 max-w-3xl mx-auto text-lg">
              We offer a comprehensive range of legal services designed to meet your specific needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-lg border-2 border-gray-200 hover:border-[#0A2342] hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#E5F1FB] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0A2342] transition-colors">
                    <Icon className="w-8 h-8 text-[#0A2342] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-[#0A2342] mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <button
                    onClick={() => onNavigate('service-details', service.slug)}
                    className="text-[#0A2342] flex items-center gap-2 group-hover:gap-3 transition-all hover:underline"
                  >
                    Learn More <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0A2342] to-[#1a3a5c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-6">Need Legal Assistance?</h2>
          <p className="text-gray-200 max-w-2xl mx-auto mb-8 text-lg">
            Schedule a consultation with our expert legal team today and take the first step towards resolving your legal matters.
          </p>
          <Button
            onClick={() => onNavigate('register')}
            size="lg"
            className="bg-white text-[#0A2342] hover:bg-gray-100"
          >
            Book Your Consultation Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-[#E5F1FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#0A2342] mb-4">What Our Clients Say</h2>
            <div className="w-20 h-1 bg-[#0A2342] mx-auto mb-6"></div>
            <p className="text-gray-700 max-w-3xl mx-auto text-lg">
              Don't just take our word for it - hear from our satisfied clients.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-[#0A2342]">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#0A2342] mb-4">Contact Us</h2>
            <div className="w-20 h-1 bg-[#0A2342] mx-auto mb-6"></div>
            <p className="text-gray-700 max-w-3xl mx-auto text-lg">
              Get in touch with us today for professional legal assistance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-[#E5F1FB] rounded-lg border-2 border-transparent hover:border-[#0A2342] transition-all">
              <div className="w-16 h-16 bg-[#0A2342] rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#0A2342] mb-3">Address</h3>
              <p className="text-gray-700">UE Perera Mawatha<br />Colombo, Sri Lanka</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-[#E5F1FB] rounded-lg border-2 border-transparent hover:border-[#0A2342] transition-all">
              <div className="w-16 h-16 bg-[#0A2342] rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#0A2342] mb-3">Phone</h3>
              <p className="text-gray-700">+94 11 234 5678<br />+94 77 123 4567</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-[#E5F1FB] rounded-lg border-2 border-transparent hover:border-[#0A2342] transition-all">
              <div className="w-16 h-16 bg-[#0A2342] rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#0A2342] mb-3">Email</h3>
              <p className="text-gray-700">info@dnjlegal.lk<br />support@dnjlegal.lk</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2342] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-6 h-6" />
                <span>DNJ Legal Firm</span>
              </div>
              <p className="text-gray-300">Your trusted partner for legal services in Sri Lanka.</p>
            </div>
            <div>
              <h3 className="mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                <a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="mb-4">Services</h3>
              <div className="flex flex-col gap-2">
                <span className="text-gray-300">Corporate Services</span>
                <span className="text-gray-300">Legal Consultation</span>
                <span className="text-gray-300">Contract Drafting</span>
                <span className="text-gray-300">Document Verification</span>
              </div>
            </div>
            <div>
              <h3 className="mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-300">
            <p>© 2025 DNJ Legal Firm | All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
