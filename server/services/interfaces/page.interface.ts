// Page entity: user_id (PK) + type `PDFDATA#<pdf_id>#<page_num>` (SK)
export interface PageEntity {
	pdf_id: string
	page_num: number
	html: string
	css: string
}

export interface SavePageRequestBody {
	html?: string
	css?: string
	pdf_name?: string
}
