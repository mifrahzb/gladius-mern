import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Marcus Johnson',
      location: 'Montana Hunter',
      rating: 5,
      text: "This Loveless knife has been my companion on countless hunting trips. The blade holds its edge incredibly well, and the balance is perfect for field dressing. Worth every penny.",
      avatar: 'MJ',
      verified: true,
    },
    {
      name: 'Chef Sarah Chen',
      location: 'Professional Chef, Seattle',
      rating: 5,
      text: "I've used many knives in my 15-year career, but this chef knife is exceptional. The precision and comfort make prep work a joy. My go-to knife in the kitchen.",
      avatar: 'SC',
      verified: true,
    },
    {
      name: 'David Rodriguez',
      location: 'Outdoor Enthusiast, Texas',
      rating: 5,
      text: "The bushcraft knife exceeded my expectations. Built like a tank but with the precision of a scalpel. Perfect for camping and survival situations.",
      avatar: 'DR',
      verified: true,
    },
    {
      name: 'Jennifer Walsh',
      location: 'Home Cook, Colorado',
      rating: 5,
      text: "Beautiful craftsmanship and incredible performance. The mirror polish finish is stunning, and it cuts through everything effortlessly. A true work of art.",
      avatar: 'JW',
      verified: true,
    },
  ];

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
                  "{testimonial.text}"
                </blockquote>
                
                {/* Customer Info */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="" alt={testimonial.name} />
                    <AvatarFallback className="bg-brown text-slate-dark font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
              <div className="inline-flex items-center justify-center space-x-8 text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-brown text-brown mr-2" />
                  <span className="font-semibold text-brown">4.9/5</span>
                  <span className="ml-1">Average Rating</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border" />
                <div>
                  <span className="font-semibold text-brown">1,200+</span>
                  <span className="ml-1">Reviews</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border" />
                <div>
                  <span className="font-semibold text-brown">98%</span>
                  <span className="ml-1">Would Recommend</span>
                </div>
              </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;