// OnlyOfficeQuickTest.jsx
import { useEffect, useRef } from "react";

export default function OnlyOfficeQuickTest() {
  const holderRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://docs.louislawgroup.com/web-apps/apps/api/documents/api.js";
    script.onload = () => {
      // Point to your actual file served by your backend's static route
      // server.js already serves /case-documents
      const docUrl =
        "https://dev.louislawgroup.com/case-documents/cases/40292687/docs/Lawsuit-Cover-Letter.docx";

      // Minimal config just to render the editor UI
      /* global DocsAPI */
      new window.DocsAPI.DocEditor(holderRef.current, {
        documentType: "word",
        type: "desktop",
        width: "100%",
        height: "100%",
        document: {
          title: "Lawsuit-Cover-Letter.docx",
          url: docUrl,
          fileType: "docx",
          key: String(Date.now()), // any unique string per open
          permissions: {
            edit: true,   // set to false if you only want to view
            download: true,
            print: true,
          },
        },
        editorConfig: {
          mode: "edit", // or "view"
          customization: { autosave: false }, // no save without callback
          user: { id: "user_1", name: "Tester" },
        },
      });
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  return (
    <div style={{ height: "85vh", border: "1px solid #e0e0e0", borderRadius: 12 }}>
      <div ref={holderRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}