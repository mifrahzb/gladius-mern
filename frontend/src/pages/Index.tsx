import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {/* Featured Products replaces "Handcrafted Excellence" section */}
        <FeaturedProducts />
        <Features />
        <Testimonials />
      </main>
      <Footer />
      <Newsletter />
    </div>
  );
};

export default Index;