// PDF entity: user_id (PK) + type `PDFDATA#<pdf_id>` (SK)
export interface PdfEntity {
	pdf_id: string
	pdf_name: string
	completed_pages: number
	total_pages: number
}

export interface CreatePdfRequestBody {
	pdf_name?: string
}
