export class UnsplashService {
  private static API_KEY = 'UrY7BUpS9xMkyfu9YmsUetjp5N1YLtcbnRtQ8Wy71xo';
  private static API_URL = 'https://api.unsplash.com/search/photos';

  static async searchImages(query: string, perPage = 1): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&client_id=${this.API_KEY}`, {
        headers: {
          'Accept-Version': 'v1'
        }
      });
      if (!response.ok) {
        console.error('Unsplash API error:', response.status, await response.text());
        return null;
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular || data.results[0].urls.full || null;
      }
      return null;
    } catch (error) {
      console.error('Unsplash API fetch error:', error);
      return null;
    }
  }
}
