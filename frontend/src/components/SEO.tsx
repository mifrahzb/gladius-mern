// SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  schema?: any;
}

const SEO = ({ 
  title = 'Gladius Traders - Premium Handcrafted Knives',
  description = 'Discover premium handcrafted knives from Wazirabad, Pakistan. Professional chef knives, Damascus steel blades, and traditional cutlery.',
  keywords = ['knives', 'chef knives', 'damascus steel', 'handcrafted knives', 'professional cutlery'],
  image = '/og-image.jpg',
  url,
  type = 'website',
  schema
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const fullUrl = url ?  `${siteUrl}${url}` : window.location.href;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Gladius Traders" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; // Change to default export