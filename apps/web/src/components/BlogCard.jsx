import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ slug, type, title, excerpt, readTime, author, image }) => {
  return (
    <Link to={`/blog/${slug}`} className="blog-card flex flex-col h-full">
      <div
        className="blog-card__img"
        style={{ backgroundImage: `url(${image})` }}
        role="img"
        aria-label={title}
      >
        <span className={`badge badge-${type} absolute top-4 left-4`}>
          {type === 'research' ? 'Research' : 'Journal'}
        </span>
      </div>
      <div className="blog-card__body flex flex-col flex-grow">
        <h3 className="blog-card__title">{title}</h3>
        <p className="blog-card__excerpt flex-grow">{excerpt}</p>
        <div className="blog-card__meta mt-auto pt-4 border-t border-[var(--line)]">
          <span>{readTime} min read</span>
          <span>{author}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;