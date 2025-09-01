// models/AnimalDetails.ts
export interface AnimalDetails {
  Animal: string;
  ScientificName: string;
  LocalNames?: string;
  Venom?: string;
  Description: string;
  ConservationStatus: string;
  FunFact?: string;
  error?: string;
}
