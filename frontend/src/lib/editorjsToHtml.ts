export default function editorjsToHtml(content: string): string {
    try {
        const parsed = JSON.parse(content);
        if (!parsed || !parsed.blocks) return content; // Not an editorjs format

        let html = '';
        for (const block of parsed.blocks) {
            switch (block.type) {
                case 'header':
                    html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                    break;
                case 'paragraph':
                    html += `<p>${block.data.text}</p>`;
                    break;
                case 'list':
                    const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                    const items = block.data.items.map((i: string) => `<li>${i}</li>`).join('');
                    html += `<${tag}>${items}</${tag}>`;
                    break;
                case 'image':
                    html += `<img src="${block.data.file?.url || block.data.url}" alt="${block.data.caption || ''}" />`;
                    if (block.data.caption) {
                        html += `<figcaption>${block.data.caption}</figcaption>`;
                    }
                    break;
                case 'quote':
                    html += `<blockquote>${block.data.text}</blockquote>`;
                    break;
                case 'delimiter':
                    html += `<hr />`;
                    break;
                default:
                    console.log('Unknown block type', block.type);
                    break;
            }
        }
        return html;
    } catch (e) {
        // Fallback to returning the raw string (e.g. if it's legacy markdown)
        return content;
    }
}
