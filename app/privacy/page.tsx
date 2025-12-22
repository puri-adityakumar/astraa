import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'

export default function PrivacyPolicy() {
    // Read the markdown file
    const filePath = path.join(process.cwd(), 'app/privacy/privacy-policy.md')
    const content = fs.readFileSync(filePath, 'utf8')

    return (
        <div className="w-full max-w-4xl mx-auto">
            <main className="container px-4 py-8 md:py-12">
                <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-background/0 via-background/80 to-background border border-white/5 backdrop-blur-sm">
                    <article className="prose prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-a:text-primary max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                </div>
            </main>
        </div>
    )
}
