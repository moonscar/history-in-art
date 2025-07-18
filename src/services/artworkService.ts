import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Artwork, TimeRange } from '../types';

type ArtworkRow = Database['public']['Tables']['artworks']['Row'];
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert'];
type ArtworkUpdate = Database['public']['Tables']['artworks']['Update'];

// Convert database row to frontend Artwork type
const convertToArtwork = (row: ArtworkRow): Artwork => ({
  id: row.id,
  title: row.title,
  artist: row.artist_name || 'Unknown Artist',
  year: row.creation_year || 0,
  period: row.period || 'Unknown Period',
  location: {
    country: row.country || 'Unknown Country',
    city: row.city || 'Unknown City',
    coordinates: [row.longitude || 0, row.latitude || 0] as [number, number]
  },
  imageUrl: row.image_url || 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
  description: row.description || 'No description available',
  movement: Array.isArray(row.tags) ? row.tags.find(tag => tag.includes('movement:'))?.replace('movement:', '') || 'Unknown Movement' : 'Unknown Movement',
  medium: Array.isArray(row.tags) ? row.tags.find(tag => tag.includes('medium:'))?.replace('medium:', '') || 'Unknown Medium' : 'Unknown Medium'
});

// Convert frontend Artwork to database insert format
const convertToInsert = (artwork: Partial<Artwork>): ArtworkInsert => ({
  title: artwork.title || '',
  artist_name: artwork.artist,
  creation_year: artwork.year,
  period: artwork.period,
  country: artwork.location?.country,
  city: artwork.location?.city,
  latitude: artwork.location?.coordinates?.[1],
  longitude: artwork.location?.coordinates?.[0],
  description: artwork.description,
  image_url: artwork.imageUrl,
  tags: [
    ...(artwork.movement ? [`movement:${artwork.movement}`] : []),
    ...(artwork.medium ? [`medium:${artwork.medium}`] : [])
  ]
});

export class ArtworkService {
  // Get all artworks with optional filters
  static async getArtworks(filters?: {
    timeRange?: TimeRange;
    country?: string;
    movement?: string;
    artist?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Artwork[]; count: number }> {
    try {
      let query = supabase
        .from('artworks')
        .select('*', { count: 'exact' })
        .order('map_display_priority', { ascending: false })
        .order('creation_year', { ascending: true });

      // Apply filters
      if (filters?.timeRange) {
        query = query
          .gte('creation_year', filters.timeRange.start)
          .lte('creation_year', filters.timeRange.end);
      }

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      if (filters?.artist) {
        query = query.ilike('artist_name', `%${filters.artist}%`);
      }

      if (filters?.movement) {
        query = query.contains('tags', [`movement:${filters.movement}`]);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching artworks:', error);
        throw error;
      }

      return {
        data: (data || []).map(convertToArtwork),
        count: count || 0
      };
    } catch (error) {
      console.error('Error in getArtworks:', error);
      return { data: [], count: 0 };
    }
  }

  // Get artwork by ID
  static async getArtworkById(id: string): Promise<Artwork | null> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching artwork:', error);
        return null;
      }

      return data ? convertToArtwork(data) : null;
    } catch (error) {
      console.error('Error in getArtworkById:', error);
      return null;
    }
  }

  // Create new artwork
  static async createArtwork(artwork: Partial<Artwork>): Promise<Artwork | null> {
    try {
      const insertData = convertToInsert(artwork);
      
      const { data, error } = await supabase
        .from('artworks')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating artwork:', error);
        throw error;
      }

      return data ? convertToArtwork(data) : null;
    } catch (error) {
      console.error('Error in createArtwork:', error);
      return null;
    }
  }

  // Update artwork
  static async updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork | null> {
    try {
      const updateData = convertToInsert(updates);
      
      const { data, error } = await supabase
        .from('artworks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating artwork:', error);
        throw error;
      }

      return data ? convertToArtwork(data) : null;
    } catch (error) {
      console.error('Error in updateArtwork:', error);
      return null;
    }
  }

  // Delete artwork
  static async deleteArtwork(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting artwork:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteArtwork:', error);
      return false;
    }
  }

  // Get artworks by location
  static async getArtworksByLocation(country: string, timeRange?: TimeRange): Promise<Artwork[]> {
    try {
      let query = supabase
        .from('artworks')
        .select('*')
        .eq('country', country)
        .order('creation_year', { ascending: true });

      if (timeRange) {
        query = query
          .gte('creation_year', timeRange.start)
          .lte('creation_year', timeRange.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching artworks by location:', error);
        return [];
      }

      return (data || []).map(convertToArtwork);
    } catch (error) {
      console.error('Error in getArtworksByLocation:', error);
      return [];
    }
  }

  // Search artworks
  static async searchArtworks(searchTerm: string): Promise<Artwork[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,artist_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('map_display_priority', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching artworks:', error);
        return [];
      }

      return (data || []).map(convertToArtwork);
    } catch (error) {
      console.error('Error in searchArtworks:', error);
      return [];
    }
  }

  // Get unique countries
  static async getCountries(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('country')
        .not('country', 'is', null);

      if (error) {
        console.error('Error fetching countries:', error);
        return [];
      }

      const countries = [...new Set(data.map(item => item.country).filter(Boolean))];
      return countries.sort();
    } catch (error) {
      console.error('Error in getCountries:', error);
      return [];
    }
  }

  // Get unique artists
  static async getArtists(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('artist_name')
        .not('artist_name', 'is', null);

      if (error) {
        console.error('Error fetching artists:', error);
        return [];
      }

      const artists = [...new Set(data.map(item => item.artist_name).filter(Boolean))];
      return artists.sort();
    } catch (error) {
      console.error('Error in getArtists:', error);
      return [];
    }
  }

  // Get unique movements
  static async getMovements(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('tags');

      if (error) {
        console.error('Error fetching movements:', error);
        return [];
      }

      const movements = new Set<string>();
      data.forEach(item => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            if (tag.startsWith('movement:')) {
              movements.add(tag.replace('movement:', ''));
            }
          });
        }
      });

      return Array.from(movements).sort();
    } catch (error) {
      console.error('Error in getMovements:', error);
      return [];
    }
  }
}