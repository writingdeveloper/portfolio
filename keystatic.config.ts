import { config, fields, collection, singleton } from '@keystatic/core'
import categoriesData from './content/categories.json'

const categoryOptions = categoriesData.categories

const postSchema = {
  title: fields.slug({ name: { label: '제목' } }),
  excerpt: fields.text({ label: '요약', multiline: true }),
  publishedAt: fields.date({ label: '발행일' }),
  author: fields.text({ label: '작성자', defaultValue: '이시형' }),
  category: fields.select({
    label: '카테고리',
    options: categoryOptions,
    defaultValue: categoryOptions[0]?.value || 'development',
  }),
  tags: fields.array(fields.text({ label: '태그' }), {
    label: '태그 목록',
    itemLabel: (props) => props.value,
  }),
  coverImage: fields.image({
    label: '커버 이미지',
    directory: 'public/images/posts',
    publicPath: '/images/posts/',
  }),
  content: fields.mdx({ label: '본문' }),
  faqs: fields.array(
    fields.object({
      question: fields.text({ label: '질문' }),
      answer: fields.text({ label: '답변', multiline: true }),
    }),
    {
      label: 'FAQ',
      itemLabel: (props) => props.fields.question.value,
    }
  ),
}

export default config({
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
    ? { kind: 'github', repo: 'writingdeveloper/portfolio' }
    : { kind: 'local' },
  ui: {
    brand: { name: '블로그 관리' },
  },
  collections: {
    'posts-ko': collection({
      label: '포스트 (한국어)',
      slugField: 'title',
      path: 'content/posts/ko/*/',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
    'posts-en': collection({
      label: '포스트 (English)',
      slugField: 'title',
      path: 'content/posts/en/*/',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
  },
  singletons: {
    categories: singleton({
      label: '카테고리 관리',
      path: 'content/categories',
      format: 'json',
      schema: {
        categories: fields.array(
          fields.object({
            value: fields.text({ label: '값 (영문, URL용)' }),
            label: fields.text({ label: '표시 이름' }),
          }),
          {
            label: '카테고리 목록',
            itemLabel: (props) => props.fields.label.value,
          }
        ),
      },
    }),
  },
})
