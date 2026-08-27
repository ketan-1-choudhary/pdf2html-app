// PDF entity: user_id (PK) + type `PDFDATA#<pdf_id>` (SK)
export interface PdfEntity {
	pdf_id: string
	pdf_name: string
}

// Page entity: user_id (PK) + type `PDFDATA#<pdf_id>#<page_num>` (SK)
export interface PageEntity {
	pdf_id: string
	page_num: number
	html: string
	css: string
}

export interface CreatePdfRequestBody {
	pdf_name?: string
}

export interface SavePageRequestBody {
	html?: string
	css?: string
	pdf_name?: string
}
