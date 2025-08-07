import React, { useState, useCallback, useEffect } from 'react';
import { PhotoIcon, SearchIcon, CheckIcon, XIcon } from './Icons';
import { useUserConfig } from '../hooks/useUserConfig';

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  onBackgroundSelect: (imageUrl: string) => void;
  defaultBackgrounds: string[];
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  isOpen,
  onClose,
  currentBackground,
  onBackgroundSelect,
  defaultBackgrounds
}) => {
  const { config, setSearchQuery: saveSearchQuery } = useUserConfig();
  const [searchQuery, setSearchQuery] = useState(config.lastUsedSearchQuery);
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>('');

  const searchUnsplash = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      console.log('Using API key:', accessKey ? `${accessKey.substring(0, 10)}...` : 'Not set');
      
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`, {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Unsplash search error:', err);
      setError(`Search failed: ${err.message}. Using demo results.`);
      
      // Fallback to demo results when API fails
      const demoResults: UnsplashImage[] = [
        {
          id: '1',
          urls: {
            small: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
            regular: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?q=80&w=2070&auto=format&fit=crop'
          },
          alt_description: 'Galaxy spiral',
          user: { name: 'Demo' }
        },
        {
          id: '2',
          urls: {
            small: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400',
            regular: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2070&auto=format&fit=crop'
          },
          alt_description: 'Space stars',
          user: { name: 'Demo' }
        },
        {
          id: '3',
          urls: {
            small: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
            regular: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070&auto=format&fit=crop'
          },
          alt_description: 'Nebula colors',
          user: { name: 'Demo' }
        }
      ];
      setSearchResults(demoResults);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      searchUnsplash(searchQuery);
    }
  }, [searchQuery, searchUnsplash]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    saveSearchQuery(newQuery);
  }, [saveSearchQuery]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  useEffect(() => {
    if (isOpen) {
      // Clear previous search results when modal opens
      setSearchResults([]);
      setError('');
    }
  }, [isOpen]);

  const handleBackgroundSelect = useCallback((imageUrl: string) => {
    onBackgroundSelect(imageUrl);
    onClose();
  }, [onBackgroundSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Select Background</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5 text-gray-300" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type search terms and click Search..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-amber-400">{error}</p>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Default Backgrounds</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {defaultBackgrounds.map((bg, index) => (
                <div
                  key={`default-${index}`}
                  className="relative group cursor-pointer"
                  onClick={() => handleBackgroundSelect(bg)}
                >
                  <img
                    src={bg}
                    alt={`Default background ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-colors"
                  />
                  {currentBackground === bg && (
                    <div className="absolute inset-0 bg-blue-500/30 rounded-lg flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Search Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer"
                    onClick={() => handleBackgroundSelect(image.urls.regular)}
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || 'Background image'}
                      className="w-full h-32 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors flex items-end justify-start p-2">
                      <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        by {image.user.name}
                      </p>
                    </div>
                    {currentBackground === image.urls.regular && (
                      <div className="absolute inset-0 bg-blue-500/30 rounded-lg flex items-center justify-center">
                        <CheckIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Searching for images...</div>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No images found. Try a different search term.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};