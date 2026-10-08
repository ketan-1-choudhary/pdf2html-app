import { fetchPdfList } from '../db/pdf.fetch.data'
import type { PdfEntity } from './interfaces/pdf.interface'

export async function listPdfs(user_id: string): Promise<PdfEntity[]> {
	return fetchPdfList(user_id)
}
