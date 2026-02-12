'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { CredentialForm } from './CredentialForm';

type Credential = {
  exchange: string;
  isTestnet: boolean;
};

export const CredentialsManager = () => {
  const t = useTranslations('CredentialsManager');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string | undefined>();

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/exchanges/credentials');
      if (!response.ok) {
        throw new Error('Failed to load credentials');
      }
      const data = await response.json();
      setCredentials(data.credentials || []);
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (exchange: string) => {
    if (!confirm(`Are you sure you want to delete credentials for ${exchange}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/exchanges/credentials/${exchange}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete credentials');
      }

      await loadCredentials();
    } catch (error) {
      console.error('Error deleting credentials:', error);
      alert('Failed to delete credentials');
    }
  };

  const handleValidate = async (exchange: string) => {
    try {
      const response = await fetch(`/api/exchanges/credentials/${exchange}/validate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to validate credentials');
      }

      const data = await response.json();
      alert(data.valid ? 'Credentials are valid' : 'Credentials are invalid');
    } catch (error) {
      console.error('Error validating credentials:', error);
      alert('Failed to validate credentials');
    }
  };

  if (isLoading) {
    return <div>Loading credentials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>{t('add_button')}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('add_credentials_title')}</CardTitle>
            <CardDescription>{t('add_credentials_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <CredentialForm
              exchange={selectedExchange}
              onSuccess={() => {
                setShowForm(false);
                setSelectedExchange(undefined);
                loadCredentials();
              }}
              onCancel={() => {
                setShowForm(false);
                setSelectedExchange(undefined);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {credentials.map(cred => (
          <Card key={cred.exchange}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{cred.exchange.replace(/_/g, ' ')}</span>
                {cred.isTestnet && <Badge variant="secondary">Testnet</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleValidate(cred.exchange)}
                >
                  {t('validate_button')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(cred.exchange)}
                >
                  {t('delete_button')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
