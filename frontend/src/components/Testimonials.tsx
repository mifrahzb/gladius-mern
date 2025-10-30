import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare } from 'lucide-react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        // Set empty array - no API call
        setTestimonials([]);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  // ✅ Safe filter with null checks
  const topReviews = testimonials
    .filter(review => review && typeof review === 'object' && review.rating >= 4)
    .slice(0, 3);

  if (loading) {
    return <div>Loading testimonials...</div>;
  }

  if (topReviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. Here's what knife enthusiasts across the country are saying.
          </p>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-steel transition-premium">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brown text-brown" />
                    ))}
                    {testimonial.verified && (
                      <span className="ml-2 text-xs text-brown font-medium">Verified Purchase</span>
                    )}
                  </div>
                  
                  {/* Testimonial Text */}
                  <blockquote className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.comment}"
                  </blockquote>
                  
                  {/* Customer Info */}
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src="" alt={testimonial.name} />
                      <AvatarFallback className="bg-brown text-slate-dark font-semibold">
                        {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.product}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">Customer reviews will appear here once approved by admin.</p>
          </div>
        )}

        {/* Trust Indicators */}
        {testimonials.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center space-x-8 text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-brown text-brown mr-2" />
                <span className="font-semibold text-brown">
                  {(testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)}/5
                </span>
                <span className="ml-1">Average Rating</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div>
                <span className="font-semibold text-brown">{testimonials.length}</span>
                <span className="ml-1">Reviews</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;