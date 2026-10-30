import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Layers, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { optimizePrompt } from '../../api/client';

export default function PromptStudioView({ onSendToChat }) {
  const [prompt, setPrompt] = useState('Create a Node.js express route for user avatar upload');
  const [framework, setFramework] = useState('CO-STAR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const frameworks = [
    { id: 'CO-STAR', name: 'CO-STAR', desc: 'Context, Objective, Style, Tone, Audience, Response' },
    { id: 'Few-Shot Expert', name: 'Few-Shot Expert', desc: 'Role Persona, Step-by-Step Logic, Guardrails' },
    { id: 'Strict Guardrails', name: 'Strict Guardrails', desc: 'Negative Constraints & Strict Output Schema' }
  ];

  const presets = [
    { label: 'API Endpoint Generator', text: 'Create a Node.js express route for user avatar upload' },
    { label: 'RAG Context Grounder', text: 'Answer questions strictly using provided retrieved documents with citations' },
    { label: 'Executive Summarizer', text: 'Summarize quarterly financial results for non-technical leadership' },
    { label: 'SQL Query Architect', text: 'Write an optimized PostgreSQL query to find top 5 spending customers with indexes' },
    { label: 'Code Reviewer Persona', text: 'Review this JavaScript function for memory leaks and performance bottlenecks' }
  ];

  const handleOptimize = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await optimizePrompt(prompt, framework);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to optimize prompt. Please ensure Gemini API Key is loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.optimizedPrompt) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchInChat = () => {
    if (!result?.optimizedPrompt) return;
    if (typeof onSendToChat === 'function') {
      onSendToChat(result.optimizedPrompt);
    }
  };

  return (
    <div style={{
      padding: '28px 36px',
      overflowY: 'auto',
      height: 'calc(100vh - 68px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1180px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
          }}>
            <Wand2 size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Prompt Engineering Studio & Optimizer
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Transform rough, informal ideas into battle-tested, high-precision prompts for LLMs and autonomous agents.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          fontSize: '0.76rem',
          color: '#a5b4fc',
          fontWeight: 600
        }}>
          <Sparkles size={14} />
          <span>NexusAI Optimizer</span>
        </div>
      </div>

      {/* Preset Blueprints */}
      <div>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Blueprint Presets
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(preset.text)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: prompt === preset.text ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: prompt === preset.text ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                color: prompt === preset.text ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: result ? '1fr 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Input and Framework Selector */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Framework Choice */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={15} color="#818cf8" />
              Optimization Framework
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
              {frameworks.map(fw => (
                <div
                  key={fw.id}
                  onClick={() => setFramework(fw.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: framework === fw.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    border: framework === fw.id ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: framework === fw.id ? '#ffffff' : 'var(--text-secondary)' }}>
                    {fw.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                    {fw.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Input Textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Raw Prompt or Casual Request
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {prompt.length} characters
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter any rough instruction (e.g. Write a python script to scrape prices and send an alert)..."
              rows={6}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => { setPrompt(''); setResult(null); setError(null); }}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={14} />
              Clear
            </button>

            <button
              onClick={handleOptimize}
              disabled={loading || !prompt.trim()}
              className="btn btn-primary"
              style={{
                padding: '10px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                fontWeight: 600
              }}
            >
              <Wand2 size={16} />
              {loading ? 'Optimizing Architecture...' : 'Optimize Prompt'}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Zap size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Optimized Output Result */}
        {result && (
          <div className="glass-panel" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                  Engineered Prompt
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {result.framework}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: copied ? '#34d399' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>

                {onSendToChat && (
                  <button
                    onClick={handleLaunchInChat}
                    className="btn btn-primary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={13} />
                    Run in Chat
                  </button>
                )}
              </div>
            </div>

            {/* Improvements Badges */}
            {result.improvements && result.improvements.length > 0 && (
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Key Enhancements Applied:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.improvements.map((imp, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: '#c7d2fe',
                        fontSize: '0.72rem'
                      }}
                    >
                      • {imp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Output Container */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.86rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxHeight: '360px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)'
            }}>
              {result.optimizedPrompt}
            </div>

            {/* Technique explanation footer */}
            {result.technique && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.74rem',
                color: 'var(--text-muted)'
              }}>
                <Zap size={13} color="#818cf8" />
                <span>Strategy: {result.technique}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
