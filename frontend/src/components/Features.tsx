import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Truck, RefreshCw, Users, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Truck,
      title: 'Fast US Shipping',
      description: 'Free shipping on orders over $150. Most orders ship within 1-2 business days.',
      color: 'text-brown',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day return policy. Not satisfied? Return for a full refund, no questions asked.',
      color: 'text-steel',
    },
    {
      icon: Users,
      title: 'Customer Support',
      description: 'Dedicated support team ready to help with any questions about care and maintenance.',
      color: 'text-brown',
    },
    {
      icon: Zap,
      title: 'Premium Materials',
      description: 'Only the finest steels, woods, and handle materials sourced from trusted suppliers.',
      color: 'text-steel',
    },
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Choose Gladius Traders
          </h2>
          <p className="text-lg text-muted-foreground">
            We're committed to delivering exceptional Pakistani craftsmanship and service with every knife we create.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-background hover:shadow-steel transition-premium group">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <feature.icon className={`h-12 w-12 mx-auto ${feature.color} group-hover:scale-110 transition-premium`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;