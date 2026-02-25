import { config, fields, collection } from '@keystatic/core'

const postSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  excerpt: fields.text({ label: 'Excerpt', multiline: true }),
  publishedAt: fields.date({ label: 'Published Date' }),
  author: fields.text({ label: 'Author', defaultValue: '이시형' }),
  category: fields.text({ label: 'Category' }),
  tags: fields.array(fields.text({ label: 'Tag' }), {
    label: 'Tags',
    itemLabel: (props) => props.value,
  }),
  coverImage: fields.text({ label: 'Cover Image URL' }),
  content: fields.mdx({ label: 'Content' }),
}

export default config({
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
    ? { kind: 'github', repo: 'writingdeveloper/portfolio' }
    : { kind: 'local' },
  collections: {
    'posts-ko': collection({
      label: '포스트 (한국어)',
      slugField: 'title',
      path: 'content/posts/ko/*',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
    'posts-en': collection({
      label: 'Posts (English)',
      slugField: 'title',
      path: 'content/posts/en/*',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
  },
})
