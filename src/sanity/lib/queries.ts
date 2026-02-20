import { defineQuery } from 'next-sanity'

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...$limit]{
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    language,
    tags,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, avatar },
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  }`
)

export const POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    excerpt,
    body,
    publishedAt,
    language,
    tags,
    seo,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, bio, avatar, social },
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  }`
)

export const POSTS_BY_CATEGORY_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current) && $categorySlug in categories[]->slug.current] | order(publishedAt desc){
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    language,
    tags,
    "categories": categories[]->{ _id, title, slug },
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  }`
)

export const CATEGORIES_QUERY = defineQuery(
  `*[_type == "category"] | order(title asc){
    _id,
    title,
    slug,
    description
  }`
)

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project"] | order(order asc){
    _id,
    name,
    slug,
    description,
    logo {
      asset->{ _id, url },
    },
    techStack,
    status,
    links,
    featured
  }`
)

export const ALL_POST_SLUGS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`
)
