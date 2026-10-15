export interface ExportArchive {
	filename: string
	stream: ReadableStream<Uint8Array>
}
