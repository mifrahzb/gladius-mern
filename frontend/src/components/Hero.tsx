import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Award } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brown/20 px-4 py-2 text-sm font-medium text-brown border border-brown/30 backdrop-blur-sm mb-6">
            <Award className="h-4 w-4" />
            Premium Handcrafted Quality
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Master-Crafted
            <span className="block text-brown">Hunting & Chef Knives</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the perfect balance of traditional Pakistani craftsmanship and modern performance. 
            Each knife is meticulously handforged in Wazirabad with premium materials for discerning hunters and chefs in the USA.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="cta" size="xl" className="group">
              Shop Collection
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="steel" size="xl">
              Explore Craftsmanship
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-brown mb-2" />
              <span className="text-sm font-medium text-foreground">Lifetime Warranty</span>
              <span className="text-xs text-muted-foreground">Quality Guaranteed</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-brown mb-2" />
              <span className="text-sm font-medium text-foreground">Master Craftsman</span>
              <span className="text-xs text-muted-foreground">30+ Years Experience</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 flex items-center justify-center text-brown mb-2 font-bold text-sm">PK→US</div>
              <span className="text-sm font-medium text-foreground">Wazirabad Made</span>
              <span className="text-xs text-muted-foreground">Sold in USA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-brown rounded-full flex justify-center">
          <div className="w-1 h-3 bg-brown rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;