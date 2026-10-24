import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Wrench } from 'lucide-react';
import { PageContainer, Button, Card } from '../components/ui/index.js';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageContainer maxWidth="3xl">
      <Card className="text-center py-16 px-6 space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-tint text-green flex items-center justify-center mx-auto shadow-xs">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-green">
            Error 404
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-ink">
            Page Not Found
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            The decision pathway or assessment you're looking for does not exist or has been retired.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/assess"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-brand bg-brand text-white font-bold text-sm shadow-xs hover:bg-brand-deep transition-colors"
          >
            Assess an item
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-brand border border-ink-border bg-white text-ink font-semibold text-sm hover:bg-brand-surfaceAlt transition-colors"
          >
            Return Home
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
