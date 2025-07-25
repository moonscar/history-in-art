'use client';

import { useState, useEffect, useCallback } from 'react';
import { Artwork, TimeRange } from '../types';
import { ArtworkService } from '../services/artworkService';

interface UseArtworksOptions {
  timeRange?: TimeRange;
  country?: string;
  movement?: string;
  artist?: string;
  autoFetch?: boolean;
}

interface UseArtworksReturn {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  searchArtworks: (searchTerm: string) => Promise<void>;
  getArtworksByLocation: (country: string, timeRange?: TimeRange) => Promise<Artwork[]>;
}

export const useArtworks = (options: UseArtworksOptions = {}): UseArtworksReturn => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ArtworkService.getArtworks({
        timeRange: options.timeRange,
        country: options.country,
        movement: options.movement,
        artist: options.artist,
        limit: 100 // Reasonable limit for initial load
      });

      setArtworks(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
      console.error('Error fetching artworks:', err);
    } finally {
      setLoading(false);
    }
  }, [options.timeRange, options.country, options.movement, options.artist]);

  const searchArtworks = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchArtworks();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await ArtworkService.searchArtworks(searchTerm);
      setArtworks(results);
      setTotalCount(results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search artworks');
      console.error('Error searching artworks:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchArtworks]);

  const getArtworksByLocation = useCallback(async (country: string, timeRange?: TimeRange): Promise<Artwork[]> => {
    try {
      return await ArtworkService.getArtworksByLocation(country, timeRange);
    } catch (err) {
      console.error('Error fetching artworks by location:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchArtworks();
    }
  }, [fetchArtworks, options.autoFetch]);

  return {
    artworks,
    loading,
    error,
    totalCount,
    refetch: fetchArtworks,
    searchArtworks,
    getArtworksByLocation
  };
};