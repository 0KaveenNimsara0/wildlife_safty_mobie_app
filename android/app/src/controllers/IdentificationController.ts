// controllers/IdentificationController.ts
import { Asset } from 'react-native-image-picker';
import { NativeModules } from 'react-native';
import { PREDICTION_API_URL } from '../config/api';
import snakeData from '../assets/snake_data.json';
import { AnimalDetails } from '../models/AnimalDetails';

const { ImageClassifier } = NativeModules;

export class IdentificationController {
  static async identifyOffline(imageUri: string): Promise<Partial<AnimalDetails> | { error: string }> {
    try {
      const predictedClass = await ImageClassifier.classifyImage(imageUri);
      const lookupKey = predictedClass.toLowerCase().trim();
      const details = snakeData.find(
        (snake: any) =>
          snake['Common English Name(s)'].toLowerCase().trim() === lookupKey,
      );
      if (details) {
        return {
          Animal: details['Common English Name(s)'],
          ScientificName: details['Scientific Name & Authority'],
          LocalNames: details['Local Name(s) (Sinhala/Tamil)'],
          Venom: details['Venom & Medical Significance'],
          Description: details.Description,
          ConservationStatus: details['Global IUCN Red List Status'],
          FunFact: `This species is from the '${details.Family}' family.`,
          Family: details.Family,
          EndemicStatus: details['Endemic Status'],
          Treatment: (details as any).Treatment || 'Seek immediate medical attention. Contact emergency services or a healthcare professional.',
        };
      } else {
        return {
          error: `Details for "${predictedClass}" not found in offline database.`,
          Animal: predictedClass,
          ScientificName: 'No further details available offline.',
        };
      }
    } catch (e: any) {
      return { error: `Offline Error: ${e.message}` };
    }
  }

  static async identifyOnline(imageAsset: Asset): Promise<AnimalDetails | { error: string }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageAsset.uri,
      type: imageAsset.type || 'image/jpeg',
      name: imageAsset.fileName || 'animal.jpg',
    });
    try {
      const response = await fetch(PREDICTION_API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const apiResponse: any = await response.json();
      if (response.ok && !apiResponse.error) {
        // Map API response keys to AnimalDetails interface
        const mappedDetails: AnimalDetails = {
          Animal: apiResponse.ClassName || apiResponse.CommonEnglishNames || 'Unknown',
          ScientificName: apiResponse.ScientificName || 'Unknown',
          LocalNames: apiResponse.LocalNames,
          Venom: apiResponse.Venom,
          Description: apiResponse.Description || 'No description available',
          ConservationStatus: apiResponse.ConservationStatus || 'Unknown',
          FunFact: apiResponse.FunFact,
          Treatment: apiResponse.Treatment,
          Family: apiResponse.Family,
          EndemicStatus: apiResponse.EndemicStatus,
        };
        return mappedDetails;
      } else {
        return { error: apiResponse.error || 'An unknown API error occurred.' };
      }
    } catch (e: any) {
      return { error: 'Upload failed. Check network and server address.' };
    }
  }
}
