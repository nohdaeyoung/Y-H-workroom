"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import { useCallback, useRef } from "react";

export type RichEditorVariant = "full" | "compact";

interface RichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  variant?: RichEditorVariant;
  minHeight?: number;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export function RichEditor({
  value,
  onChange,
  placeholder,
  variant = "full",
  minHeight,
  onUploadImage,
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canUploadImage = typeof onUploadImage === "function";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder:
          placeholder ||
          "내용을 입력하세요…  (마크다운 가능: # 제목, **굵게**, - 목록)",
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      handleDrop(view, event) {
        if (!canUploadImage) return false;
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        event.preventDefault();
        (async () => {
          for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) continue;
            const url = await onUploadImage!(file);
            if (!url) continue;
            const endPos = view.state.doc.content.size;
            const imageNode = view.state.schema.nodes.image.create({ src: url });
            view.dispatch(view.state.tr.insert(endPos, imageNode));
          }
        })();
        return true;
      },
      handlePaste(view, event) {
        if (!canUploadImage) return false;
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (!item.type.startsWith("image/")) continue;
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return true;
          onUploadImage!(file).then((url) => {
            if (!url) return;
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src: url })
              )
            );
          });
          return true;
        }
        return false;
      },
    },
  });

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !editor || !canUploadImage) return;
      for (const file of Array.from(files)) {
        const url = await onUploadImage!(file);
        if (url) {
          editor
            .chain()
            .focus("end")
            .insertContent(`<p><img src="${url}" alt="" /></p>`)
            .run();
        }
      }
      e.target.value = "";
    },
    [editor, canUploadImage, onUploadImage]
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="border border-line rounded-md bg-paper px-4 py-3 text-ink-soft text-sm"
        style={{ minHeight: minHeight ?? 120 }}
      >
        에디터 준비 중…
      </div>
    );
  }

  const showFull = variant === "full";

  return (
    <div className="border border-line rounded-md overflow-hidden bg-paper">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-line bg-paper-dark/60">
        <ToolBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="굵게"
        >
          <b>B</b>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="기울임"
        >
          <i>I</i>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="밑줄"
        >
          <u>U</u>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="취소선"
        >
          <s>S</s>
        </ToolBtn>

        {showFull && (
          <>
            <Divider />
            <ToolBtn
              active={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="제목 2"
            >
              H2
            </ToolBtn>
            <ToolBtn
              active={editor.isActive("heading", { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              title="제목 3"
            >
              H3
            </ToolBtn>

            <Divider />
            <ToolBtn
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="목록"
            >
              •
            </ToolBtn>
            <ToolBtn
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="번호 목록"
            >
              1.
            </ToolBtn>
            <ToolBtn
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="인용"
            >
              &ldquo;
            </ToolBtn>

            <Divider />
            <ToolBtn
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="왼쪽 정렬"
            >
              ≡
            </ToolBtn>
            <ToolBtn
              active={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              title="가운데 정렬"
            >
              ≡
            </ToolBtn>
          </>
        )}

        <Divider />
        <ToolBtn
          active={editor.isActive("link")}
          onClick={addLink}
          title="링크"
        >
          🔗
        </ToolBtn>
        {canUploadImage && (
          <>
            <ToolBtn active={false} onClick={addImage} title="이미지 업로드">
              🖼
            </ToolBtn>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        )}

        {showFull && (
          <>
            <Divider />
            <ToolBtn
              active={false}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="구분선"
            >
              ―
            </ToolBtn>
            <ToolBtn
              active={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="코드 블록"
            >
              &lt;/&gt;
            </ToolBtn>
          </>
        )}

        <div className="ml-auto flex items-center gap-1">
          <ToolBtn
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
            title="되돌리기"
          >
            ↩
          </ToolBtn>
          <ToolBtn
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
            title="다시 실행"
          >
            ↪
          </ToolBtn>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="prose-serif max-w-none px-4 py-3 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-ink-soft/60 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:max-w-full"
        style={{ minHeight: minHeight ?? (showFull ? 320 : 120) }}
      />
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
        active
          ? "bg-paper text-ink border border-line"
          : "text-ink-soft hover:bg-paper"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-line mx-1" />;
}
