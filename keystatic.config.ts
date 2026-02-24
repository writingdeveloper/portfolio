import { config, fields, collection } from '@keystatic/core'

export default config({
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
    ? { kind: 'github', repo: 'writingdeveloper/portfolio' }
    : { kind: 'local' },
  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        publishedAt: fields.date({ label: 'Published Date' }),
        author: fields.text({ label: 'Author', defaultValue: '이시형' }),
        category: fields.text({ label: 'Category' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        language: fields.select({
          label: 'Language',
          options: [
            { label: '한국어', value: 'ko' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'ko',
        }),
        coverImage: fields.text({ label: 'Cover Image URL' }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
})
