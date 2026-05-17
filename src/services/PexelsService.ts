// android/app/src/services/PexelsService.ts
export class PexelsService {
  private static API_KEY = 'aSxN7WRg1tR4RBElG0hpjRVHKngcMk6SECk0XoFYDDidXhdi6FhsWU9v';
  private static API_URL = 'https://api.pexels.com/v1/search';

  static async searchImages(query: string, perPage = 1): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
        headers: {
          Authorization: this.API_KEY,
        },
      });
      if (!response.ok) {
        console.error('Pexels API error:', response.statusText);
        return null;
      }
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.medium || data.photos[0].src.original || null;
      }
      return null;
    } catch (error) {
      console.error('Pexels API fetch error:', error);
      return null;
    }
  }
}
