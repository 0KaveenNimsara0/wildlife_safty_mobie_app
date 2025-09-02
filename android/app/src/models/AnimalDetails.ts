// models/AnimalDetails.ts
export interface AnimalDetails {
  Animal: string;
  ScientificName: string;
  LocalNames?: string;
  Venom?: string;
  Description: string;
  ConservationStatus: string;
  FunFact?: string;
  Treatment?: string;
  Family?: string;
  EndemicStatus?: string;
  error?: string;
}
