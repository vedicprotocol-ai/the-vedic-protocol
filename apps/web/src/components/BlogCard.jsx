import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} state={{ post }} className="blog-card">
    <div className="blog-card__img" aria-hidden="true">
      {post.image ? (
        <img
          src={post.image}
          alt={post.title}
          className="blog-card__img-inner"
          loading="lazy"
        />
      ) : (
        <div className="blog-card__img-placeholder" />
      )}
      <span className={`badge badge-${post.type}`}>
        {post.type === 'research' ? 'Research' : 'Journal'}
      </span>
    </div>
    <div className="blog-card__body">
      <h3 className="blog-card__title">{post.title}</h3>
      <p className="blog-card__excerpt">{post.excerpt}</p>
      <div className="blog-card__meta">
        <span>{post.readTime} min read</span>
        <span>{post.author || 'Dr. Sonam'}</span>
      </div>
    </div>
  </Link>
);

export default BlogCard;
