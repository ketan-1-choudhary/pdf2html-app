import assert from 'node:assert/strict'
import { test } from 'node:test'
import { transformPageHtml, validatePageAssetKey } from '../server/utils/page-assets.ts'

const pdfId = 'pdf-123'
const page = 2
const key = `${pdfId}/pages/${page}/assets/files/diagram.png`
const image = source => `<img src="${source}" alt="Diagram">`

test('GET preview URLs become canonical keys on save without changing the input', () => {
	const input = image(key)
	const preview = transformPageHtml(input, pdfId, page, true)
	assert.ok(preview.includes(`/api/pdf/${pdfId}/page/${page}/asset?key=`))
	assert.equal(input, image(key))
	const saved = transformPageHtml(preview, pdfId, page, false)
	assert.equal(saved, transformPageHtml(input, pdfId, page, false))
	assert.ok(!saved.includes('/api/pdf/'))
	assert.equal(transformPageHtml(preview, pdfId, page, true), preview)
})

test('rejects external URLs, wrong pages, nested filenames, and unsafe schemes', () => {
	for (const source of [
		'https://evil.example/image.png', '//evil.example/image.png',
		'http://169.254.169.254/image.png', 'javascript:alert(1)', 'data:image/svg+xml,unsafe',
		'other-pdf/pages/2/assets/files/image.png', 'pdf-123/pages/3/assets/files/image.png',
		'pdf-123/pages/2/assets/files/../image.png', 'pdf-123/pages/2/assets/files/nested/image.png',
		'pdf-123/pages/2/assets/files/image.html', 'pdf-123/pages/2/assets/files/%2e%2e.png',
	]) {
		assert.throws(() => transformPageHtml(image(source), pdfId, page, true), source)
	}
})

test('rejects manipulated proxy routes and query parameters', () => {
	const endpoint = `/api/pdf/${pdfId}/page/${page}/asset`
	for (const source of [
		`/api/pdf/other-pdf/page/2/asset?key=${encodeURIComponent(key)}`,
		`${endpoint}?key=${encodeURIComponent(key)}&key=other.png`,
		`${endpoint}?key=${encodeURIComponent(key)}&bucket=other`,
		`${endpoint}?key=${encodeURIComponent(key)}#fragment`,
	]) {
		assert.throws(() => transformPageHtml(image(source), pdfId, page, false), source)
	}
})

test('keeps normal layout markup and removes executable HTML', () => {
	const output = transformPageHtml(
		'<html><head><style>.page { color: red }</style></head><body><p class="page" onclick="alert(1)">Hello</p><script>alert(1)</script><iframe src="https://evil.example"></iframe></body></html>',
		pdfId, page, true,
	)
	assert.ok(output.includes('<style>.page { color: red }</style>'))
	assert.ok(output.includes('<p class="page">Hello</p>'))
	assert.ok(!/script|onclick|iframe/.test(output))
})

test('validates page identifiers and configured S3 prefix', () => {
	assert.throws(() => validatePageAssetKey(key, '../pdf-123', page))
	assert.throws(() => validatePageAssetKey(key, pdfId, 0))
	const previous = process.env.S3_PREFIX
	try {
		process.env.S3_PREFIX = 'renders/'
		const prefixed = `renders/${key}`
		assert.equal(validatePageAssetKey(prefixed, pdfId, page), prefixed)
		const preview = transformPageHtml(image(prefixed), pdfId, page, true)
		assert.equal(transformPageHtml(preview, pdfId, page, false), transformPageHtml(image(prefixed), pdfId, page, false))
		assert.throws(() => validatePageAssetKey(key, pdfId, page))
	} finally {
		if (previous === undefined) delete process.env.S3_PREFIX
		else process.env.S3_PREFIX = previous
	}
})