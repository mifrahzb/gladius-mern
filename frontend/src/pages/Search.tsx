import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Mock search results - will be replaced with actual data
  const mockResults = [
    { id: 1, name: 'Hunter Pro Damascus', category: 'Hunting', price: 299, image: '/api/placeholder/200/150' },
    { id: 2, name: 'Chef Master 8"', category: 'Chef', price: 199, image: '/api/placeholder/200/150' },
    { id: 3, name: 'Bushcraft Survival', category: 'Bushcraft', price: 249, image: '/api/placeholder/200/150' },
  ];

  const filteredResults = searchQuery 
    ? mockResults.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Search Products</h1>
          
          {/* Search Bar */}
          <div className="relative mb-12">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for knives by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>

          {/* Results */}
          {searchQuery && (
            <div>
              <p className="text-muted-foreground mb-6">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
              </p>
              
              <div className="space-y-4">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className="cursor-pointer hover:shadow-premium transition-premium"
                      onClick={() => navigate(`/knife/${result.id}`)}
                    >
                      <CardContent className="p-6 flex items-center gap-6">
                        <img 
                          src={result.image} 
                          alt={result.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-2">{result.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{result.category}</p>
                          <p className="text-2xl font-bold text-brown">${result.price}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions when no search */}
          {!searchQuery && (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">Start typing to search our collection</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Hunting', 'Chef', 'Bushcraft', 'Damascus'].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
