import fs from 'fs';
import path from 'path';
import { sampleRequirementsJson1 } from '../src/sampleData/sampleRequirements';
import { createSamplePdfFiles } from '../src/sampleData/samplePdfGenerator';

async function exportPublicSamplePack() {
  const samplePackDir = path.resolve(process.cwd(), 'public', 'sample-pack');
  const docsDir = path.join(samplePackDir, 'documents');

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. Write requirements.json
  fs.writeFileSync(path.join(samplePackDir, 'requirements.json'), sampleRequirementsJson1, 'utf-8');

  // 2. Write sample PDFs
  const pdfs = await createSamplePdfFiles();
  for (const pdf of pdfs) {
    const arrayBuffer = await pdf.arrayBuffer();
    fs.writeFileSync(path.join(docsDir, pdf.name), Buffer.from(arrayBuffer));
  }

  console.log('Public sample pack written to public/sample-pack/');
}

exportPublicSamplePack().catch((err) => {
  console.error(err);
  process.exit(1);
});
