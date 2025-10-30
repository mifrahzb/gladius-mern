import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  structuredData?: object;
  canonicalUrl?: string;
}

const SEO = ({ 
  title, 
  description, 
  keywords = [],
  image = '/og-image.jpg', // Default OG image
  url,
  type = 'website',
  structuredData,
  canonicalUrl
}: SEOProps) => {
  const siteName = 'Gladius Traders';
  const defaultTitle = 'Gladius Traders - Handcrafted Knives from Wazirabad, Pakistan';
  const defaultDescription = 'Premium handcrafted knives made by master craftsmen in Wazirabad, Pakistan. Hunting, chef, bushcraft, and custom knives with traditional craftsmanship.';
  
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://gladiustraders.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content={siteName} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Organization Schema - Always include */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteName,
          "url": siteUrl,
          "logo": `${siteUrl}/logo.png`,
          "description": defaultDescription,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Wazirabad",
            "addressCountry": "Pakistan"
          },
          "sameAs": [
            // Add your social media URLs here
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;