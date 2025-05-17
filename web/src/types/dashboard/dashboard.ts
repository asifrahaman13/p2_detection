export type KeyPoint = {
  title: string;
  description: string;
};

export type DocumentData = {
  key_points: string[];
  pdf_name: string;
};

export type Message = {
  message: string;
};

export type UploadedPdfInterface = {
  uploadedPdf: string | null;
  page?: number;
};

export type PDFButtonTypes = {
  associatedFunction: () => void;
  text: string;
  loading: boolean;
};

export type FileMetadata = {
  id: string;
  file_name: string;
  s3_path: string;
  title: string;
};

export type Document = {
  documentName: string;
  document_summary: string;
  documentType: string[];
  documentId: string;
};

export interface State {
  activeButton: "Outline" | "Files";
}

export type Action =
  | { type: "TOGGLE_TO_OUTLINE" }
  | { type: "TOGGLE_TO_FILES" };

export type PresignedUrl = {
  original_pdf: string;
  masked_pdf: string;
};
