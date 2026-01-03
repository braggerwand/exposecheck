
import React from 'react';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  // Hier wird React.ReactNode verwendet, daher muss React importiert sein
  icon: React.ReactNode;
}