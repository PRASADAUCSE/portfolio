
// Main App Component - Portfolio with AI Chat
import { useState, useEffect, useRef } from 'react';

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Icons
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const LoadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// Helper for joining class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Chat Component
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! 👋 I'm your AI assistant. Feel free to ask me anything about my background, skills, experience, or projects!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history
        })
      });

      const data = await response.json();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please make sure the backend server is running.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Chat Assistant</h3>
                <p className="text-white/70 text-xs">Ask me about my portfolio</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                  <LoadingIcon />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about my experience..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl",
          isOpen
            ? "bg-gray-800 text-white"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-110"
        )}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}

// Section Component
function Section({ id, title, children, className }) {
  return (
    <section id={id} className={cn("py-20 px-4 md:px-8", className)}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 relative">
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </span>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" />
        </h2>
        {children}
      </div>
    </section>
  );
}

// Navbar Component
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = navLinks.map(link => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Portfolio
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeSection === link.id
                  ? "text-violet-600 bg-violet-50"
                  : "text-gray-600 hover:text-violet-600 hover:bg-violet-50/50"
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600"
        >
          {mobileMenuOpen ? <CloseIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-violet-50 hover:text-violet-600"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// Hero Section
function Hero({ resume }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-100 rounded-full blur-3xl" />
      </div>

      <div className={cn(
        "relative z-10 text-center px-4 transition-all duration-1000",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}>
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
            👋 Hello, I'm {resume.name}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent animate-pulse">
            {resume.title}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
          {resume.summary}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-xl hover:scale-105 transition-all"
          >
            View My Work
          </button>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-white text-violet-600 rounded-full font-medium border-2 border-violet-200 hover:border-violet-600 hover:shadow-lg transition-all"
          >
            Contact Me
          </button>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mt-12">
          <a
            href={resume.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
          </a>
          <a
            href={resume.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href={`mailto:${resume.email}`}
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDownIcon />
        </div>
      </div>
    </section>
  );
}

// Skills Section
function Skills({ skills }) {
  const categories = Object.entries(skills);

  return (
    <Section id="skills" title="Skills & Technologies">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(([category, techs], index) => (
          <div
            key={category}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-violet-600 rounded-full" />
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {techs.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 rounded-full text-sm font-medium border border-violet-100"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// Experience Section
function Experience({ experience }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <Section id="experience" title="Work Experience">
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                  💼
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{exp.role}</h3>
                  <p className="text-violet-600 font-medium">{exp.company}</p>
                  <p className="text-gray-500 text-sm mt-1">{exp.period}</p>
                </div>
              </div>
              <div className={cn(
                "p-2 rounded-full bg-gray-50 transition-transform",
                expandedIndex === index ? "rotate-180" : ""
              )}>
                <ChevronDownIcon />
              </div>
            </button>
            {expandedIndex === index && (
              <div className="px-6 pb-6 pt-0 border-t border-gray-100">
                <p className="text-gray-600 mt-4">{exp.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// Projects Section
function Projects({ projects }) {
  return (
    <Section id="projects" title="Projects">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 group"
          >
            <div className="h-40 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-6xl">
              🚀
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-violet-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <a className="text-violet-600 hover:text-violet-700 text-sm mb-4 font-medium" href={project.link} target="_blank" rel="noopener noreferrer">View Project →</a>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// Education Section
function Education({ education }) {
  return (
    <Section id="about" title="Education">
      <div className="grid md:grid-cols-2 gap-6">
        {education.map((edu, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                🎓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                <p className="text-violet-600 font-medium">{edu.institution}</p>
                <p className="text-gray-500 text-sm">{edu.period}</p>
                <p className="text-gray-600 text-sm mt-2">{edu.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">Certifications</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {["AWS Solutions Architect Associate", "Google Cloud Professional Developer", "Meta Front-End Developer Certificate"].map((cert, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 rounded-full text-sm font-medium border border-violet-100"
            >
              🏆 {cert}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

// Contact Section
function Contact({ resume }) {
  return (
    <Section id="contact" title="Get In Touch">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              📬
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Let's Connect!</h3>
            <p className="text-gray-600">Feel free to reach out for collaborations or just a friendly hello</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{resume.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-800">{resume.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">{resume.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <a
              href={resume.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href={resume.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-400">
          © {new Date().getFullYear()} Portfolio. Built with React & Python
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Featuring AI-powered chat assistant
        </p>
      </div>
    </footer>
  );
}

// Main App Component
export default function App() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/resume`);
        if (!response.ok) throw new Error('Failed to fetch resume');
        const data = await response.json();
        setResume(data);
      } catch (err) {
        // Use default resume data if API is not available
        setResume(null);
        console.log('Using default resume data');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  // Default resume data
  const defaultResume = {
    name: "Jakka Chenchu Prasad",
    title: "BTECH Undergraduate",
    email: "chenchuprasad72@gmail.com",
    phone: "+91 9347774361",
    location: "Andhra Pradesh, India",
    linkedin: "https://www.linkedin.com/in/jakka-prasad/",
    github: "https://github.com/PRASADAUCSE",
    summary: "I'm a BTECH undergraduate seeking an entry level position to apply my technical skills and theoretical knowledge in practical scenarios for contributing innovative solutions and continual learning in the field.",
    skills: {
        "Programming": ["Java", "MySQL"],
        "Web Technologies": ["HTML", "CSS", "JavaScript", "Redux"],
        "Core Competencies": ["OS", "DBMS"],
        "Tools": ["GitHub", "VS Code"]
    },
    experience: [
        {
            "role": "Frontend Developer Intern",
            "company": "Plasmid",
            "period": "Aug 2024 - Oct 2024",
            "description": "Worked with a team of four to develop a responsive food ordering web application using ReactJS and JavaScript, focusing on features like restaurant listings, menu browsing, and cart management."
        },
        {
            "role": "Teaching Assistant",
            "company": "Mentiby",
            "period": "Apr 2025 - Aug 2025",
            "description": "Served as a teaching assistant responsible for clarifying complex aptitude concepts and guiding students through problem-solving techniques to strengthen understanding."
        }
    ],
    education: [
        {
            "degree": "Bachelor's Degree",
            "institution": "Andhra University",
            "period": "2022 - 2026",
            "details": "CGPA: 8.35"
        },
        {
            "degree": "Intermediate",
            "institution": "Sri Prakash Junior College",
            "period": "2020 - 2022",
            "details": "CGPA: 9"
        },
        {
            "degree": "10th Standard",
            "institution": "Sri Chaitanya",
            "period": "2019 - 2020",
            "details": "CGPA: 10"
        }
    ],
    projects: [
        {
            "name": "Movies Recommendation System",
            "period": "Apr 2025 - May 2025",
            "link": "https://netflix-gpt-dg8x.vercel.app/",
            "description": "Developed a responsive movie platform with React, delivering a Netflix-like browsing experience by integrating multiple APIs and GPT API for intelligent search and personalized recommendations. Implemented Firebase authentication for secure user access, managed global state with Redux Toolkit, and optimized performance through reusable components and modular code.",
            "technologies": ["React", "Redux Toolkit", "Firebase", "GPT API"]
        },
        {
            "name": "Wikipedia Search Application",
            "period": "Dec 2024",
            "link": "https://prasadwiksearch.ccbp.tech/",
            "description": "Built a responsive search application using HTML, CSS, Bootstrap, and JavaScript to deliver curated Wikipedia results with a clean, adaptive UI. Implemented asynchronous Fetch API calls for real-time search and enabled seamless navigation to detailed Wikipedia pages in new tabs.",
            "technologies": ["HTML", "CSS", "Bootstrap", "JavaScript", "Fetch API"]
        },
        {
            "name": "Todos Application",
            "period": "Dec 2024",
            "link": "https://chenchutodoapp.ccbp.tech/",
            "description": "Built a responsive todos application using React, HTML, CSS, and JavaScript to manage tasks with features like task creation, editing, deletion, and filtering. Implemented local storage for persistent data management and a clean UI with intuitive controls.",
            "technologies": ["React", "HTML", "CSS", "JavaScript", "Local Storage"]
        },
        {
            "name": "AI resume analyzer",
            "period": "Dec 2024",
            "link": "https://resume-analyzer-eight-rho.vercel.app/",
            "description": "Developed a responsive resume analyzer application using React, Tailwind CSS, and JavaScript to analyze resumes and provide feedback on strengths and weaknesses. Implemented local storage for persistent data management and a clean UI with intuitive controls.",
            "technologies": ["React", "Tailwind CSS", "JavaScript", "Local Storage"]
        }
    ],
    achievements: [
        "Awarded First Prize at the College's Department Day Hackathon, demonstrating exceptional problem-solving and innovative application of technical skills."
    ]
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-zinc-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const resumeData = resume || defaultResume;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Navbar />
      <Hero resume={resumeData} />
      <AboutSection summary={resumeData.summary} />
      <Skills skills={resumeData.skills} />
      <Experience experience={resumeData.experience} />
      <Projects projects={resumeData.projects} />
      <Education education={resumeData.education} />
      <Contact resume={resumeData} />
      <Footer />
      <ChatWidget />
    </div>
  );
}

// About Section Component
function AboutSection({ summary }) {
  return (
    <Section id="about" title="About Me">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <p className="text-lg text-gray-700 leading-relaxed">
            {summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
              🚀 Problem Solver
            </span>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              💡 Creative Thinker
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              🤝 Team Player
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              📚 Continuous Learner
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
