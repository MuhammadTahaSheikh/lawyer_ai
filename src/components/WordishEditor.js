// src/components/WordishEditor.jsx
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function WordishEditor({ value, onChange }) {
  return (
    <div>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(_, editor) => {
          const html = editor.getData();
          onChange(html);
        }}
      />
    </div>
  );
}