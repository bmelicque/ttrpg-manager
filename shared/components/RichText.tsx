import { marked } from "marked";
import DOMPurify from "dompurify";
import { useMemo } from "preact/hooks";

type RichTextProps = {
    content: string;
};

export default function RichText({ content }: RichTextProps) {
    const html = useMemo(() => {
        const parsed = marked.parse(content, { async: false });
        return DOMPurify.sanitize(parsed);
    }, [content]);

    return (
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />
    );
}
