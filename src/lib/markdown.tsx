import type { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

type DirectiveNode = {
    type: "containerDirective" | "leafDirective";
    name?: string;
    data?: {
        hName?: string;
        hProperties?: {
            className?: string;
        };
    };
};

function directiveToDiv() {
    return (tree: Root) => {
        visit(tree, (node) => {
            if (
                node.type === "containerDirective" ||
                node.type === "leafDirective"
            ) {
                const directive = node as DirectiveNode;

                const name = directive.name;
                if (!name) return;

                directive.data = directive.data ?? {};
                directive.data.hName = "div";
                directive.data.hProperties = {
                    className: name,
                };
            }
        });
    };
}

export const markdownComponents: Components = {
    div: ({ className, children, ...props }) => {
        const cls = className ?? "";

        if (cls === "lead") {
            return (
                <div className="text-lg font-medium text-gray-200 mb-4">
                    {children}
                </div>
            );
        }

        if (cls === "quote") {
            return (
                <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 my-6">
                    {children}
                </blockquote>
            );
        }

        if (cls === "caption") {
            return (
                <div className="text-sm text-gray-400 italic mt-2 mb-4 max-w-[80%] ml-auto">
                    {children}
                </div>
            );
        }

        if (cls === "signature") {
            return (
                <div className="text-right italic text-gray-400 mt-6">
                    {children}
                </div>
            );
        }

        return <div {...props}>{children}</div>;
    },
};

export const markdownPlugins = [
    remarkBreaks,
    remarkDirective,
    directiveToDiv,
];