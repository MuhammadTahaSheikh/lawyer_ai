// src/components/TemplateEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TemplateEditor = ({ initialValue = '', onChange, availableFields = [] }) => {
  const [value, setValue] = useState(initialValue);
  const quillRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = html => {
    setValue(html);
    if (onChange) onChange(html);
  };

  const insertField = key => {
    const editor = quillRef.current.getEditor();
    const cursorPosition = (editor.getSelection()?.index) ?? value.length;
    editor.insertText(cursorPosition, `{{${key}}}`);
    editor.setSelection(cursorPosition + key.length + 4);
    editor.focus();
  };

  const modules = {
    toolbar: {
      container: '#template-toolbar',
    },
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image'
  ];

  return (
    <div>
      <div id="template-toolbar">
        <select className="ql-header">
          <option value="1" />
          <option value="2" />
          <option defaultValue />
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <select
          onChange={e => {
            if (e.target.value) {
              insertField(e.target.value);
              e.target.selectedIndex = 0;
            }
          }}
        >
          <option value="">Insert field…</option>
          {availableFields.map(f => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Compose your template…"
      />
    </div>
  );
};

export default TemplateEditor;