import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Droplets } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';

const ProductCard = ({ product }) => {
  const imageUrl = product.image 
    ? pb.files.getUrl(product, product.image)
    : 'https://images.unsplash.com/photo-1635868388738-8fb178cf3c87?w=600';

  // Determine badge based on category or ingredients
  const isOil = product.category?.toLowerCase().includes('serum') || product.category?.toLowerCase().includes('oil');
  const BadgeIcon = isOil ? Droplets : Leaf;
  const badgeColor = isOil ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground';
  const badgeText = isOil ? 'Botanical Oils' : 'Active Herbs';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group bg-card rounded-[var(--radius)] overflow-hidden shadow-lg hover:shadow-2xl border border-border/50 flex flex-col h-full"
    >
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
            <BadgeIcon className="w-3 h-3 mr-1" />
            {badgeText}
          </span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <span className="text-lg font-medium text-secondary">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
          {product.description || 'Science-backed Ayurvedic formulation for optimal skin health.'}
        </p>

        <Link to={`/product/${product.id}`} className="mt-auto">
          <Button className="w-full rounded-full bg-foreground hover:bg-primary text-background transition-colors py-6">
            View Details
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;