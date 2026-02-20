export const mdxComponents = {
  h2: (props: any) => (
    <h2 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} className="text-2xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h3: (props: any) => (
    <h3 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} className="text-xl font-semibold mt-8 mb-3 scroll-mt-20" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="text-lg font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: any) => <p className="my-4 leading-relaxed" {...props} />,
  a: (props: any) => (
    <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: (props: any) => <ul className="list-disc pl-6 my-4 space-y-1" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
  li: (props: any) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-3 border-blue-500 pl-4 italic text-gray-400 my-6" {...props} />
  ),
  code: (props: any) => {
    if (props.className) {
      // Fenced code block - className contains language
      return <code {...props} />
    }
    return <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props} />
  },
  pre: (props: any) => (
    <pre className="my-6 rounded-lg overflow-hidden border border-gray-800 p-4 overflow-x-auto bg-gray-900 text-sm" {...props} />
  ),
  img: (props: any) => (
    <figure className="my-8">
      <img className="rounded-lg w-full h-auto" {...props} />
    </figure>
  ),
  strong: (props: any) => <strong className="font-semibold text-gray-100" {...props} />,
  hr: () => <hr className="my-8 border-gray-800" />,
}
