import { defineType, defineField } from 'sanity'

export const calloutType = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Tip', value: 'tip' },
          { title: 'Error', value: 'error' },
        ],
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { type: 'type', text: 'text' },
    prepare({ type, text }) {
      return { title: `${type?.toUpperCase()}: ${text?.substring(0, 50)}` }
    },
  },
})
