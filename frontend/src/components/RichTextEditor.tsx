import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = 'Description *',
  placeholder = 'Enter product description...',
  error,
  required = false,
  height = '300px'
}) => {
  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      [{ 'align': [] }],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }]
    ],
    clipboard: {
      matchVisual: false
    }
  };

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'align',
    'color', 'background'
  ];

  return (
    <div className="w-full">
      {label && (
        <Label className="mb-2 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Card className="overflow-hidden">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height }}
          className="bg-background"
        />
      </Card>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {/* Character count helper */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Format your content for better SEO</span>
        <span>{value?.replace(/<[^>]*>/g, '').length || 0} characters</span>
      </div>
    </div>
  );
};

export default RichTextEditor;