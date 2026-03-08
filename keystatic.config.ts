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
  content: fields.mdx({
    label: '본문',
    options: {
      image: true,
    },
  }),
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
    projects: singleton({
      label: '프로젝트 관리',
      path: 'content/projects',
      format: 'json',
      schema: {
        projects: fields.array(
          fields.object({
            name: fields.text({ label: '프로젝트명' }),
            slug: fields.text({ label: 'URL 슬러그' }),
            descriptionKo: fields.text({ label: '설명 (한국어)', multiline: true }),
            descriptionEn: fields.text({ label: '설명 (English)', multiline: true }),
            techStack: fields.array(fields.text({ label: '기술' }), {
              label: '기술 스택',
              itemLabel: (props) => props.value,
            }),
            status: fields.select({
              label: '상태',
              options: [
                { value: 'active', label: '활성' },
                { value: 'building', label: '개발중' },
                { value: 'launched', label: '출시' },
                { value: 'archived', label: '보관' },
              ],
              defaultValue: 'active',
            }),
            website: fields.text({ label: '웹사이트 URL' }),
            github: fields.text({ label: 'GitHub URL' }),
            featured: fields.checkbox({ label: '메인 페이지 노출' }),
          }),
          {
            label: '프로젝트 목록',
            itemLabel: (props) => props.fields.name.value,
          }
        ),
      },
    }),
    about: singleton({
      label: '소개 페이지',
      path: 'content/about',
      format: 'json',
      schema: {
        skills: fields.array(
          fields.object({
            name: fields.text({ label: '기술명' }),
            category: fields.select({
              label: '카테고리',
              options: [
                { value: 'frontend', label: '프론트엔드' },
                { value: 'backend', label: '백엔드' },
                { value: 'tools', label: '도구' },
              ],
              defaultValue: 'frontend',
            }),
          }),
          {
            label: '기술 스택',
            itemLabel: (props) => props.fields.name.value,
          }
        ),
        timeline: fields.array(
          fields.object({
            date: fields.text({ label: '기간' }),
            titleKo: fields.text({ label: '제목 (한국어)' }),
            titleEn: fields.text({ label: '제목 (English)' }),
            descriptionKo: fields.text({ label: '설명 (한국어)', multiline: true }),
            descriptionEn: fields.text({ label: '설명 (English)', multiline: true }),
            type: fields.select({
              label: '유형',
              options: [
                { value: 'work', label: '경력' },
                { value: 'education', label: '교육' },
                { value: 'project', label: '프로젝트' },
              ],
              defaultValue: 'project',
            }),
          }),
          {
            label: '타임라인',
            itemLabel: (props) => props.fields.titleKo.value,
          }
        ),
      },
    }),
  },
})
