export type KeyPoint = {
  entity: string;
  description: string;
  replaceWith: string;
};

export type DocumentData = {
  key_points: KeyPoint[];
  pdf_name: string;
  process_type?: string;
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
  status: string;
  timestamp: number;
};

export type Document = {
  documentName: string;
  document_summary: string;
  documentType: string[];
  documentId: string;
};

export interface State {
  activeButton: "OUTLINE" | "RESULT";
}

export type Action =
  | { type: "TOGGLE_TO_OUTLINE" }
  | { type: "TOGGLE_TO_RESULT" };

export type PresignedUrl = {
  original_pdf: string;
  masked_pdf: string;
};
