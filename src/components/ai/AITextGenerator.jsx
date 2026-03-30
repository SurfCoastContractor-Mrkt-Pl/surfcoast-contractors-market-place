import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wand2, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AITextGenerator({ 
  contentType = 'bio',
  label = 'Generate with AI',
  placeholder = 'Enter what you want to generate...',
  onGenerate = () => {},
  maxTokens = 500,
}) {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('generateTextContent', {
        prompt,
        contentType,
      });

      const text = response.data?.generatedText || response.data;
      setGeneratedText(text);
      onGenerate(text);
    } catch (err) {
      setError(err.message || 'Failed to generate text');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
        <Textarea
          placeholder={placeholder}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError('');
          }}
          className="min-h-24"
          maxLength={500}
        />
        <p className="text-xs text-slate-500 mt-1">
          {prompt.length}/500 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </>
        )}
      </Button>

      {/* Generated Output */}
      {generatedText && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Generated Text:</p>
            <p className="text-sm text-slate-700 leading-relaxed">{generatedText}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}